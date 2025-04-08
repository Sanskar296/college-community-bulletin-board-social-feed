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
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create a new notice (restricted to 'sanskarkumarFE23')
router.post("/", verifyToken, upload.single('image'), async (req, res) => {
  try {
    console.log('Notice creation request:', {
      body: req.body,
      file: req.file,
      user: req.user
    });

    // Validate user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check authorization
    if (user.username.toLowerCase() !== "sanskarkumarfe23") {
      return res.status(403).json({ 
        success: false, 
        message: "Only sanskarkumarFE23 can create notices" 
      });
    }

    console.log('Received file:', req.file); // Debug log
    
    // Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required"
      });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    console.log('Generated image URL:', imageUrl);

    // Create notice with correct image path
    const notice = new Notice({
      title: req.body.title,
      content: req.body.content || "",
      department: req.body.department || "all",
      author: user._id,
      image: req.file ? {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype
      } : null
    });

    const savedNotice = await notice.save();
    console.log('Saved notice:', savedNotice); // Debug log

    // Populate author details
    await savedNotice.populate('author', 'username firstname lastname');

    res.status(201).json({
      success: true,
      data: savedNotice
    });

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
    const notices = await Notice.find()
      .sort({ createdAt: -1 })
      .populate('author', 'firstname lastname username')
      .lean();

    // Transform image URLs
    const noticesWithFullUrls = notices.map(notice => ({
      ...notice,
      image: notice.image ? {
        ...notice.image,
        path: notice.image.path // Keep the original path
      } : null
    }));

    console.log('Sending notices with images:', noticesWithFullUrls.map(n => ({
      id: n._id,
      hasImage: !!n.image,
      imagePath: n.image?.path
    })));

    res.json(noticesWithFullUrls);
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
