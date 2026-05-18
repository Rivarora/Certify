import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // ✅ 1. SESSION CHECK (EJS LOGIN)
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }

    // ✅ 2. API KEY SUPPORT
    const apiKey = req.headers["x-api-key"];
    if (apiKey && apiKey === process.env.API_KEY) {
      return next();
    }

    // ✅ 3. JWT CHECK (API)
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();

  } catch (err) {
    console.error("Auth error:", err.message);

    return res.status(403).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

export default authMiddleware;