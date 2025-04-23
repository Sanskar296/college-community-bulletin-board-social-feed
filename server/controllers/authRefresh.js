import jwt from "jsonwebtoken";
import User from '../models/User.js';

// Refresh token endpoint
export const refreshToken = async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }
    
    const token = authHeader.split(" ")[1];
    
    // Special handling for dev token
    if (token === 'dev_token') {
      return res.status(200).json({
        success: true,
        token: 'dev_token',
        user: {
          _id: '000000000000000000000000',
          username: 'dev',
          role: 'admin',
          firstname: 'Dev',
          lastname: 'Admin',
          department: 'comp'
        }
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      // If token is expired but otherwise valid, we'll issue a new one
      if (jwtError.name === "TokenExpiredError") {
        try {
          // Even for expired tokens, we can extract the payload
          decoded = jwt.decode(token);
          
          if (!decoded || !decoded._id) {
            return res.status(401).json({
              success: false,
              message: "Invalid token format"
            });
          }
        } catch (decodeError) {
          return res.status(401).json({
            success: false,
            message: "Invalid token"
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid token"
        });
      }
    }
    
    // Find the user
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Create a new token with a longer expiration
    const newToken = jwt.sign(
      { _id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }  // Longer token validity for better persistence
    );
    
    // Send response with new token and user info
    res.status(200).json({
      success: true,
      token: newToken,
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
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during token refresh"
    });
  }
}; 