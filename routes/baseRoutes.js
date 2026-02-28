import express from "express";
import {
  homeController,
  statusController
} from "../controllers/baseController.js";

const router = express.Router();

router.get("/", homeController);
router.get("/status", statusController);
//  — Error Test Route
router.get("/api/error", (req, res, next) => {

  const error = new Error("This is a test error from Tishya");

  next(error);

});

export default router;