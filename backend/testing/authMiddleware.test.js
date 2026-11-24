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

// =============================================
// SESSION AUTH
// =============================================

describe("authMiddleware — session auth", () => {

  test("passes when valid session user exists", () => {
    const req = { session: { user: { id: 1, email: "a@b.com" } }, headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 1, email: "a@b.com" });
  });

  test("does not block when session is present — skips JWT check", () => {
    const req = { session: { user: { id: 2 } }, headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
  });
});

// =============================================
// API KEY AUTH
// =============================================

describe("authMiddleware — API key auth", () => {

  test("passes when correct API key is provided", () => {
    process.env.API_KEY = "supersecretkey";
    const req = { session: {}, headers: { "x-api-key": "supersecretkey" } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("does not pass with wrong API key — falls through to JWT", () => {
    process.env.API_KEY = "supersecretkey";
    const req = { session: {}, headers: { "x-api-key": "wrongkey" } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// =============================================
// JWT AUTH
// =============================================

describe("authMiddleware — JWT auth", () => {

  // Silence console.error — middleware logs auth failures intentionally
  let consoleSpy;
  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("passes with valid Bearer token", () => {
    const token = jwt.sign(
      { id: 99, email: "test@test.com" },
      process.env.JWT_SECRET
    );
    const req = {
      session: {},
      headers: { authorization: `Bearer ${token}` }
    };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(99);
    expect(req.user.email).toBe("test@test.com");
  });

  test("returns 401 when no Authorization header", () => {
    const req = { session: {}, headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 when Authorization header has no Bearer prefix", () => {
    const req = {
      session: {},
      headers: { authorization: "sometoken123" }
    };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("returns 403 when token is expired", async () => {
    const token = jwt.sign(
      { id: 1, email: "a@b.com" },
      process.env.JWT_SECRET,
      { expiresIn: "1ms" }
    );

    await new Promise(r => setTimeout(r, 10));

    const req = {
      session: {},
      headers: { authorization: `Bearer ${token}` }
    };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 when token is tampered with", () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
    const tampered = token.slice(0, -5) + "XXXXX";

    const req = {
      session: {},
      headers: { authorization: `Bearer ${tampered}` }
    };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("returns 403 when token signed with wrong secret", () => {
    const token = jwt.sign({ id: 1 }, "wrong_secret");
    const req = {
      session: {},
      headers: { authorization: `Bearer ${token}` }
    };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});