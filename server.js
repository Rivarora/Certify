import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import certificateRoutes from "./routes/certificateRoutes.js";
import baseRoutes from "./routes/baseRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";   
import domainRoutes from "./routes/domainRoutes.js";   

import loggerMiddleware from "./middlewares/loggerMiddleware.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Parse JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Logger middleware (YOUR PART)
app.use(loggerMiddleware);


// Base routes
app.use("/", baseRoutes);

// Certificate routes
app.use("/api", certificateRoutes);

// Upload routes
app.use("/api", uploadRoutes);

// Domain routes 
app.use("/api", domainRoutes);



app.use(errorMiddleware);



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
