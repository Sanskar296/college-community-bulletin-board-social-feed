import Discussion from '../models/Discussion.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import mongoose from 'mongoose';

export const createDiscussion = async (req, res) => {
  try {
    const { name, category, description, isLocked } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Discussion name is required"
      });
    }

    const newDiscussion = new Discussion({
      name: name.trim(),
      category: category || "general",
      description: description || "",
      isLocked: !!isLocked,
      creator: req.user._id
    });

    const savedDiscussion = await newDiscussion.save();
    
    // Populate creator info for response
    await savedDiscussion.populate("creator", "username firstname lastname avatar");
    
    res.status(201).json({
      success: true,
      data: savedDiscussion
    });
  } catch (error) {
    console.error("Error creating discussion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create discussion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export const getDiscussions = async (req, res) => {
  try {
    console.log("Fetching all discussions");
    
    const { category } = req.query;
    const filter = { status: "active" };
    
    // Apply category filter if provided
    if (category && category !== "all") {
      filter.category = category;
    }
    
    const discussions = await Discussion.find(filter)
      .sort({ createdAt: -1 })
      .populate("creator", "username firstname lastname avatar")
      .lean();
    
    console.log(`Found ${discussions.length} discussions`);
    
    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    console.error("Error fetching discussions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discussions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export const joinDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    if (discussion.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'This discussion is locked'
      });
    }

    if (!discussion.participants.includes(req.user._id)) {
      discussion.participants.push(req.user._id);
      await discussion.save();
    }

    await discussion.populate('participants', 'username firstname lastname');

    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching discussion with ID: ${id}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Invalid discussion ID format"
      });
    }
    
    const discussion = await Discussion.findById(id)
      .populate("creator", "username firstname lastname avatar")
      .lean();
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }
    
    // Increment participant count for analytics (only if not creator)
    if (req.user && req.user._id.toString() !== discussion.creator._id.toString()) {
      await Discussion.findByIdAndUpdate(id, { $inc: { participants: 1 } });
    }
    
    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    console.error("Error fetching discussion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discussion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { discussionId } = req.params;
    console.log(`Fetching messages for discussion: ${discussionId}`);
    
    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      return res.status(404).json({
        success: false,
        message: "Invalid discussion ID format"
      });
    }
    
    // Check if discussion exists
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }
    
    // Check if discussion is locked and user is not creator
    if (discussion.isLocked && req.user._id.toString() !== discussion.creator.toString()) {
      return res.status(403).json({
        success: false,
        message: "This discussion is private"
      });
    }
    
    const messages = await Message.find({
      discussion: discussionId,
      isDeleted: false
    })
      .sort({ createdAt: 1 })
      .populate("author", "username firstname lastname avatar")
      .lean();
    
    console.log(`Found ${messages.length} messages for discussion: ${discussionId}`);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    console.log(`Creating message in discussion: ${discussionId}`);
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      return res.status(404).json({
        success: false,
        message: "Invalid discussion ID format"
      });
    }
    
    // Check if discussion exists
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }
    
    // Check if discussion is locked and user is not creator
    if (discussion.isLocked && req.user._id.toString() !== discussion.creator.toString()) {
      return res.status(403).json({
        success: false,
        message: "This discussion is private"
      });
    }
    
    const newMessage = new Message({
      content: content.trim(),
      author: req.user._id,
      discussion: discussionId
    });
    
    const savedMessage = await newMessage.save();
    
    // Populate author info for response
    await savedMessage.populate("author", "username firstname lastname avatar");
    
    console.log(`Message created with ID: ${savedMessage._id}`);
    
    res.status(201).json({
      success: true,
      data: savedMessage
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export const archiveDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Archiving discussion: ${id}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Invalid discussion ID format"
      });
    }
    
    const discussion = await Discussion.findById(id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }
    
    // Check if user is the creator
    if (discussion.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can archive this discussion"
      });
    }
    
    discussion.status = "archived";
    await discussion.save();
    
    console.log(`Discussion ${id} archived successfully`);
    
    res.json({
      success: true,
      message: "Discussion archived successfully"
    });
  } catch (error) {
    console.error("Error archiving discussion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive discussion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
