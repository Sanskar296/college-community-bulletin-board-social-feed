import Post from "../models/Post.js"
import Comment from "../models/Comment.js"
import Vote from "../models/Vote.js"
import mongoose from "mongoose"

// In-memory cache for posts
let cachedPosts = [];
let lastCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // Cache duration: 5 minutes

// Create a new post
export const createPost = async (req, res) => {
  try {
    console.log("Create Post Request:", {
      body: req.body,
      file: req.file,
      user: req.user ? {
        _id: req.user._id,
        username: req.user.username,
        role: req.user.role
      } : null
    });

    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      console.error('User not authenticated or missing _id');
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const { title, content, category, department } = req.body;

    // Remove trim() check since FormData might send strings differently
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and category are required.",
        receivedData: { title, content, category } // Add this for debugging
      });
    }

    let imageData = null;
    if (req.file) {
      imageData = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype
      };
    }

    const newPost = new Post({
      title: title.toString(), // Ensure string conversion
      content: content.toString(),
      category,
      department: department || "all",
      author: req.user._id,
      image: imageData
    });

    const savedPost = await newPost.save();
    console.log("Saved post:", savedPost._id);

    // Populate author details
    await savedPost.populate('author', 'username firstname lastname');

    res.status(201).json({
      success: true,
      data: savedPost
    });

  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
      requestBody: req.body // Add this for debugging
    });
  }
}

// Get all posts with filters
export const getPosts = async (req, res) => {
  try {
    console.log("Get Posts Request:", req.query);
    const { category, department, sort = "latest", page = 1, limit = 10 } = req.query;
    const filter = { status: "active" };

    if (category && category !== 'all') filter.category = category;
    if (department && department !== 'all') filter.department = department;

    console.log("Using filter:", filter); // Debug log

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('author', 'username firstname lastname avatar')
      .lean();

    console.log("Found posts:", posts.length); // Debug log
    console.log("Sample post:", posts[0]); // Debug log

    const count = await Post.countDocuments(filter);

    const postsWithFullUrls = posts.map(post => ({
      ...post,
      image: post.image ? {
        ...post.image,
        fullUrl: `${process.env.SERVER_URL || 'http://localhost:5000'}${post.image?.path}`
      } : null
    }));

    res.json({
      success: true,
      data: {
        posts: postsWithFullUrls,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalPosts: count
      }
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch posts",
      error: error.message
    });
  }
};

// Get a single post
export const getPost = async (req, res) => {
  try {
    console.log(`Fetching post with ID: ${req.params.id}`);
    const { id } = req.params;

    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ 
        success: false,
        message: "Invalid post ID format" 
      });
    }

    // Find post WITHOUT trying to populate the virtual comments field
    const post = await Post.findById(id)
      .populate("author", "username firstname lastname avatar")
      .lean();

    // Check if post exists
    if (!post) {
      console.log(`Post not found: ${id}`);
      return res.status(404).json({ 
        success: false,
        message: "Post not found" 
      });
    }
    
    // Format image URL if exists
    if (post.image && post.image.path) {
      post.image.fullUrl = `${process.env.SERVER_URL || 'http://localhost:5000'}${post.image.path}`;
    }
    
    // Fetch ALL comments for this post, both top-level and replies
    const allComments = await Comment.find({ post: id })
      .sort({ createdAt: -1 })
      .populate("author", "username firstname lastname avatar")
      .lean();
    
    console.log(`Found ${allComments.length} total comments for post ${id}`);
    
    // Separate top-level comments and replies
    const topLevelComments = [];
    const repliesMap = {};
    
    // Group all replies by their parent ID
    allComments.forEach(comment => {
      if (!comment.parent) {
        // This is a top-level comment
        topLevelComments.push({
          ...comment,
          replies: [] // Initialize an empty replies array
        });
      } else {
        // This is a reply
        if (!repliesMap[comment.parent]) {
          repliesMap[comment.parent] = [];
        }
        repliesMap[comment.parent].push(comment);
      }
    });
    
    // Add replies to their parent comments
    topLevelComments.forEach(comment => {
      if (repliesMap[comment._id]) {
        comment.replies = repliesMap[comment._id];
      }
    });
    
    // Manually add the comments to the post object
    post.comments = topLevelComments;
    
    console.log(`Successfully organized comments: ${topLevelComments.length} top-level comments with nested replies`);
    
    // Return post with success status
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch post details",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, category, department } = req.body

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({ message: "Title, content, and category are required." })
    }

    // Find post
    const post = await Post.findById(id)

    if (!post) {
      return res.status(404).json({ message: "Post not found." })
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this post." })
    }

    // Update post fields
    post.title = title
    post.content = content
    post.category = category
    post.department = department || "all"

    // Save updated post
    const updatedPost = await post.save()

    // Populate author details
    await updatedPost.populate("author", "username avatar")

    res.json(updatedPost)
  } catch (error) {
    console.error("Update post error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params

    // Find post
    const post = await Post.findById(id)

    if (!post) {
      return res.status(404).json({ message: "Post not found." })
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this post." })
    }

    // Soft delete post (mark as inactive)
    post.status = "inactive"
    await post.save()

    res.json({ message: "Post deleted successfully." })
  } catch (error) {
    console.error("Delete post error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Vote on a post
export const votePost = async (req, res) => {
  try {
    const { id } = req.params
    const { vote } = req.body

    // Validate vote value
    const voteValue = Number.parseInt(vote)

    if (![1, 0, -1].includes(voteValue)) {
      return res.status(400).json({ message: "Invalid vote value. Must be -1, 0, or 1." })
    }

    // Find post
    const post = await Post.findById(id)

    if (!post) {
      return res.status(404).json({ message: "Post not found." })
    }

    // Find existing vote
    const existingVote = await Vote.findOne({
      user: req.user.id,
      targetType: "post",
      target: id,
    })

    // Handle vote changes
    if (voteValue === 0) {
      // Remove vote if exists
      if (existingVote) {
        // Update post vote count
        post.votes -= existingVote.value
        await post.save()

        // Delete vote
        await Vote.findByIdAndDelete(existingVote._id)
      }
    } else {
      if (existingVote) {
        // Update existing vote
        if (existingVote.value !== voteValue) {
          // Update post vote count
          post.votes = post.votes - existingVote.value + voteValue
          await post.save()

          // Update vote
          existingVote.value = voteValue
          await existingVote.save()
        }
      } else {
        // Create new vote
        const newVote = new Vote({
          user: req.user.id,
          targetType: "post",
          target: id,
          value: voteValue,
        })

        // Update post vote count
        post.votes += voteValue
        await post.save()

        // Save vote
        await newVote.save()
      }
    }

    res.json({ votes: post.votes })
  } catch (error) {
    console.error("Vote post error:", error)
    res.status(500).json({ message: "Server error" })
  }
}