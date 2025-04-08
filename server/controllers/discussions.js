import Discussion from '../models/Discussion.js';
import User from '../models/User.js';

export const createDiscussion = async (req, res) => {
  try {
    const { name, category, scheduledTime, isLocked } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and category are required"
      });
    }

    const newDiscussion = new Discussion({
      name,
      category,
      creator: req.user._id,
      scheduledTime: scheduledTime || new Date(),
      isLocked: isLocked || false,
      participants: [req.user._id]
    });

    await newDiscussion.save();
    await newDiscussion.populate('creator participants', 'username firstname lastname');

    res.status(201).json({
      success: true,
      data: newDiscussion
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find({ status: 'active' })
      .populate('creator participants', 'username firstname lastname')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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

export const addMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    discussion.messages.push({
      user: req.user._id,
      content
    });

    await discussion.save();
    await discussion.populate('messages.user', 'username firstname lastname');

    res.json({
      success: true,
      data: discussion.messages[discussion.messages.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
