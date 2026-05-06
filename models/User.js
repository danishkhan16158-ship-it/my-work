const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  // Basic Information
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },

  // Contact Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },

  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
  },

  countryCode: {
    type: String,
    required: true,
    default: "+91",
  },

  // Authentication
  password: {
    type: String,
    required: true,
    minlength: 8,
  },

  // OTP and Verification
  emailOTP: {
    code: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 },
  },

  smsOTP: {
    code: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 },
  },

  isEmailVerified: {
    type: Boolean,
    default: false,
  },

  isMobileVerified: {
    type: Boolean,
    default: false,
  },

  // Profile
  profilePhoto: {
    type: String, // URL/path to uploaded photo
    default: null,
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true,
  },

  // Timestamps
  lastLogin: {
    type: Date,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate OTP
userSchema.methods.generateOTP = function (type = "email") {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  if (type === "email") {
    this.emailOTP = {
      code: otp,
      expiresAt,
      attempts: 0,
    };
  } else if (type === "sms") {
    this.smsOTP = {
      code: otp,
      expiresAt,
      attempts: 0,
    };
  }

  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function (code, type = "email") {
  const otpData = type === "email" ? this.emailOTP : this.smsOTP;

  if (!otpData || !otpData.code) {
    return { valid: false, message: "No OTP found" };
  }

  if (otpData.attempts >= 3) {
    return {
      valid: false,
      message: "Too many attempts. Please request a new OTP.",
    };
  }

  if (new Date() > otpData.expiresAt) {
    return { valid: false, message: "OTP has expired" };
  }

  if (otpData.code !== code) {
    otpData.attempts += 1;
    return { valid: false, message: "Invalid OTP" };
  }

  // Clear OTP after successful verification
  if (type === "email") {
    this.emailOTP = undefined;
    this.isEmailVerified = true;
  } else {
    this.smsOTP = undefined;
    this.isMobileVerified = true;
  }

  return { valid: true, message: "OTP verified successfully" };
};

// Update the updatedAt field before saving
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
