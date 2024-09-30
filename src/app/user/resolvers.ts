import axios from "axios";
import { prismaClient } from "../../client/db";
import JWTService from "../../services/jwtService";
import { GraphQLContext } from "../../interfaces";
import { User } from "@prisma/client";

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
        const googleToken = token;
        const googleOAuthURL = new URL ("https://oauth2.googleapis.com/tokeninfo");
        googleOAuthURL.searchParams.set('id_token',googleToken)

        const {data} = await axios.get<GoogleTokenResult>(googleOAuthURL.toString(), {
            responseType: 'json'
        }) 

        const user = await prismaClient.user.findUnique({where: {email: data.email}})

        if(!user) {
            await prismaClient.user.create({
                data: {
                    email: data.email!,
                    firstName: data.given_name!,
                    lastName: data.family_name!,
                    profileImageURL: data.picture!,

                }
            })
        }
        const userInDb = await prismaClient.user.findUnique({where: {email: data.email}})
        if(!userInDb) {
            throw new Error("No user found with this email")
        }
        const userToken = await JWTService.generateTokenForUser(userInDb)
        return userToken;
    },
    getCurrentUser: async(parent: any,args: any, cntx: GraphQLContext) => {
        let id =  cntx.user?.id;
        if(!id) return null
        let user = await prismaClient.user.findUnique({where: {email:  cntx.user?.email}})
        return user;
    }
}
const mutations = {
    
}

const extraResolvers = {
    User: {
        tweets:  async (parent: User) => {
            const tweets = prismaClient.tweet.findMany({where: {author: {id: parent.id}}})
            return tweets; 
        }
    }
}

export const resolvers = {queries, mutations, extraResolvers}