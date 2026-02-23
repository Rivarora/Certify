import express from "express";
import {
  createCertificate,
  getCertificateById,
  getCertificatesByCompany
} from "../controllers/certificateController.js";

import validateCertificate from "../middlewares/validationMiddleware.js";

const router = express.Router();

// POST → Create certificate
router.post("/certificate", validateCertificate, createCertificate);

// GET → Fetch by ID (Route param)
router.get("/certificate/:id", getCertificateById);

// GET → Filter by query param
router.get("/certificates", getCertificatesByCompany);

export default router;