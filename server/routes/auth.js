import express from "express";
import { login, register, getCurrentUser, getUserProfile } from "../controllers/auth.js";
import { authenticateToken } from "../middleware/auth.js";
import User from "../models/User.js";
import Post from "../models/Post.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.post("/register", register);

// Get user profile by username
router.get("/users/:username", getUserProfile);

// Protected routes
router.get("/current", authenticateToken, getCurrentUser);

export default router;
