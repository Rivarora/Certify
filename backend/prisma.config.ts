import { defineConfig, env } from "prisma/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env as appEnv, validateDatabaseEnv } from "./config/env.js";

validateDatabaseEnv();

const pool = new pg.Pool({
  connectionString: appEnv.databaseUrl,
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
  adapter: () => new PrismaPg(pool),
});
