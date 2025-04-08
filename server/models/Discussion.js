import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['academic', 'projects', 'events', 'general']
  },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isLocked: { type: Boolean, default: false },
  scheduledTime: { type: Date },
  messages: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['active', 'scheduled', 'ended'],
    default: 'active'
  }
}, { timestamps: true });

export default mongoose.model('Discussion', discussionSchema);
