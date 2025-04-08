import mongoose from "mongoose"; // Add this import

const CommentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    votes: { type: Number, default: 0 },
    votesMap: { type: Map, of: Number, default: {} },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.virtual("userVote").get(function () {
    return this.votesMap.get(this.author.toString()) || 0;
});

const Comment = mongoose.model("Comment", CommentSchema);

export default Comment;