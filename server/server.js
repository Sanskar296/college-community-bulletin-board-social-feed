import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Post from "./models/Post.js"; // Add Post model import
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import noticeRoutes from "./routes/notices.js";
import userRoutes from "./routes/users.js";
import commentRoutes from "./routes/comments.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB and drop email index
const initializeDB = async () => {
  try {
    await connectDB();
    const collections = await mongoose.connection.db.listCollections().toArray();
    if (collections.some(col => col.name === 'users')) {
      await mongoose.connection.db.collection('users').dropIndex('email_1')
        .catch(err => {
          if (err.code !== 27) console.error('Error dropping index:', err);
        });
    }
  } catch (err) {
    console.error('DB initialization error:', err);
  }
};

initializeDB();

// Explicitly configure uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', process.env.CLIENT_URL].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ['Content-Type', 'Content-Disposition']
}));

// Serve static files - add this before routes
app.use('/uploads', (req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsPath));
app.use('/api/uploads', express.static(uploadsPath));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);

// User profile route - Fix user lookup
app.get('/api/auth/users/:username', async (req, res) => {
  try {
    const username = req.params.username.toLowerCase().trim();
    console.log('Looking for user:', username);

    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    })
    .select('-password -__v')
    .lean();

    if (!user) {
      console.log('No user found for:', username);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get user's posts
    const posts = await Post.find({ 
      author: user._id,
      status: 'active' 
    })
    .sort({ createdAt: -1 })
    .populate('author', 'username firstname lastname')
    .lean();

    console.log(`Found ${posts.length} posts for user:`, username);

    res.json({
      success: true,
      user,
      posts
    });

  } catch (error) {
    console.error('Error in user lookup:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile"
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `API route not found: ${req.originalUrl}` 
  });
});

// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
  console.log(`Database: ${process.env.MONGO_URI || "mongodb://localhost:27017/Vishwaniketan-campus"}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't exit the process in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});