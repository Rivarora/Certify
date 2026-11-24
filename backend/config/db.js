import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "./env.js";

const pool = new pg.Pool({ connectionString: env.databaseUrl });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export const connectDB = async () => {
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
};

export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
  } finally {
    await pool.end();
  }
};

export const checkDatabaseReady = async () => {
  await prisma.$queryRaw`SELECT 1`;
};

export default prisma;
