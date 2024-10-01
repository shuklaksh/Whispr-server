import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Tweet } from "@prisma/client";
import dotenv from 'dotenv';
import { prismaClient } from "../../client/db";
import { GraphQLContext } from "../../interfaces";
dotenv.config();

interface CreateTweetPayload{
    content: string
    imageURL?: string
}

const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {accessKeyId: process.env.AWS_ACCESS_KEY! , secretAccessKey: process.env.AWS_SECRET_KEY!}
});
const queries = {
    getAllTweets: async (parent: any,args: any, cntx: GraphQLContext) => {
        if(!cntx.user) throw new Error("You're not logged in");
        const tweets = await prismaClient.tweet.findMany({orderBy: {createdAt: 'desc'}});
        return tweets;
    },
    getSignedURL:  async (parent: any,{imageType}: {imageType: string}, cntx: GraphQLContext) => {
        if(!cntx.user || !cntx.user.id) throw new Error("You're not authenticated");
        const validImageType = ['jpeg','jpg', 'png', 'webp'];
        if(!validImageType.includes(imageType)) throw new Error("Invalid Image type");
        const putObjectCommand = new PutObjectCommand({
            Bucket: "whispr-dev",
            Key: `uploads/${cntx.user.id}/tweets/${Date.now().toString()}.${imageType}`
        })

        const signedUrl = getSignedUrl(s3Client,putObjectCommand);
        return signedUrl
    }
}

const mutations = { 
    createTweet: async (parent: any,{payload}: {payload: CreateTweetPayload}, cntx: GraphQLContext) => {
        if(!cntx.user) throw new Error("You are not authenticated");
        
        try{
            const tweet = await prismaClient.tweet.create({
                data: {
                    content: payload.content,
                    imageURL: payload.imageURL, 
                    author: {connect: {id: cntx.user.id}}
                }
            })
            return tweet 
        }
        catch(err) {
            console.log(err);
            return null;
        }
        
        
    }
}

const extraResolvers = {
    Tweet: {
        author:  async (parent: Tweet) => {
            const user = await prismaClient.user.findUnique({where: {id: parent?.authorId}})
            return user; 
        }
    }
}

export const resolvers = {queries,mutations,extraResolvers}