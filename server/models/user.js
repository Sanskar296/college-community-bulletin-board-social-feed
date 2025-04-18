import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
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
  role: { 
    type: String, 
    required: true,
    enum: ['student', 'faculty'],
    default: 'student'
  },
  uid: { 
    type: String,
    sparse: true,
    unique: true
  },
  year: {
    type: String,
    enum: ['FE', 'SE', 'TE', 'BE', 'NA'],
    default: 'FE'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'rejected'],
    default: 'active'
  },
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role === 'student';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Drop any existing email index when starting the server
userSchema.statics.dropEmailIndex = async function() {
  try {
    await this.collection.dropIndex('email_1');
    console.log('Email index dropped successfully');
  } catch (err) {
    // Ignore if index doesn't exist
    if (err.code !== 27) {
      console.error('Error dropping email index:', err);
    }
  }
};

// Call dropEmailIndex when model is compiled
const User = mongoose.model("User", userSchema);
User.dropEmailIndex();

export default User;