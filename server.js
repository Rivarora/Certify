require("dotenv").config();
const express = require("express");
const path = require("path");

// Import routes
const baseRoutes = require("./routes/baseRoutes");

// Import middlewares
const loggerMiddleware = require("./middlewares/loggerMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   APPLICATION-LEVEL MIDDLEWARE
========================= */

// Parse JSON body
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Logger middleware (your main demo part)
app.use(loggerMiddleware);

/* =========================
   ROUTES
========================= */

app.use("/", baseRoutes);

/* =========================
   ERROR HANDLING MIDDLEWARE
========================= */

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});