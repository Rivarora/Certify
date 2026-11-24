const loggerMiddleware = (req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    // Route templates and status codes avoid logging tokens, query values, names, or client IPs.
    const route = req.route?.path || "unmatched";
    console.info(JSON.stringify({
      event: "http_request",
      method: req.method,
      route,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    }));
  });
  next();
};

export default loggerMiddleware;
