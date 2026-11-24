import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/authMiddleware.js";

process.env.JWT_SECRET = "test_secret_key";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authMiddleware", () => {
  test("accepts a valid session identity", () => {
    const req = { session: { user: { id: 1, email: "a@example.test" } }, headers: {} };
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 1, email: "a@example.test" });
  });

  test("rejects a session with an invalid user id", () => {
    const req = { session: { user: { id: "not-an-id" } }, headers: {} };
    const res = mockRes();
    authMiddleware(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("rejects missing credentials with a standard 401 body", () => {
    const res = mockRes();
    authMiddleware({ session: {}, headers: {} }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    });
  });

  test("rejects an invalid bearer token with 401", () => {
    const res = mockRes();
    authMiddleware({ session: {}, headers: { authorization: "Bearer bad.token" } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("rejects an expired bearer token with 401", () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: "-1s" });
    const res = mockRes();
    authMiddleware({ session: {}, headers: { authorization: `Bearer ${token}` } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("accepts a valid bearer token and ignores body identity fields", () => {
    const token = jwt.sign({ id: 42, email: "owner@example.test" }, process.env.JWT_SECRET);
    const req = { session: {}, headers: { authorization: `Bearer ${token}` }, body: { userId: 99 } };
    const next = jest.fn();
    authMiddleware(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(42);
    expect(req.body.userId).toBe(99);
  });

  test("accepts the HttpOnly token cookie", () => {
    const token = jwt.sign({ id: 42 }, process.env.JWT_SECRET);
    const req = { session: {}, headers: {}, cookies: { token } };
    const next = jest.fn();
    authMiddleware(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(42);
  });
});
