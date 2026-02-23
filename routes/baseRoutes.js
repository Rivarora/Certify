const express = require("express");
const router = express.Router();

const {
    homeController,
    statusController
} = require("../controllers/baseController");

// Base Routes
router.get("/", homeController);
router.get("/status", statusController);

module.exports = router;