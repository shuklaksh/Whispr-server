import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

// Connect to the database once, and handle errors
prismaClient.$connect()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });

// Optional: Listen for `beforeExit` event
process.on('beforeExit', async () => {
  console.log('Prisma is disconnecting from the database');
  await prismaClient.$disconnect();
});

export default prismaClient;
