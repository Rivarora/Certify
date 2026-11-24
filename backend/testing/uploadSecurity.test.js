import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import uploadRoutes from "../routes/uploadRoutes.js";
import errorMiddleware from "../middlewares/errorMiddleware.js";
import { env } from "../config/env.js";
import { validateFileSignature, sanitizeFilename } from "../utils/fileValidation.js";

process.env.JWT_SECRET = "upload_test_secret";

const token = () => jwt.sign({ id: 4 }, process.env.JWT_SECRET);
const app = express();
app.use("/api", uploadRoutes);
app.use(errorMiddleware);

describe("upload request security", () => {
  test("rejects unsupported MIME types", async () => {
    const response = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token()}`)
      .attach("file", Buffer.from("not an image"), { filename: "payload.exe", contentType: "application/x-msdownload" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_REQUEST");
  });

  test("rejects a PDF MIME type with a non-PDF signature", async () => {
    const response = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token()}`)
      .attach("file", Buffer.from("not a PDF document"), { filename: "certificate.pdf", contentType: "application/pdf" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_FILE");
  });

  test("rejects uploads above the configured byte limit", async () => {
    const response = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token()}`)
      .attach("file", Buffer.alloc(env.uploadMaxBytes + 1), { filename: "oversized.pdf", contentType: "application/pdf" });
    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe("FILE_TOO_LARGE");
  });

  test("sanitizes path components and control characters in filenames", () => {
    expect(sanitizeFilename("..\\private\\bad\nname?.pdf")).toBe("bad_name_.pdf");
  });

  test("validates genuine PDF signatures", async () => {
    const result = await validateFileSignature({
      mimetype: "application/pdf",
      originalname: "cert.pdf",
      buffer: Buffer.from("%PDF-1.7\ncontent"),
    });
    expect(result.valid).toBe(true);
  });
});
