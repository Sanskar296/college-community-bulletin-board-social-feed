import express from "express";
import { verifyToken } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Get notifications for current user
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notifications"
    });
  }
});

// Get unread notification count
router.get("/unread/count", verifyToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Get unread notification count error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while counting notifications"
    });
  }
});

// Mark a notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or not authorized"
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating notification"
    });
  }
});

// Mark all notifications as read
router.put("/read-all", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating notifications"
    });
  }
});

export default router; 