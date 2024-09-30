export const types = `#graphql
    input CreateTweet{
        content: String!
        imageURL: String
    }

    type Tweet {
        id: ID!
        content: String!
        imageURL: String
        author: User!
    }

   

`;
