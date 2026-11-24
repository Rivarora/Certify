import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const parsePort = (value) => {
  const port = Number(value ?? 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return port;
};

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL?.trim(),
  get jwtSecret() { return process.env.JWT_SECRET?.trim(); },
  sessionSecret: process.env.SESSION_SECRET?.trim(),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  get apiKey() { return process.env.API_KEY; },
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
});

export const validateServerEnv = () => {
  required("DATABASE_URL");
  required("JWT_SECRET");
  required("SESSION_SECRET");
};

export const validateDatabaseEnv = () => required("DATABASE_URL");
