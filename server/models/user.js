import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  department: { type: String, required: true },
  identifier: { type: String },
  gender: { type: String, default: "Not specified" },
  role: { type: String, default: "User" },
  age: { type: Number, default: 0 },
  email: { type: String, default: "notprovided@example.com", unique: true },
  avatar: {
    type: String,
    default: '/images/default_profile.jpg' // Updated default profile picture path
  }
});

export default mongoose.model("User", userSchema);