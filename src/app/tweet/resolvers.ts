import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";
import { GraphQLContext } from "../../interfaces";

interface CreateTweetPayload{
    content: string
    imageURL?: string
}
const queries = {
    getAllTweets: async (parent: any,args: any, cntx: GraphQLContext) => {
        if(!cntx.user) throw new Error("You're not logged in");
        const tweets = await prismaClient.tweet.findMany({orderBy: {createdAt: 'desc'}});
        return tweets;
    }
}

const mutations = { 
    createTweet: async (parent: any,{payload}: {payload: CreateTweetPayload}, cntx: GraphQLContext) => {
        if(!cntx.user) throw new Error("You are not authenticated");
        const tweet = await prismaClient.tweet.create({
            data: {
                content: payload.content,
                imageURL: payload.imageURL, 
                author: {connect: {id: cntx.user.id}}
            }
        })
        return tweet 
        
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