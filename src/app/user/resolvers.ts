import axios from "axios";
import { prismaClient } from "../../client/db";
import JWTService from "../../services/jwtService";
import { GraphQLContext } from "../../interfaces";
import { User } from "@prisma/client";
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
    
}

const extraResolvers = {
    User: {
        tweets:  async (parent: User) => {
            const tweets = await prismaClient.tweet.findMany({where: {author: {id: parent.id}}})
            return tweets; 
        }
    }
}

export const resolvers = {queries, mutations, extraResolvers}