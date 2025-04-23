import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from '../models/User.js'; // Ensure this import matches your User model
import Post from '../models/Post.js'; // Add this import
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register a new user
const validateStudentUID = async (uid) => {
  const results = [];
  const csvPath = path.join(__dirname, '../data/student_uids.csv');

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        const validUID = results.find(row => 
          row.uid === uid && row.status === 'active'
        );
        if (!validUID) {
          resolve({
            isValid: false,
            message: "Your UID doesn't match our database. Please check and try again."
          });
        } else {
          resolve({
            isValid: true,
            message: "UID verified successfully"
          });
        }
      })
      .on('error', (error) => {
        console.error('CSV read error:', error);
        reject(new Error("Error validating UID"));
      });
  });
};

export const register = async (req, res) => {
  try {
    const { username, password, firstname, lastname, department, role, uid, year } = req.body;

    // Basic validation
    if (!username || !password || !firstname || !lastname || !department || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    // For students, validate UID against the CSV file
    if (role === 'student') {
      if (!uid) {
        return res.status(400).json({
          success: false,
          message: "Student UID is required for student accounts."
        });
      }

      // Validate UID against the CSV
      const uidValidation = await validateStudentUID(uid);
      if (!uidValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: uidValidation.message
        });
      }

      // Check if UID is already in use
      const existingUser = await User.findOne({ uid });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "This Student UID is already registered. Please contact support if you need assistance."
        });
      }
    }

    // Create user without any email field
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      firstname,
      lastname,
      department,
      role,
      uid: role === 'student' ? uid : undefined,
      year: role === 'student' ? year : 'NA',
      isApproved: role === 'student'
    });

    const savedUser = await newUser.save();
    
    // Create and send token
    const token = jwt.sign(
      { _id: savedUser._id, username: savedUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    
    res.status(201).json({
      success: true,
      message: role === 'student' ? "Registration successful!" : "Registration request sent for approval.",
      token,
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        firstname: savedUser.firstname,
        lastname: savedUser.lastname,
        department: savedUser.department,
        role: savedUser.role,
        year: savedUser.year,
        uid: role === 'student' ? uid : undefined
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if faculty account is approved
    if (user.role === 'faculty' && !user.isApproved) {
      return res.status(401).json({
        success: false,
        message: "Your faculty account is pending approval. Please wait for admin verification."
      });
    }

    if (!user.isApproved) {
      return res.status(401).json({
        success: false,
        message: "Your account is pending approval"
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { _id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        department: user.department,
        role: user.role,
        year: user.year,
        uid: user.role === 'student' ? user.uid : undefined
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
    try {
        const { username } = req.query;
        let user;

        if (username) {
            // Find by username
            user = await User.findOne({ username })
                .select('-password')
                .lean();
            
            console.log('Found user by username:', username, user ? 'found' : 'not found');
        } else if (req.user?._id) {
            // Find by token id
            user = await User.findById(req.user._id)
                .select('-password')
                .lean();
            
            console.log('Found user by id:', user ? 'found' : 'not found');
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json(user);
    } catch (error) {
        console.error('Error in getCurrentUser:', error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Add this new controller function
export const getUserProfile = async (req, res) => {
    try {
        const username = req.params.username.toLowerCase().trim();
        console.log('Looking up user:', username);

        const user = await User.findOne({
            username: { $regex: new RegExp(`^${username}$`, 'i') }
        })
        .select('-password -__v')
        .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.log('Found user:', user);

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
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching profile"
        });
    }
};

// Ensure util._extend is not used in this file

// Import users (if needed)
export const importUsers = async (req, res) => {
    // Logic to import users
};
