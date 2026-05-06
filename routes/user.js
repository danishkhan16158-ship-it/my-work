const express = require("express");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
    );
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "profile-" +
        req.user._id +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname),
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -emailOTP -smsOTP",
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        countryCode: user.countryCode,
        profilePhoto: user.profilePhoto,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { fullName, email, mobile } = req.body;
    const user = req.user;

    // Check if email or mobile is being changed and if they're already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      user.email = email;
      user.isEmailVerified = false; // Require re-verification
    }

    if (mobile && mobile !== user.mobile) {
      const existingUser = await User.findOne({ mobile });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Mobile number already in use",
        });
      }
      user.mobile = mobile;
      user.isMobileVerified = false; // Require re-verification
    }

    if (fullName) {
      user.fullName = fullName;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        profilePhoto: user.profilePhoto,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/user/upload-photo
// @desc    Upload profile photo
// @access  Private
router.post(
  "/upload-photo",
  authenticateToken,
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Delete old profile photo if exists
      if (req.user.profilePhoto) {
        const fs = require("fs");
        const path = require("path");
        const oldPhotoPath = path.join(__dirname, "..", req.user.profilePhoto);

        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      // Update user profile photo
      req.user.profilePhoto = req.file.path;
      await req.user.save();

      res.json({
        success: true,
        message: "Profile photo uploaded successfully",
        profilePhoto: req.file.path,
      });
    } catch (error) {
      console.error("Upload photo error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during upload",
      });
    }
  },
);

// @route   DELETE /api/user/profile-photo
// @desc    Delete profile photo
// @access  Private
router.delete("/profile-photo", authenticateToken, async (req, res) => {
  try {
    if (!req.user.profilePhoto) {
      return res.status(400).json({
        success: false,
        message: "No profile photo to delete",
      });
    }

    // Delete file from filesystem
    const fs = require("fs");
    const path = require("path");
    const photoPath = path.join(__dirname, "..", req.user.profilePhoto);

    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    // Update user profile
    req.user.profilePhoto = null;
    await req.user.save();

    res.json({
      success: true,
      message: "Profile photo deleted successfully",
    });
  } catch (error) {
    console.error("Delete photo error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/user/change-password
// @desc    Change user password
// @access  Private
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Validate new password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (newPassword.length < 8 || !passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters with uppercase, lowercase, number and special character",
      });
    }

    // Verify current password
    const isCurrentPasswordValid =
      await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   DELETE /api/user/account
// @desc    Deactivate user account
// @access  Private
router.delete("/account", authenticateToken, async (req, res) => {
  try {
    req.user.isActive = false;
    await req.user.save();

    res.json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
