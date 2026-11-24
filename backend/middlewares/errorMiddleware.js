

const errorMiddleware = (err, req, res, next) => {

  console.error("========== ERROR ==========");
  console.error("Message :", err.message);
  console.error("Stack   :", err.stack);
  console.error("===========================");

  // 🔴 1. Multer file type errors
  if (err.message === "Only PDF, TXT, DOCX files allowed") {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // 🔴 2. Multer size limit error (important addition)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large"
    });
  }

  // 🔴 3. JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token"
    });
  }

  // 🔴 4. Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // 🔴 5. Default fallback
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

export default errorMiddleware;

