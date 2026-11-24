import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  homeController,
  statusController
} from "../controllers/baseController.js";

const router = express.Router();

/*
=====================================
📌 BASIC ROUTES
=====================================
*/

// Home
router.get("/", homeController);

// Status
router.get("/status", statusController);

// Upload Page
router.get("/upload", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/api/login");
  }
  res.render("upload");
});

// ✅ RESULT PAGE (FIXED 🔥)
router.get("/result", (req, res) => {
  res.render("result");
});

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const { company, riskLevel, startDate, endDate, search } = req.query;

    const where = { userId: req.user.id };
    if (company)   where.company   = { contains: company,   mode: "insensitive" };
    if (riskLevel) where.riskLevel = riskLevel;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate)   where.createdAt.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { name:    { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { email:   { contains: search, mode: "insensitive" } },
        { role:    { contains: search, mode: "insensitive" } },
      ];
    }

    const { default: prisma } = await import("../config/db.js");

    const certificates = await prisma.certificate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, company: true,
        role: true, duration: true, riskScore: true,
        riskLevel: true, reasons: true, createdAt: true,
      },
    });

    res.render("history", {
      certificates,
      filters: { company, riskLevel, startDate, endDate, search },
      error: null,
    });

  } catch (err) {
    res.render("history", {
      certificates: [],
      filters: {},
      error: "Failed to load history. Please try again.",
    });
  }
});


// Random test route
router.get("/random", authMiddleware, (req, res) => {
  const randomNumber = Math.floor(Math.random() * 100);
  res.json({
    message: "Random route working",
    number: randomNumber
  });
});



/*
=====================================
📌 ERROR DEMO
=====================================
*/
router.get("/api/error", authMiddleware, (req, res, next) => {
  const error = new Error("Test error for middleware demonstration");
  next(error);
});

/*
=====================================
📌 SSR: VIEW RESULT (DB BASED)
=====================================
*/
// This legacy page presented a hard-coded demo result as if it were verified.
router.get("/view-result", (req, res) => {
  res.status(410).json({ success: false, error: { code: "ENDPOINT_RETIRED", message: "This legacy verification page is no longer available" } });
});

export default router;
