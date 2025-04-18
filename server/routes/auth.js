import express from "express";
import bcrypt from "bcrypt";
import { login, register, getCurrentUser, getUserProfile } from "../controllers/auth.js";
import { authenticateToken } from "../middleware/auth.js";
import FacultyRequest from "../models/FacultyRequest.js";
import User from "../models/User.js";
import Post from "../models/Post.js";

const router = express.Router();

// Public routes
router.post("/login", login);

// Register route modification
router.post("/register", async (req, res) => {
  try {
    const { username, password, firstname, lastname, department, role } = req.body;

    // Basic validation
    if (!username || !password || !firstname || !lastname || !department || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    // Create new user with pending approval for faculty
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      firstname,
      lastname,
      department,
      role,
      isApproved: role === 'student', // Only students are auto-approved
      status: role === 'faculty' ? 'pending' : 'active'
    });

    const savedUser = await newUser.save();

    // If role is faculty, create a faculty request
    if (role === 'faculty') {
      const facultyRequest = new FacultyRequest({
        username: savedUser.username,
        firstname: savedUser.firstname,
        lastname: savedUser.lastname,
        department: savedUser.department,
        userId: savedUser._id,
        status: 'pending'
      });
      await facultyRequest.save();
    }

    res.status(201).json({
      success: true,
      message: role === 'faculty' 
        ? "Registration submitted for approval. Please wait for admin verification."
        : "Registration successful!",
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        firstname: savedUser.firstname,
        lastname: savedUser.lastname,
        department: savedUser.department,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  }
});

// Get user profile by username
router.get("/users/:username", getUserProfile);

// Protected routes
router.get("/current", authenticateToken, getCurrentUser);

// Faculty request routes
router.post("/faculty-request", authenticateToken, async (req, res) => {
  try {
    console.log('Faculty request received:', req.user);

    // Check if user already has a pending request
    const existingRequest = await FacultyRequest.findOne({ 
      username: req.user.username 
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request"
      });
    }

    // Create faculty request using existing user data
    const request = new FacultyRequest({
      username: req.user.username,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      department: req.user.department
    });

    await request.save();
    console.log('Faculty request created:', request);

    res.json({
      success: true,
      message: "Faculty request submitted successfully"
    });
  } catch (error) {
    console.error('Faculty request error:', error);
    res.status(500).json({
      success: false,
      message: "Error submitting faculty request"
    });
  }
});

// Get faculty requests (admin only)
router.get("/faculty-requests", authenticateToken, async (req, res) => {
  try {
    // Allow both "dev" username and users with admin role
    if (req.user.username !== "dev" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can access faculty requests"
      });
    }

    const requests = await FacultyRequest.find()
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      requests 
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching faculty requests"
    });
  }
});

router.post("/faculty-requests/:requestId/approve", authenticateToken, async (req, res) => {
  try {
    // Allow both "dev" username and users with admin role
    if (req.user.username !== "dev" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can approve faculty requests"
      });
    }

    const request = await FacultyRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // Update user role to faculty and set as approved
    await User.findOneAndUpdate(
      { username: request.username },
      { 
        role: 'faculty',
        isApproved: true,
        status: 'active'
      }
    );

    // Update request status
    request.status = 'approved';
    await request.save();

    res.json({
      success: true,
      message: "Faculty request approved"
    });
  } catch (error) {
    console.error('Approve faculty error:', error);
    res.status(500).json({
      success: false,
      message: "Error approving faculty request"
    });
  }
});

router.post("/faculty-requests/:requestId/reject", authenticateToken, async (req, res) => {
  try {
    // Allow both "dev" username and users with admin role
    if (req.user.username !== "dev" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can reject faculty requests"
      });
    }

    const request = await FacultyRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // Update the user status if needed
    await User.findOneAndUpdate(
      { username: request.username },
      { 
        status: 'rejected'
      }
    );

    // Update request status
    request.status = 'rejected';
    await request.save();

    res.json({
      success: true,
      message: "Faculty request rejected"
    });
  } catch (error) {
    console.error('Reject faculty error:', error);
    res.status(500).json({
      success: false,
      message: "Error rejecting faculty request"
    });
  }
});

export default router;
