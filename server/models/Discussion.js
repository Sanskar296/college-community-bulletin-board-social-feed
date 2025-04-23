import mongoose from "mongoose";

const DiscussionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: String,
      required: true,
      enum: ["academic", "projects", "events", "general"],
      default: "general"
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    participants: {
      type: Number,
      default: 1
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active"
    }
  },
  { timestamps: true }
);

const Discussion = mongoose.model("Discussion", DiscussionSchema);

export default Discussion;
