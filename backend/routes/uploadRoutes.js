import express from "express";
import multer from "multer";

import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadRateLimiter } from "../middlewares/securityMiddleware.js";
import { validateUploadedFile } from "../utils/fileValidation.js";
import { uploadController } from "../controllers/uploadController.js";
import { env } from "../config/env.js";

const router = express.Router();

/*
=====================================
MULTER MEMORY STORAGE
=====================================
*/

const storage = multer.memoryStorage();

/*
=====================================
FILE FILTER
=====================================
*/

const fileFilter = (req, file, cb) => {

  const allowedTypes = [

    "application/pdf",

    "text/plain",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "image/png",

    "image/jpeg",

    "image/jpg"
  ];

  if (allowedTypes.includes(file.mimetype)) {

    cb(null, true);
  }

  else {

    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.uploadMaxBytes,
    files: 1,
  }
});

/*
=====================================
ROUTE
=====================================
*/

router.post(
  "/upload",
  uploadRateLimiter,
  authMiddleware,
  upload.single("file"),
  validateUploadedFile,
  uploadController
);

export default router;
