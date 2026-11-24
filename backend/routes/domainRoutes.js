import express from "express";

const router = express.Router();

router.get("/domain", (req, res) => {

  res.json({
    success: true,
    message: "Domain route working"
  });

});

export default router;