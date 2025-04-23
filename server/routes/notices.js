import express from "express";
import multer from "multer";
import path from "path";
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from "../models/User.js"; // Fix: Add this import at the top
import Notice from "../models/Notice.js";
import { verifyToken } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Make uploads directory absolute path
const uploadDir = path.join(__dirname, '../uploads');
console.log('Upload directory:', uploadDir); // Debug log

// Ensure uploads directory exists with proper permissions
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Saving file to:', uploadDir); // Debug log
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    console.log('Generated filename:', filename); // Debug log
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG, PNG, GIF, WEBP, and SVG are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create a new notice (restricted to faculty, admin and dev)
router.post("/", verifyToken, upload.single('image'), async (req, res) => {
  try {
    console.log('Notice creation request:', {
      body: req.body,
      file: req.file,
      user: req.user ? {
        _id: req.user._id,
        username: req.user.username,
        role: req.user.role
      } : null
    });

    // Validate user
    if (!req.user || !req.user._id) {
      console.log('No user found in request');
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    let authorId = null;
    
    // Handle special case for dev user
    if (req.user.username === 'dev') {
      console.log('Dev user detected - using mock ObjectId for author');
      // Use a valid MongoDB ObjectId for the dev user (24 characters hex string)
      authorId = '000000000000000000000000';
      console.log('Using mock ObjectId:', authorId);
    } else {
      // For non-dev users, validate from database
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }
      
      // Check authorization - allow faculty, admin, and dev users
      if (!(user.role === 'faculty' || user.role === 'admin')) {
        return res.status(403).json({ 
          success: false, 
          message: "Only faculty, admin, and dev users can create notices" 
        });
      }
      
      // Set author ID from user
      authorId = user._id;
    }

    console.log('Received file:', req.file); // Debug log
    
    // Validate file - make it optional
    if (!req.file) {
      console.log('No image provided for notice');
    }

    // Create notice with correct image path and author ID
    const notice = new Notice({
      title: req.body.title,
      content: req.body.content || "",
      department: req.body.department || "all",
      author: authorId,
      image: req.file ? {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype
      } : null
    });

    console.log('Saving notice to database:', {
      title: notice.title,
      department: notice.department,
      author: notice.author,
      hasImage: !!notice.image
    });
    
    const savedNotice = await notice.save();
    console.log('Saved notice with ID:', savedNotice._id);

    // For dev user, we skip the populate since the author doesn't exist in DB
    if (req.user.username === 'dev') {
      // Add mock author data for dev user
      savedNotice._doc.author = {
        _id: authorId,
        username: 'dev',
        firstname: 'Dev',
        lastname: 'User'
      };
      
      res.status(201).json({
        success: true,
        data: savedNotice
      });
    } else {
      // Populate author details for regular users
      await savedNotice.populate('author', 'username firstname lastname');
      
      res.status(201).json({
        success: true,
        data: savedNotice
      });
    }
  } catch (error) {
    console.error('Notice creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create notice",
      error: error.message
    });
  }
});

// Get all notices
router.get("/", async (req, res) => {
  try {
    const { department } = req.query;
    const filter = {};
    
    if (department && department !== 'all') {
      filter.department = department;
    }
    
    console.log('Get notices request with filter:', filter);
    
    const notices = await Notice.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'firstname lastname username')
      .lean();

    // Transform image URLs
    const noticesWithFullUrls = notices.map(notice => ({
      ...notice,
      image: notice.image ? {
        ...notice.image,
        path: notice.image.path, // Keep the original path
        fullUrl: `${process.env.SERVER_URL || 'http://localhost:5000'}${notice.image.path}`
      } : null
    }));

    console.log('Sending notices with images:', noticesWithFullUrls.map(n => ({
      id: n._id,
      hasImage: !!n.image,
      imagePath: n.image?.path
    })));

    // Use same response format as the controller
    res.json({
      notices: noticesWithFullUrls,
      totalNotices: notices.length,
      currentPage: 1,
      totalPages: 1
    });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.error('Image not found:', filePath);
    res.status(404).send('Image not found');
  }
});

// Add express static middleware for uploads
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

export default router;
