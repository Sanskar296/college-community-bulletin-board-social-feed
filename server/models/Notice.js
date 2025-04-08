import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
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
        message: props => `${props.value} is not a valid image format! Only JPG, JPEG and PNG are allowed.`
      }
    },
    url: String,
    data: Buffer,
    contentType: String,
    base64: String  // Add this field for base64 storage
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  department: { 
    type: String, 
    enum: ['all', 'aiml', 'comp', 'mech', 'civil', 'elect', 'extc'],
    default: 'all'
  }
});

// Add method to get base64 image
noticeSchema.methods.getImageAsBase64 = async function() {
  if (this.image && this.image.base64) {
    return this.image.base64;
  }
  return null;
};

// Add a pre-save middleware to validate image
noticeSchema.pre('save', function(next) {
  if (this.image && !this.image.mimetype) {
    next(new Error('Image type is required'));
  }
  next();
});

export default mongoose.model('Notice', noticeSchema);
