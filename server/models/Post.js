import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    content: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      required: true,
      enum: ["events", "academic", "lost-found", "issues", "general"],
    },
    department: { type: String, default: "all" },
    image: {
      filename: String,
      path: String,
      mimetype: {
        type: String,
        enum: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'],
        validate: {
          validator: function(v) {
            return ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'].includes(v);
          },
          message: props => `${props.value} is not a valid image format! Only JPG, JPEG, PNG, GIF, WEBP, and SVG are allowed.`
        }
      }
    },
    votes: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { 
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
  }
);

// Virtual field for comments - this lets us populate comments without storing them in the post document
PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post'
});

// Add virtual for user vote (to be implemented when votes are added)
PostSchema.virtual('userVote').get(function() {
  return 0; // Default value, will be replaced when votes are implemented
});

const Post = mongoose.model("Post", PostSchema);

export default Post;