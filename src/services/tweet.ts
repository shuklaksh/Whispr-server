import prismaClient from "../client/db"

export interface CreateTweetPayload{
    content: string
    imageURL?: string
    userId? : string
}

class TweetService {
    public static async createTweet(data: CreateTweetPayload) {
        const tweet = await prismaClient.tweet.create({
            data: {
                content: data.content,
                imageURL: data.imageURL, 
                author: {connect: {id: data.userId}}
            }
        })
        return tweet 
    }

    public static async getAllTweet() {
        const tweets = await prismaClient.tweet.findMany({orderBy: {createdAt: 'desc'}});
        return tweets; 
    }
}

export default TweetService;