import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const unauthorized = (res, message = "Authentication required") => res.status(401).json({
  success: false,
  error: { code: "UNAUTHORIZED", message },
});

export const normalizeUser = (identity) => {
  const id = Number(identity?.id ?? identity?.sub);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return { id, email: typeof identity.email === "string" ? identity.email : undefined };
};

export const verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
  const user = normalizeUser(decoded);
  if (!user) throw new jwt.JsonWebTokenError("Invalid token subject");
  return user;
};

const authMiddleware = (req, res, next) => {
  const sessionUser = normalizeUser(req.session?.user);
  if (sessionUser) {
    req.user = sessionUser;
    return next();
  }

  const authorization = req.get?.("authorization") ?? req.headers?.authorization;
  let token;
  if (authorization) {
    const match = /^Bearer\s+([^\s]+)$/i.exec(authorization);
    if (!match) return unauthorized(res, "Invalid authentication credentials");
    token = match[1];
  } else {
    token = req.cookies?.token;
  }

  if (!token) return unauthorized(res);

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return unauthorized(res, "Invalid or expired authentication credentials");
  }
};

export default authMiddleware;
