import { normalizeUser, verifyAccessToken } from "./authMiddleware.js";

const authError = (message) => {
  const error = new Error(message);
  error.data = { code: "UNAUTHORIZED" };
  return error;
};

export const createSocketAuthMiddleware = () => (socket, next) => {
  const sessionUser = normalizeUser(socket.request.session?.user);
  if (sessionUser) {
    socket.data.user = sessionUser;
    return next();
  }

  const authorization = socket.handshake.headers?.authorization;
  const bearer = /^Bearer\s+([^\s]+)$/i.exec(authorization || "");
  const token = socket.handshake.auth?.token || bearer?.[1] || socket.request.cookies?.token;
  if (!token) return next(authError("Authentication required"));

  try {
    socket.data.user = verifyAccessToken(token);
    return next();
  } catch {
    return next(authError("Invalid or expired authentication credentials"));
  }
};
