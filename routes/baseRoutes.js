import express from "express";
import {
  homeController,
  statusController
} from "../controllers/baseController.js";

const router = express.Router();

// Base Routes
router.get("/", homeController);
router.get("/status", statusController);

export default router;