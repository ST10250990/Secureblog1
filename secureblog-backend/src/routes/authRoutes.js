// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { registerLimiter, loginLimiter } = require("../middleware/rateLimiter");

const { registerUser, registerAdmin, login } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

// validators (example)
const emailValidator = body("email").isEmail().normalizeEmail();
const passwordValidator = body("password").isLength({ min: 8 }).trim();

router.post(
  "/register-user",
  registerLimiter,
  [emailValidator, passwordValidator],
  registerUser
);

router.post(
  "/register-admin",
  protect,
  requireRole("admin"),
  registerLimiter,
  [emailValidator, passwordValidator],
  registerAdmin
);

router.post(
  "/login",
  loginLimiter,
  [emailValidator, body("password").notEmpty().trim().escape()],
  login
);

module.exports = router;