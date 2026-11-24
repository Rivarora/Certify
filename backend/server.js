// __dirname fix for ES Modules
import { fileURLToPath } from "url";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
=====================================
ENV
=====================================
*/

import { env, validateServerEnv } from "./config/env.js";

/*
=====================================
CORE IMPORTS
=====================================
*/

import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

/*
=====================================
DB
=====================================
*/

import { checkDatabaseReady, connectDB, disconnectDB } from "./config/db.js";

/*
=====================================
ROUTES
=====================================
*/

import baseRoutes from "./routes/baseRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import domainRoutes from "./routes/domainRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import demoRoutes from "./routes/demoRoutes.js";

/*
=====================================
MIDDLEWARES
=====================================
*/

import loggerMiddleware from "./middlewares/loggerMiddleware.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

/*
=====================================
CONNECT DATABASE
=====================================
*/

validateServerEnv();
await connectDB();
console.log("PostgreSQL connected");

/*
=====================================
CREATE APP
=====================================
*/

const app = express();
app.use(cors({
  origin: env.frontendOrigin,
  credentials: true
}));

const PORT = env.port;

/*
=====================================
BODY PARSER
=====================================
*/

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/*
=====================================
LOGGER
=====================================
*/

app.use(loggerMiddleware);

/*
=====================================
STATIC FILES
=====================================
*/

app.use(express.static(path.join(__dirname, "public")));

/*
=====================================
COOKIE + SESSION
=====================================
*/

app.use(cookieParser());

app.use(

  session({

    secret: env.sessionSecret,

    resave: false,

    saveUninitialized: false,

    cookie: {

      httpOnly: true,

      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

/*
=====================================
VIEW ENGINE
=====================================
*/

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "Views"));

/*
=====================================
ROUTES
=====================================
*/

// Home
app.use("/", baseRoutes);

// Auth
app.use("/api", authRoutes);

// Protected
app.use("/api", certificateRoutes);

app.use("/api", uploadRoutes);

app.use("/api", domainRoutes);

// Demo
app.use("/api/demo", demoRoutes);

/*
=====================================
SESSION DEMO
=====================================
*/

app.get("/session-demo", (req, res) => {

  req.session.visits =
    (req.session.visits || 0) + 1;

  res.cookie("certify_visited", "true", {

    maxAge: 86400000,

    httpOnly: true
  });

  res.json({

    message: "Session demo",

    visits: req.session.visits
  });
});

// Liveness does not depend on downstream services; readiness includes the database.
const healthHandler = (req, res) => res.status(200).json({ status: "ok" });
const readyHandler = async (req, res) => {
  try {
    await checkDatabaseReady();
    res.status(200).json({ status: "ready", checks: { database: "ok" } });
  } catch {
    res.status(503).json({ status: "not_ready", checks: { database: "unavailable" } });
  }
};
app.get("/api/health", healthHandler);
app.get("/api/ready", readyHandler);
// Keep the initial health paths available for existing local integrations.
app.get("/health/live", healthHandler);
app.get("/health/ready", readyHandler);

/*
=====================================
ERROR HANDLER
=====================================
*/
app.use(errorMiddleware);

/*
=====================================
SOCKET.IO
=====================================
*/

const server = http.createServer(app);

const io = new Server(server, {

  cors: {

    origin: "*"
  }
});

app.set("io", io);

io.on("connection", (socket) => {

  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {

    console.log(
      "❌ Client disconnected:",
      socket.id
    );
  });
});

/*
=====================================
START SERVER
=====================================
*/

const listener = server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

let shuttingDown = false;
const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}; shutting down`);
  const forceExit = setTimeout(() => process.exit(1), 10_000);
  forceExit.unref();
  io.close(async () => {
    try {
      await disconnectDB();
      clearTimeout(forceExit);
      process.exit(0);
    } catch (error) {
      console.error("Shutdown cleanup failed");
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export { app, server, listener };
