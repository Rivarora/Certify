import { jest } from "@jest/globals";
import { validateUpload, validateCertificate } from "../middlewares/validationMiddleware.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// =============================================
// validateUpload
// =============================================

describe("validateUpload — authentication check", () => {

  test("returns 401 when req.user is missing", () => {
    const req = { user: null, query: { socketId: "abc" }, file: { size: 100, mimetype: "application/pdf" } };
    const res = mockRes();
    const next = jest.fn();

    validateUpload(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("validateUpload — socketId check", () => {

  test("returns 400 when socketId is missing", () => {
    const req = { user: { id: 1 }, query: {}, file: { size: 100, mimetype: "application/pdf" } };
    const res = mockRes();
    const next = jest.fn();

    validateUpload(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("socketId") })
    );
  });

  test("returns 400 when socketId is empty string", () => {
    const req = { user: { id: 1 }, query: { socketId: "   " }, file: { size: 100, mimetype: "application/pdf" } };
    const res = mockRes();
    const next = jest.fn();

    validateUpload(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("validateUpload — file presence check", () => {

  test("returns 400 when no file uploaded", () => {
    const req = { user: { id: 1 }, query: { socketId: "abc" }, file: null };
    const res = mockRes();
    const next = jest.fn();

    validateUpload(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "No file uploaded" })
    );
  });
});

describe("validateUpload — file size check", () => {

  test("returns 400 when file exceeds 20MB", () => {
    const req = {
      user: { id: 1 },
      query: { socketId: "abc" },
      file: { size: 21 * 1024 * 1024, mimetype: "application/pdf" }
    };
    const res = mockRes();
    const next = jest.fn();

    validateUpload(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("20MB") })
    );
  });

  test("passes file exactly at 20MB limit", () => {
    const req = {
      user: { id: 1 },
      query: { socketId: "abc" },
      file: { size: 20 * 1024 * 1024, mimetype: "application/pdf" }
    };
    const res = mockRes();
    const next = jest.fn();

    validateUpload(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe("validateUpload — file type check", () => {

  test("allows PDF files", () => {
    const req = {
      user: { id: 1 },
      query: { socketId: "abc" },
      file: { size: 1000, mimetype: "application/pdf" }
    };
    const res = mockRes();
    const next = jest.fn();

    validateUpload(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("allows TXT files", () => {
    const req = {
      user: { id: 1 },
      query: { socketId: "abc" },
      file: { size: 1000, mimetype: "text/plain" }
    };
    const res = mockRes();
    const next = jest.fn();

    validateUpload(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("allows DOCX files", () => {
    const req = {
      user: { id: 1 },
      query: { socketId: "abc" },
      file: {
        size: 1000,
        mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      }
    };
    const res = mockRes();
    const next = jest.fn();

    validateUpload(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("rejects image files (JPG)", () => {
    const req = {
      user: { id: 1 },
      query: { socketId: "abc" },
      file: { size: 1000, mimetype: "image/jpeg" }
    };
    const res = mockRes();
    const next = jest.fn();

    validateUpload(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("PDF, TXT, DOCX") })
    );
  });

  test("rejects EXE files", () => {
    const req = {
      user: { id: 1 },
      query: { socketId: "abc" },
      file: { size: 1000, mimetype: "application/x-msdownload" }
    };
    const res = mockRes();
    const next = jest.fn();

    validateUpload(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// =============================================
// validateCertificate
// =============================================

describe("validateCertificate — required fields", () => {

  const validBody = {
    name: "John Doe",
    email: "john@example.com",
    company: "Google",
    role: "Intern",
    duration: "3 months"
  };

  test("passes with all valid fields", () => {
    const req = { body: { ...validBody } };
    const res = mockRes();
    const next = jest.fn();

    validateCertificate(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("returns 400 when name is missing", () => {
    const req = { body: { ...validBody, name: "" } };
    const res = mockRes();
    const next = jest.fn();

    validateCertificate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when email is missing", () => {
    const req = { body: { ...validBody, email: "" } };
    const res = mockRes();
    const next = jest.fn();

    validateCertificate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("validateCertificate — email format", () => {

  test("returns 400 for invalid email format", () => {
    const req = {
      body: {
        name: "John",
        email: "not-an-email",
        company: "Google",
        role: "Intern",
        duration: "3 months"
      }
    };
    const res = mockRes();
    const next = jest.fn();

    validateCertificate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Invalid email format" })
    );
  });

  test("accepts valid email with subdomain", () => {
    const req = {
      body: {
        name: "John",
        email: "john@mail.company.com",
        company: "Google",
        role: "Intern",
        duration: "2 months"
      }
    };
    const res = mockRes();
    const next = jest.fn();

    validateCertificate(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe("validateCertificate — duration format", () => {

  test("returns 400 when duration does not include 'month'", () => {
    const req = {
      body: {
        name: "John",
        email: "john@example.com",
        company: "Google",
        role: "Intern",
        duration: "45 days"
      }
    };
    const res = mockRes();
    const next = jest.fn();

    validateCertificate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("month") })
    );
  });
});