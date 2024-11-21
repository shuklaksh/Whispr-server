import { Tweet } from "@prisma/client";
import { GraphQLContext } from "../../interfaces";
import UserService from "../../services/user";
import TweetService, { CreateTweetPayload } from "../../services/tweet";
import { supabase } from "../../supabase";

const queries = {
  getAllTweets: async (parent: any, args: any, cntx: GraphQLContext) => {
    const tweets = await TweetService.getAllTweet();
    return tweets;
  },

  getSignedURL: async (
    parent: any,
    { imageType }: { imageType: string },
    cntx: GraphQLContext
  ) => {
    // Ensure the user is authenticated
    if (!cntx.user || !cntx.user.id) {
      throw new Error("You're not authenticated");
    }
  
    // Validate the image type
    const validImageTypes = ['jpeg', 'jpg', 'png', 'webp'];
    if (!validImageTypes.includes(imageType)) {
      throw new Error("Invalid image type");
    }
  
    // Define the file path within the 'uploads' folder
    const filePath = `uploads/${cntx.user.id}/tweets/${Date.now().toString()}.${imageType}`;
  
    // Generate the signed URL for the client to upload the image
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("images") // 'images' is your Supabase storage bucket
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // URL valid for 1 year
  
    if (signedUrlError) {
      console.error("Error creating signed URL:", signedUrlError.message);
      throw new Error("Failed to generate signed URL");
    }
  
    return {
      getSignedURL: signedUrlData.signedUrl, // The signed URL to upload the file to Supabase
    };
  }
};

const mutations = {
  createTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetPayload },
    cntx: GraphQLContext
  ) => {
    if (!cntx.user) throw new Error("You are not authenticated");
    const tweet = TweetService.createTweet({
      ...payload,
      userId: cntx?.user?.id,
    });
    return tweet;
  },
};

const extraResolvers = {
  Tweet: {
    author: async (parent: Tweet) => {
      const user = await UserService.getUserById(parent?.authorId);
      return user;
    },
  },
};

export const resolvers = { queries, mutations, extraResolvers };
