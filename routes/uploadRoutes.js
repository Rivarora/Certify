import express from "express";

const router = express.Router();

// Upload route
router.post("/upload", (req, res) => {

  res.json({
    success: true,
    message: "Upload route working"
  });

});

export default router;