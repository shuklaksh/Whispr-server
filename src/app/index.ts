import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import bodyParser  from 'body-parser';
import { User } from './user';
import cors from 'cors'
import { GraphQLContext } from '../interfaces';
import JWTService from '../services/jwtService';

export async function serverInit(){
    const app = express();
    app.use(bodyParser.json());
    app.use(cors())


    const graphQLServer = new ApolloServer<GraphQLContext>({
        typeDefs: `
            ${User.types}

            type Query{
                ${User.queries}
            }   
        `,
        resolvers:{
            Query:{
                ...User.resolvers.queries
            },
           
        },
      });
      // Note you must call `start()` on the `ApolloServer`
      // instance before passing the instance to `expressMiddleware`
      await graphQLServer.start();


    app.use("/graphql",expressMiddleware(graphQLServer,{
        context:async ({req,res}) => {
            const authHeader = req.headers?.authorization || req.headers?.authorisation;
            let token = (authHeader as string)?.split("Bearer ")[1];
           

        // If the `authorization` header is present, decode the token, otherwise set `user` to null
        const user = authHeader ? JWTService.decodeToken(token) : null;

        return { user };
        }
    }))
    return app;
}