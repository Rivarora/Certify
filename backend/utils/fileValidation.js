import path from "node:path";
import mammoth from "mammoth";

const MIME_EXTENSIONS = new Map([
  ["application/pdf", [".pdf"]],
  ["text/plain", [".txt"]],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", [".docx"]],
  ["image/png", [".png"]],
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/jpg", [".jpg", ".jpeg"]],
]);

export const sanitizeFilename = (filename) => {
  const basename = path.posix.basename(String(filename || "document").replace(/\\/g, "/"));
  const safe = basename
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, "_")
    .replace(/[^a-zA-Z0-9._ ()-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .slice(0, 150);
  return safe && safe !== "." ? safe : "document";
};

export const validateFileSignature = async (file) => {
  if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
    return { valid: false, message: "No file uploaded" };
  }

  const extensions = MIME_EXTENSIONS.get(file.mimetype);
  if (!extensions) return { valid: false, message: "Unsupported file type" };

  const extension = path.extname(sanitizeFilename(file.originalname)).toLowerCase();
  if (!extensions.includes(extension)) {
    return { valid: false, message: "File extension does not match its declared type" };
  }

  const buffer = file.buffer;
  if (file.mimetype === "application/pdf") {
    return buffer.subarray(0, 5).toString("ascii") === "%PDF-"
      ? { valid: true }
      : { valid: false, message: "File content does not match PDF format" };
  }

  if (file.mimetype === "image/png") {
    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(signature)
      ? { valid: true }
      : { valid: false, message: "File content does not match PNG format" };
  }

  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
      ? { valid: true }
      : { valid: false, message: "File content does not match JPEG format" };
  }

  if (file.mimetype === "text/plain") {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch {
      return { valid: false, message: "Text file must contain valid UTF-8 text" };
    }
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(buffer.toString("utf8"))) {
      return { valid: false, message: "Text file contains binary data" };
    }
    return { valid: true };
  }

  // ZIP magic alone is not enough: confirm Mammoth can read an OOXML document.
  const isZip = buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b &&
    [0x03, 0x05, 0x07].includes(buffer[2]) && [0x04, 0x06, 0x08].includes(buffer[3]);
  if (!isZip) return { valid: false, message: "File content does not match DOCX format" };
  try {
    await mammoth.extractRawText({ buffer });
    return { valid: true };
  } catch {
    return { valid: false, message: "DOCX file is invalid or unreadable" };
  }
};

export const validateUploadedFile = async (req, res, next) => {
  const result = await validateFileSignature(req.file);
  if (!result.valid) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_FILE", message: result.message },
    });
  }
  req.file.originalname = sanitizeFilename(req.file.originalname);
  next();
};
