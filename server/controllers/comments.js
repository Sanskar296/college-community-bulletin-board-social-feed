import Comment from "../models/Comment.js"
import Post from "../models/Post.js"
import Vote from "../models/Vote.js"

// Create a comment
export const createComment = async (req, res) => {
  try {
    console.log('Creating comment for post:', req.params.postId);
    
    const { postId } = req.params;
    const { content } = req.body;

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Comment content is required" 
      });
    }

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: "Post not found" 
      });
    }

    // Create new comment
    const newComment = new Comment({
      content: content.trim(),
      author: req.user._id,
      post: postId,
    });

    // Save comment
    const savedComment = await newComment.save();
    console.log('Comment saved with ID:', savedComment._id);
    
    // Increment comment count on post
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();
    console.log('Updated post comment count:', post.commentCount);

    // Populate author details
    await savedComment.populate("author", "username firstname lastname avatar");

    res.status(201).json({
      success: true,
      data: savedComment
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create comment",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a reply to a comment
export const createReply = async (req, res) => {
  try {
    console.log('Creating reply to comment:', req.params.commentId);
    const { commentId } = req.params;
    const { content } = req.body;

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Content is required." 
      });
    }

    // Check if parent comment exists
    const parentComment = await Comment.findById(commentId);

    if (!parentComment) {
      return res.status(404).json({ 
        success: false,
        message: "Comment not found." 
      });
    }

    console.log(`Found parent comment (ID: ${commentId}) for post: ${parentComment.post}`);

    // Create new reply
    const newReply = new Comment({
      content: content.trim(),
      author: req.user._id,
      post: parentComment.post,
      parent: commentId,
    });

    // Save reply
    const savedReply = await newReply.save();
    console.log('Reply saved with ID:', savedReply._id);
    
    // Increment post comment count
    const post = await Post.findById(parentComment.post);
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();
    console.log('Updated post comment count:', post.commentCount);

    // Populate author details
    await savedReply.populate("author", "username firstname lastname avatar");

    res.status(201).json({
      success: true,
      data: savedReply
    });
  } catch (error) {
    console.error("Create reply error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create reply",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const { content } = req.body

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required." })
    }

    // Find comment
    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." })
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized." })
    }

    // Update comment
    comment.content = content

    // Save updated comment
    const updatedComment = await comment.save()

    // Populate author details
    await updatedComment.populate("author", "username avatar")

    res.json(updatedComment)
  } catch (error) {
    console.error("Update comment error:", error)
    res.status(500).json({ message: "Server error." })
  }
}

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params

    // Find comment
    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." })
    }

    // Check if user is the author or admin
    if (comment.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized." })
    }

    // Soft delete comment (mark as deleted)
    comment.isDeleted = true
    comment.content = "[deleted]"
    await comment.save()

    res.json({ message: "Comment deleted successfully." })
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({ message: "Server error." })
  }
}

// Vote on a comment
export const voteComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const { vote } = req.body

    // Validate vote value
    const voteValue = Number.parseInt(vote)

    if (![1, 0, -1].includes(voteValue)) {
      return res.status(400).json({ message: "Invalid vote value. Must be -1, 0, or 1." })
    }

    // Find comment
    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." })
    }

    // Find existing vote
    const existingVote = await Vote.findOne({
      user: req.user.id,
      targetType: "comment",
      target: commentId,
    })

    // Handle vote changes
    if (voteValue === 0) {
      // Remove vote if exists
      if (existingVote) {
        // Update comment vote count
        comment.votes -= existingVote.value
        await comment.save()

        // Delete vote
        await Vote.findByIdAndDelete(existingVote._id)
      }
    } else {
      if (existingVote) {
        // Update existing vote
        if (existingVote.value !== voteValue) {
          // Update comment vote count
          comment.votes = comment.votes - existingVote.value + voteValue
          await comment.save()

          // Update vote
          existingVote.value = voteValue
          await existingVote.save()
        }
      } else {
        // Create new vote
        const newVote = new Vote({
          user: req.user.id,
          targetType: "comment",
          target: commentId,
          value: voteValue,
        })

        // Update comment vote count
        comment.votes += voteValue
        await comment.save()

        // Save vote
        await newVote.save()
      }
    }

    res.json({ votes: comment.votes })
  } catch (error) {
    console.error("Vote comment error:", error)
    res.status(500).json({ message: "Server error." })
  }
}