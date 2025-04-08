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
        enum: ['image/jpeg', 'image/png', 'image/jpg'],
        validate: {
          validator: function(v) {
            return ['image/jpeg', 'image/png', 'image/jpg'].includes(v);
          },
          message: props => `${props.value} is not a valid image format!`
        }
      }
    },
    votes: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);

export default Post;