/* mounting everything
Resource-grouped routes make scanning & testing dead simple.
*/
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const configureSecurity = require("./security/helmet");
const { registerLimiter, loginLimiter } = require("./middleware/rateLimiter"); // ⬅ add
const { protect } = require("./middleware/authMiddleware");

dotenv.config();
const app = express();

// 🔑 real client IPs when behind a proxy/load balancer (Render/Heroku/Nginx)
app.set("trust proxy", 1);

configureSecurity(app);
app.use(cors({
  origin: ["http://localhost:5173", "https://localhost:5173"], // match your FE
  credentials: true
}));
app.use(express.json());

// routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

// 👇 apply limiters only where abuse happens
// (If you already added them inside authRoutes, skip these lines.)
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register-user", registerLimiter);
app.use("/api/auth/register-admin", registerLimiter);

// mount routers
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts/:postId/comments", commentRoutes); // ensure router uses { mergeParams: true }

// Example protected ping
app.get("/api/protected", protect, (req, res) => {
  res.json({ message: `Welcome ${req.user.id}`, role: req.user.role, at: new Date() });
});

module.exports = app;