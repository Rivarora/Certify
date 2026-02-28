const authMiddleware = (req, res, next) => {

  try {

    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key missing"
      });
    }

    if (apiKey !== "12345") {
      return res.status(403).json({
        success: false,
        message: "Invalid API key"
      });
    }

    next();

  } catch (error) {

    next(error);

  }

};

export default authMiddleware;