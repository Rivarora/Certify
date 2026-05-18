import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

// =====================================
// 📌 REGISTER CONTROLLER
// =====================================

export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirm } = req.body;

    // Validation
    if (!name || !email || !password || !confirm) {
      return res.render("register", {
        error: "All fields required",
        success: null
      });
    }

    // Password match check
    if (password !== confirm) {
      return res.render("register", {
        error: "Passwords do not match",
        success: null
      });
    }

    // Existing user check
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.render("register", {
        error: "User already exists",
        success: null
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    // Success response
    return res.render("register", {
      error: null,
      success: "Registration successful! Please login."
    });

  } catch (err) {
    next(err);
  }
};

// =====================================
// 📌 LOGIN CONTROLLER
// =====================================

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.render("login", {
        error: "All fields required"
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.render("login", {
        error: "User not found"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", {
        error: "Invalid credentials"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    // Store token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    // Redirect after login
    return res.redirect("/");

  } catch (err) {
    next(err);
  }
};