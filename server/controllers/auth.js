import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from '../models/User.js'; // Ensure this import matches your User model

// Register a new user
export const register = async (req, res) => {
    try {
        const { username, password, firstname, lastname, department } = req.body;

        if (!username || !password || !firstname || !lastname || !department) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            firstname,
            lastname,
            department,
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// Login a user
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt for:", username);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, "i") } },
        { email: { $regex: new RegExp(`^${username}$`, "i") } }
      ]
    });

    if (!user) {
      console.log("User not found:", username);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log("Password validation result:", isValid);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { _id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
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
        role: user.role
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
        const { username } = req.params;
        console.log('Fetching profile for username:', username);

        const user = await User.findOne({ username })
            .select('-password -__v')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
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
