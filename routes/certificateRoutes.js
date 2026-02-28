import express from "express";

import {
  createCertificate,
  getCertificateById,
  getCertificatesByCompany
} from "../controllers/certificateController.js";

import validateCertificate from "../middlewares/validationMiddleware.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST → Create certificate
router.post(
  "/certificate",
  authMiddleware,
  validateCertificate,
  createCertificate
);

// GET → Fetch by ID
router.get(
  "/certificate/:id",
  authMiddleware,
  getCertificateById
);

// GET → Filter by company
router.get(
  "/certificates",
  authMiddleware,
  getCertificatesByCompany
);

export default router;