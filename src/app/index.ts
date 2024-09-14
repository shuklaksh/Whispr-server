import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import bodyParser  from 'body-parser';
import { User } from './user';

export async function serverInit(){
    const app = express();
    app.use(bodyParser.json());


    const graphQLServer = new ApolloServer({
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


    app.use("/graphql",expressMiddleware(graphQLServer))
    return app;
}