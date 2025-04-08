import express from "express";
import bcrypt from "bcrypt"; // For password hashing
import jwt from "jsonwebtoken"; // For JWT authentication
import User from "../models/User.js"; // Ensure this matches your User model
import { authenticateToken } from "../middleware/auth.js"; // Correctly import authenticateToken

const router = express.Router();

/**
 * Route: GET /api/users/current
 * Description: Fetch details of the currently logged-in user
 */
router.get("/current", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Route: PUT /api/users/current
 * Description: Update details of the currently logged-in user
 */
router.put("/current", authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ["firstname", "lastname", "bio", "department", "avatar"];
    const isValidOperation = Object.keys(updates).every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates!" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Route: DELETE /api/users/current
 * Description: Delete the currently logged-in user's account
 */
router.delete("/current", authenticateToken, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
