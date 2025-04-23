import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  try {
    console.log('Verifying token for endpoint:', req.originalUrl);
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('No auth header or invalid format');
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided." 
      });
    }

    const token = authHeader.split(" ")[1];
    console.log('Token received for verification:', token.substring(0, 10) + '...');
    
    // Special handling for dev token
    if (token === 'dev_token') {
      console.log('Dev token detected, granting admin access');
      req.user = { 
        _id: '000000000000000000000000', // Valid MongoDB ObjectId
        username: 'dev',
        role: 'admin',
        department: 'comp'
      };
      console.log('Dev user set with ObjectId:', req.user._id);
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token successfully verified for user:', decoded);

      const user = await User.findById(decoded._id);
      if (!user) {
        console.log('User not found for token');
        return res.status(401).json({ 
          success: false, 
          message: "Invalid user" 
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired token" 
      });
    }
  } catch (error) {
    console.error('General token verification error:', error);
    return res.status(401).json({ 
      success: false, 
      message: "Authentication error" 
    });
  }
};

// Export authenticateToken as an alias for verifyToken
export const authenticateToken = async (req, res, next) => {
  try {
    console.log('Authenticating token for route:', req.originalUrl);
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('No auth header or invalid format');
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const token = authHeader.split(" ")[1];
    console.log('Token received:', token.substring(0, 10) + '...');
    
    // Special handling for dev token
    if (token === 'dev_token') {
      console.log('Dev token detected, granting admin access');
      req.user = { 
        _id: '000000000000000000000000', // Valid MongoDB ObjectId
        username: 'dev',
        role: 'admin',
        department: 'comp' // Add department for consistency
      };
      console.log('Dev user set with ObjectId:', req.user._id);
      return next();
    }

    try {
      // Regular token verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);

      const user = await User.findById(decoded._id);
      if (!user) {
        console.log('User not found for token');
        return res.status(401).json({ 
          success: false, 
          message: "Invalid user" 
        });
      }

      req.user = user;
      console.log('User authenticated:', user.username, user.role);
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired token" 
      });
    }
  } catch (error) {
    console.error('Token authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: "Authentication error" 
    });
  }
};

// Optional token verification (doesn't require auth)
export const optionalToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // Continue without user
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    console.error("Optional token verification error:", error);
    return next(); // Continue without user on error
  }
};

