// const loggerMiddleware = (req, res, next) => {
//   console.log("========== REQUEST RECEIVED ==========");
//   console.log("Time:", new Date().toISOString());
//   console.log("Method:", req.method);
//   console.log("URL:", req.originalUrl);
//   console.log("Headers:", req.headers);
//   console.log("======================================");

//   next();
// };


// export default loggerMiddleware;
import fs from "fs";
import path from "path";

// Ensure logs folder exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, "app.log");



const loggerMiddleware = (req, res, next) => {

  const start = Date.now();

  const log = {
    time: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
  };

  const logMessage = `[${log.time}] ${log.method} ${log.url} — IP: ${log.ip}`;

  // 🔥 Console log
  console.log("========== REQUEST ==========");
  console.log(logMessage);
  console.log("==============================");

  // 🔥 Save to file (non-blocking)
  fs.appendFile(logFile, logMessage + "\n", (err) => {
    if (err) console.error("Log write error:", err);
  });

  // After response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    const responseLog = `✅ ${res.statusCode} | ${duration}ms | ${req.originalUrl}`;

    console.log(responseLog);

    fs.appendFile(logFile, responseLog + "\n", (err) => {
      if (err) console.error("Log write error:", err);
    });
  });

  next(); // 🔑 NON-BLOCKING
};

export default loggerMiddleware;

