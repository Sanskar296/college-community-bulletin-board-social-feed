import express from "express";
import { 
  createDiscussion, 
  getDiscussions, 
  getDiscussion,
  getMessages,
  createMessage,
  archiveDiscussion
} from "../controllers/discussions.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get all discussions
router.get("/", getDiscussions);

// Get a single discussion
router.get("/:id", verifyToken, getDiscussion);

// Create a new discussion
router.post("/", verifyToken, createDiscussion);

// Archive a discussion
router.put("/:id/archive", verifyToken, archiveDiscussion);

// Get all messages for a discussion
router.get("/:discussionId/messages", verifyToken, getMessages);

// Create a new message in a discussion
router.post("/:discussionId/messages", verifyToken, createMessage);

export default router; 