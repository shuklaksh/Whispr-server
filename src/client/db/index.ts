import { PrismaClient } from "@prisma/client";

export const prismaClient = new PrismaClient();

prismaClient.$connect().then(() => {
    console.log("Connected to the database");
  });
  
  // Listen for the `beforeExit` event to detect when Prisma is about to disconnect
  process.on('beforeExit', async () => {
    console.log('Prisma is disconnecting from the database');
  });
  
  // Optional: Handle connection errors
  prismaClient.$connect().catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
  
  export default prismaClient;