import express from "express";

const router = express.Router();



// ─────────────────────────────────
// NON-BLOCKING middleware (good ✅)
// Logs, then passes control via next()
// ─────────────────────────────────
const nonBlockingMiddleware = (req, res, next) => {
  console.log("🟢 Non-blocking middleware: ran and called next()");
  next(); // ✅ passes control — request continues
};

// ─────────────────────────────────
// BLOCKING middleware (intentional demo ⛔)
// Stops the request — never calls next()
// ─────────────────────────────────
const blockingMiddleware = (req, res, next) => {
  console.log("🔴 Blocking middleware: stopped the request");
  return res.status(403).json({
    success: false,
    message: "Request blocked by middleware — next() was never called"
    // ❌ next() intentionally NOT called
  });
};

// ─────────────────────────────────
// DEMO ROUTES
// ─────────────────────────────────

// GET /api/demo/non-blocking → passes through, returns success
router.get("/non-blocking", nonBlockingMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "✅ Non-blocking: middleware ran, next() called, reached controller"
  });
});

// GET /api/demo/blocking → stops at middleware, never reaches controller
router.get("/blocking", blockingMiddleware, (req, res) => {
  // This handler is NEVER reached
  res.json({
    success: true,
    message: "You will never see this — request was blocked"
  });
});

// GET /api/demo/chain → shows full middleware chain executing in order
const step1 = (req, res, next) => { req.steps = ["step1"]; next(); };
const step2 = (req, res, next) => { req.steps.push("step2");  next(); };
const step3 = (req, res, next) => { req.steps.push("step3");  next(); };

router.get("/chain", step1, step2, step3, (req, res) => {
  res.json({
    success: true,
    message: "Full middleware chain executed",
    steps: req.steps, // ["step1", "step2", "step3"]
    explanation: "Each middleware called next() — all ran in order"
  });
});

export default router;


