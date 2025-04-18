import mongoose from "mongoose";

const facultyRequestSchema = new mongoose.Schema({
  // Basic user info (matches signup credentials)
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  firstname: { 
    type: String, 
    required: true, 
    trim: true 
  },
  lastname: { 
    type: String, 
    required: true, 
    trim: true 
  },
  department: { 
    type: String, 
    required: true,
    enum: ['aiml', 'comp', 'extc', 'elect', 'civil', 'mech']
  },

  // Request Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: Date,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
facultyRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('FacultyRequest', facultyRequestSchema);
