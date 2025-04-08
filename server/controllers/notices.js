import Notice from "../models/Notice.js";
import User from "../models/User.js";
import { imageToBase64, base64ToImage } from '../utils/imageUtils.js';

// Create a new notice
export const createNotice = async (req, res) => {
  try {
    console.log("Create Notice API called");
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.username.toLowerCase() !== "sanskarkumarfe23") {
      return res.status(403).json({ message: "Only user 'sanskarkumarFE23' can post notices." });
    }

    const { title, content } = req.body;
    
    // Handle image
    let imageData = null;
    if (req.file) {
      imageData = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`, // Make sure this matches your static files path
        mimetype: req.file.mimetype,
        url: `/uploads/${req.file.filename}` // Relative URL is better for flexibility
      };
    }

    const newNotice = new Notice({
      title,
      content,
      image: imageData,
      author: req.user._id,
    });

    const savedNotice = await newNotice.save();
    const populatedNotice = await Notice.findById(savedNotice._id)
      .populate('author', 'firstname lastname');

    res.status(201).json(populatedNotice);
  } catch (error) {
    console.error("Create Notice Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// In-memory cache for notices
let cachedNotices = [];
let lastNoticeCacheTime = null;
const NOTICE_CACHE_DURATION = 5 * 60 * 1000; // Cache duration: 5 minutes

// Get all notices
export const getNotices = async (req, res) => {
  try {
    const { department, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (department && department !== 'all') {
      filter.department = department;
    }

    const notices = await Notice.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('author', 'firstname lastname username')
      .lean();

    const count = await Notice.countDocuments(filter);

    const noticesWithFullUrls = notices.map(notice => ({
      ...notice,
      image: notice.image ? {
        ...notice.image,
        fullUrl: `${process.env.SERVER_URL || 'http://localhost:5000'}${notice.image.path}`
      } : null
    }));

    res.json({
      notices: noticesWithFullUrls,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalNotices: count
    });
  } catch (error) {
    console.error("Get notices error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
