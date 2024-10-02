import { User } from "@prisma/client";
import prismaClient from "../../client/db";
import { GraphQLContext } from "../../interfaces";
import UserService from "../../services/user";

interface GoogleTokenResult{
    iss?: string,
    azp?: string,
    aud?: string,
    sub?: string,
    email?: string,
    email_verified?: string,
    nbf?: string,
    name?: string,
    picture?: string,
    given_name?: string,
    family_name?: string,
    iat?: string,
    exp?: string,
    jti?: string,
    alg?: string,
    kid?: string,
    typ?: string,
}
const queries = {
    verifyGoogleToken: async(parent: any,{token}: {token:string} )=>{
        const userToken = await UserService.verifyGoogleAuthToken(token)
        return userToken;
    },
    getCurrentUser: async(parent: any,args: any, cntx: GraphQLContext) => {
        let id =  cntx.user?.id;
        if(!id) return null
        let user = await UserService.getUserById(id);
        return user;
    },
    getUserById: async(parent: any,{id}: {id: string}, cntx: GraphQLContext) => {
        let user =  await UserService.getUserById(id);
        return user;
    }
}
const mutations = {
    followUser: async (parent: any,{to}: {to: string}, cntx: GraphQLContext) => {
        if(!cntx?.user || !cntx?.user?.id) return "You're not logged in";
        await UserService.followUser(cntx.user.id, to)
        return true;
    },
    unFollowUser: async (parent: any,{to}: {to: string}, cntx: GraphQLContext) => {
        if(!cntx?.user || !cntx?.user?.id) return "You're not logged in";
        await UserService.unFollowUser(cntx.user.id, to)
        return true;
    }
}

const extraResolvers = {
    User: {
        tweets:  async (parent: User) => {
            const tweets = await prismaClient.tweet.findMany({where: {author: {id: parent.id}}})
            return tweets; 
        },
        followers:  async (parent: User) => {
            const result = await prismaClient.follows.findMany({where: {following: {id: parent.id}},
            include : {
                follower: true
            }})
            return result.map(follow => follow.follower);
        },
        following:  async (parent: User) => {
            const result = await prismaClient.follows.findMany({where: {follower: {id: parent.id}},
                include : {
                    following: true
                }})
                return result.map(follow => follow.following); 
        }
    }
}

export const resolvers = {queries, mutations, extraResolvers}