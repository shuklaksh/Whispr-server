import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Tweet } from "@prisma/client";
import { GraphQLContext } from "../../interfaces";
import UserService from "../../services/user";
import TweetService, { CreateTweetPayload } from "../../services/tweet";


const s3Client = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
});
const queries = {
    getAllTweets: async (parent: any,args: any, cntx: GraphQLContext) => {
        const tweets = await TweetService.getAllTweet(); 
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
        const tweet  = TweetService.createTweet({...payload, userId: cntx?.user?.id})
        return tweet;
    }
}

const extraResolvers = {
    Tweet: {
        author:  async (parent: Tweet) => {
            const user = await UserService.getUserById(parent?.authorId)
            return user; 
        }
    }
}

export const resolvers = {queries,mutations,extraResolvers}