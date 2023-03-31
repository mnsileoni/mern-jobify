/** @format */

import express from "express";
import authenticateUser from "../middleware/auth.js";
import rateLimiter from "express-rate-limit";
// podriamos aplicar el limiter a todo el preyecto directamente en server pero prefiere hacerlo en la ruta de login/register.
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

const router = express.Router();
import {
  register,
  login,
  updateUser,
  getCurrentUser,
  logout,
} from "../controllers/authControllers.js";

router.route("/register").post(apiLimiter, register);
router.route("/login").post(apiLimiter, login);
router.get("/logout", logout);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/getCurrentUser").get(authenticateUser, getCurrentUser);
export default router;
