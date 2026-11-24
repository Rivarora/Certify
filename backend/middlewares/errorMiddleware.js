const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status = err.code === "LIMIT_FILE_SIZE" ? 413 :
    err.message === "Unsupported file type" ? 400 :
    Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500;

  // Log only operational metadata. Error messages/stacks may contain document or account data.
  if (status >= 500) {
    console.error(JSON.stringify({ event: "request_error", status, code: err.code || "INTERNAL_ERROR", method: req.method, route: req.route?.path || req.path }));
  }

  const responses = {
    400: { code: "INVALID_REQUEST", message: "The request could not be processed" },
    401: { code: "UNAUTHORIZED", message: "Authentication required" },
    403: { code: "FORBIDDEN", message: "You are not allowed to perform this action" },
    413: { code: "FILE_TOO_LARGE", message: "Uploaded file exceeds the configured size limit" },
  };
  const error = responses[status] || { code: "INTERNAL_ERROR", message: "An unexpected error occurred" };
  return res.status(status).json({ success: false, error });
};

export default errorMiddleware;
