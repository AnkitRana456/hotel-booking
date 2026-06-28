import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Can be Clerk ID or custom generated UUID/ObjectID
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  image: { type: String, default: "" },
  role: { 
    type: String, 
    enum: ["user", "hotelOwner", "admin"], 
    default: "user" 
  },
  password: { 
    type: String, 
    select: false // Exclude from query results by default
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  refreshTokens: {
    type: [String],
    default: []
  },
  wishlist: [{
    type: String,
    ref: "Hotel"
  }],
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  recentSearchedCities: [{ type: String, required: false }],
}, { timestamps: true });

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password validity
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;