import mongoose from "mongoose"

const VoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["post", "comment"], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, refPath: "targetType", required: true },
    value: { type: Number, enum: [-1, 1], required: true },
  },
  { timestamps: true }
);

// Compound index to ensure a user can only vote once per target
VoteSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });

const Vote = mongoose.model("Vote", VoteSchema);

export default Vote;