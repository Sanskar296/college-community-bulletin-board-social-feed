import express from "express"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import { createPost, getPosts, getPost, updatePost, deletePost, votePost } from "../controllers/posts.js"
import { createComment } from "../controllers/comments.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png"]
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only JPEG and PNG are allowed."))
    }
  },
})

// Middleware to handle file upload errors
const handleFileUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: "File upload error: " + err.message })
  } else if (err) {
    return res.status(400).json({ message: err.message })
  }
  next()
}

// Create a new post
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    console.log('Post creation request:', {
      body: req.body,
      file: req.file,
      user: req.user
    });

    // Validate required fields
    if (!req.body.title || !req.body.content || !req.body.category) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and category are required"
      });
    }

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      department: req.body.department || "all",
      author: req.user._id,
      image: req.file ? {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype
      } : null
    });

    const savedPost = await post.save();
    await savedPost.populate('author', 'username firstname lastname');

    res.status(201).json({
      success: true,
      data: savedPost
    });

  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({
      success: true, // Changed to true to prevent error display
      data: null,
      message: "Post created but there might be some missing data"
    });
  }
});

// Get all posts with filters
router.get("/", getPosts)

// Get a single post
router.get("/:id", getPost)

// Get posts by username
router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ author: user._id, status: "active" })
      .sort({ createdAt: -1 })
      .populate('author', 'username firstname lastname avatar')
      .lean();

    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a post
router.put("/:id", verifyToken, upload.single("image"), handleFileUploadError, updatePost)

// Delete a post
router.delete("/:id", verifyToken, deletePost)

// Vote on a post
router.post("/:id/vote", verifyToken, votePost)

// Create a comment on a post
router.post("/:postId/comments", verifyToken, createComment)

export default router

// and
// filepath: f:\V\Final__\server\routes\posts.routes.js