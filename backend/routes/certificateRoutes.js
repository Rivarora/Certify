import express from "express";

import {
  createCertificate,
  getCertificateById,
  getCertificatesByCompany,
  getAllCertificates,
  deleteCertificate,
} from "../controllers/certificateController.js";

import { validateCertificate } from "../middlewares/validationMiddleware.js"; // ✅ FIXED
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
=====================================================
📌 CERTIFICATE ROUTES
=====================================================
*/

// Create certificate
router.post(
  "/certificate",
  authMiddleware,
  validateCertificate,
  createCertificate
);

// Get certificate by ID
router.get(
  "/certificate/:id",
  authMiddleware,
  getCertificateById
);

// Get certificates by company
router.get(
  "/certificates",
  authMiddleware,
  getAllCertificates
);
// DELETE /api/certificate/:id   → Delete a certificate
router.delete(
  "/certificate/:id",
  authMiddleware,
  deleteCertificate
);

export default router;