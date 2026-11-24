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

import dotenv from "dotenv";
dotenv.config();

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

import { connectDB } from "./config/db.js";

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

try {

  await connectDB();

  console.log("✅ MongoDB connected");

}

catch (error) {

  console.log("⚠️ MongoDB not connected");
}

/*
=====================================
CREATE APP
=====================================
*/

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

const PORT = process.env.PORT || 5000;

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

    secret:
      process.env.SESSION_SECRET ||
      "certify_default_secret",

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

server.listen(PORT, () => {

  console.log(
    `🚀 Server running at http://localhost:${PORT}`
  );
});