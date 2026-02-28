import express from "express";
import {
  homeController,
  statusController
} from "../controllers/baseController.js";

const router = express.Router();

router.get("/", homeController);
router.get("/status", statusController);

// Error Test Route (Middleware demonstration)
router.get("/api/error", (req, res, next) => {

  const error = new Error("Test error for middleware demonstration");

  next(error);

});

export default router;