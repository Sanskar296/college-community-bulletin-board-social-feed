import express from "express";
import { login, register, getCurrentUser, getUserProfile } from "../controllers/auth.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.post("/register", register);
router.get("/users/:username", getUserProfile); // Add this line

// Protected routes
router.get("/current", authenticateToken, getCurrentUser);

// Get user profile by username
router.get("/users/:username", async (req, res) => {
  try {
    const username = req.params.username;
    console.log('Fetching profile for:', username);

    // Find user and include basic info
    const user = await User.findOne({ username })
      .select('-password -__v')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Find user's posts
    const posts = await Post.find({ 
      author: user._id, 
      status: 'active' 
    })
    .sort({ createdAt: -1 })
    .populate('author', 'username firstname lastname avatar')
    .lean();

    console.log(`Found user and ${posts.length} posts`);

    // Send combined response
    res.json({
      success: true,
      user: user,
      posts: posts || []
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;
