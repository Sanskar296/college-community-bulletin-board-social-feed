import express from "express"
import { updateComment, deleteComment, voteComment, createReply } from "../controllers/comments.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Create a reply to a comment
router.post("/:commentId/replies", verifyToken, createReply)

// Update a comment
router.put("/:commentId", verifyToken, updateComment)

// Delete a comment
router.delete("/:commentId", verifyToken, deleteComment)

// Vote on a comment
router.post("/:commentId/vote", verifyToken, voteComment)

export default router

