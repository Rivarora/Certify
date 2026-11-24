import express from "express";
import multer from "multer";

import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadController } from "../controllers/uploadController.js";

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
    fileSize: 20 * 1024 * 1024
  }
});

/*
=====================================
ROUTE
=====================================
*/

router.post(
  "/upload",
  // authMiddleware,
  upload.single("file"),
  uploadController
);

export default router;