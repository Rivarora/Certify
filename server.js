import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import certificateRoutes from "./routes/certificateRoutes.js";
import baseRoutes from "./routes/baseRoutes.js";

import loggerMiddleware from "./middlewares/loggerMiddleware.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   FIX __dirname for ES Module
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   APPLICATION-LEVEL MIDDLEWARE
========================= */

app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Logger middleware
app.use(loggerMiddleware);

/* =========================
   ROUTES
========================= */

app.use("/", baseRoutes);
app.use("/api", certificateRoutes);

/* =========================
   ERROR HANDLING MIDDLEWARE
========================= */

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});