import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),   // ← required for CLI (db push, migrate, etc.)
  },
  adapter: () => new PrismaPg(pool),
});