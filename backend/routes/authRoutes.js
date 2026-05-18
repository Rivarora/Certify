import express from "express";
import bcrypt from "bcrypt";
// import User from "../models/userModel.js";
import prisma from "../config/db.js";

import { register, login } from "../controllers/authController.js";

const router = express.Router();

/*
===========================
API ROUTES (DO NOT TOUCH)
===========================
*/
router.post("/register", register);
router.post("/login", login);

/*
===========================
EJS PAGE ROUTES
===========================
*/

// 👉 Login page
router.get("/login", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/");
   
  }
  res.render("login", { error: null, loading: false });
});

// 👉 Register page
router.get("/register", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/");
   
  }
  res.render("register", { error: null, success: null });
});

// 👉 Logout page
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("connect.sid");
    res.redirect("/api/login");
  });
});

/*
===========================
EJS REGISTER HANDLER
===========================
*/
router.post("/register-form", async (req, res) => {
  try {
    const { name, email, password, confirm } = req.body;

    if (password !== confirm) {
      return res.render("register", {
        error: "Passwords do not match",
        success: null
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.render("register", {
        error: "User already exists",
        success: null
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword
  }
});
    req.session.user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    };

    return res.redirect("/");

  } catch (err) {
     console.log(err);
    return res.render("register", {
      error: "Registration failed",
      success: null
    });
  }
});

/*
===========================
EJS LOGIN HANDLER
===========================
*/
router.post("/login-form", async (req, res) => {
  try {
    const email = req.body.email.trim();
    const password = req.body.password;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.render("login", {
        error: "User not found",
        loading: false
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", {
        error: "Invalid credentials",
        loading: false
      });
    }

    // ✅ SESSION (THIS WAS MISSING)
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    // ✅ REDIRECT
    res.redirect("/");

  } catch (err) {
    return res.render("login", {
      error: "Login failed",
      loading: false
    });
  }
});

export default router;