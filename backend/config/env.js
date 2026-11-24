import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });

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

const parseOrigins = (value) => {
  const origins = (value ?? "http://localhost:5173").split(",").map((item) => item.trim()).filter(Boolean);
  if (!origins.length) throw new Error("FRONTEND_ORIGIN must contain at least one origin");
  return origins.map((origin) => {
    let parsed;
    try { parsed = new URL(origin); } catch { throw new Error("FRONTEND_ORIGIN must contain valid origins"); }
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== origin.replace(/\/$/, "")) {
      throw new Error("FRONTEND_ORIGIN entries must be bare HTTP(S) origins without paths");
    }
    return parsed.origin;
  });
};

const parseUploadLimit = (value) => {
  const megabytes = Number(value ?? 20);
  if (!Number.isInteger(megabytes) || megabytes < 1 || megabytes > 100) {
    throw new Error("UPLOAD_MAX_SIZE_MB must be an integer between 1 and 100");
  }
  return megabytes * 1024 * 1024;
};

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL?.trim(),
  get jwtSecret() { return process.env.JWT_SECRET?.trim(); },
  sessionSecret: process.env.SESSION_SECRET?.trim(),
  frontendOrigins: parseOrigins(process.env.FRONTEND_ORIGIN),
  uploadMaxBytes: parseUploadLimit(process.env.UPLOAD_MAX_SIZE_MB),
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
