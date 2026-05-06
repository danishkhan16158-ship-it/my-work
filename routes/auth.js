const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const User = require("../models/User");

const router = express.Router();

// Check if database is connected
const isDbConnected = () => mongoose.connection.readyState === 1;

// Mock user storage for testing without database
let mockUsers = [];
let mockOtps = {};

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
});

// Mock SMS service (replace with actual SMS service like Twilio)
const sendSMS = async (phoneNumber, message) => {
  console.log(`📱 SMS to ${phoneNumber}: ${message}`);
  // In production, integrate with Twilio, AWS SNS, etc.
  return true;
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "your-secret-key-change-in-production",
    { expiresIn: "7d" },
  );
};

// Validation middleware
const validateSignup = [
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("mobile")
    .isLength({ min: 10, max: 10 })
    .isNumeric()
    .withMessage("Mobile number must be 10 digits"),

  body("countryCode")
    .isIn(["+91", "+1", "+44", "+971"])
    .withMessage("Invalid country code"),

  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least 8 characters with uppercase, lowercase, number and special character",
    ),
];

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post("/signup", validateSignup, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { fullName, email, mobile, countryCode, password } = req.body;

    if (isDbConnected()) {
      // Database connected - use real MongoDB operations
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { mobile }],
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:
            existingUser.email === email
              ? "Email already registered"
              : "Mobile number already registered",
        });
      }

      // Create new user
      const user = new User({
        fullName,
        email,
        mobile,
        countryCode,
        password,
      });

      await user.save();

      // Generate and send OTPs
      const emailOTP = user.generateOTP("email");
      const smsOTP = user.generateOTP("sms");

      // Send email OTP
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Welcome to Danah Web - Verify Your Email",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to Danah Web!</h2>
              <p>Hi ${fullName},</p>
              <p>Your email verification code is:</p>
              <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                ${emailOTP}
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }

      // Send SMS OTP
      try {
        await sendSMS(
          `${countryCode}${mobile}`,
          `Danah Web: Your SMS verification code is ${smsOTP}. Valid for 10 minutes.`,
        );
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
      }

      await user.save();

      res.status(201).json({
        success: true,
        message:
          "User registered successfully. Please verify your email and mobile.",
        userId: user._id,
        requiresVerification: true,
      });
    } else {
      // Mock mode - simulate user creation
      const existingUser = mockUsers.find(
        (u) => u.email === email || u.mobile === mobile,
      );
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:
            existingUser.email === email
              ? "Email already registered"
              : "Mobile number already registered",
        });
      }

      const userId = Date.now().toString();
      const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
      const smsOTP = Math.floor(100000 + Math.random() * 900000).toString();

      mockUsers.push({
        _id: userId,
        fullName,
        email,
        mobile,
        countryCode,
        password,
        emailVerified: false,
        mobileVerified: false,
        createdAt: new Date(),
      });

      mockOtps[email] = {
        otp: emailOTP,
        type: "email",
        expires: Date.now() + 10 * 60 * 1000,
      };
      mockOtps[mobile] = {
        otp: smsOTP,
        type: "sms",
        expires: Date.now() + 10 * 60 * 1000,
      };

      console.log(`📧 Mock Email OTP for ${email}: ${emailOTP}`);
      console.log(`📱 Mock SMS OTP for ${mobile}: ${smsOTP}`);

      res.status(201).json({
        success: true,
        message:
          "User registered successfully. Please verify your email and mobile.",
        userId,
        requiresVerification: true,
      });
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP to email or mobile
// @access  Public
router.post("/send-otp", async (req, res) => {
  try {
    const { email, mobile, type } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile number is required",
      });
    }

    if (isDbConnected()) {
      // Database connected - use real MongoDB operations
      let user;
      if (email) {
        user = await User.findOne({ email });
      } else {
        user = await User.findOne({ mobile });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const otp = user.generateOTP(type);
      await user.save();

      if (type === "email" && email) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Danah Web - Email Verification Code",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Email Verification</h2>
                <p>Your verification code is:</p>
                <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                  ${otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
          return res.status(500).json({
            success: false,
            message: "Failed to send email OTP",
          });
        }
      } else if (type === "sms" && mobile) {
        try {
          await sendSMS(
            `${user.countryCode}${mobile}`,
            `Danah Web: Your verification code is ${otp}. Valid for 10 minutes.`,
          );
        } catch (smsError) {
          console.error("SMS sending failed:", smsError);
          return res.status(500).json({
            success: false,
            message: "Failed to send SMS OTP",
          });
        }
      }

      res.json({
        success: true,
        message: `${type.toUpperCase()} OTP sent successfully`,
      });
    } else {
      // Mock mode - generate and store OTP
      const identifier = email || mobile;
      const user = mockUsers.find(
        (u) => u.email === email || u.mobile === mobile,
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      mockOtps[identifier] = {
        otp,
        type,
        expires: Date.now() + 10 * 60 * 1000,
      };

      console.log(
        `📧 Mock ${type.toUpperCase()} OTP for ${identifier}: ${otp}`,
      );

      res.json({
        success: true,
        message: `${type.toUpperCase()} OTP sent successfully`,
      });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and complete registration/login
// @access  Public
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, mobile, otp, type } = req.body;

    if (!otp || (!email && !mobile)) {
      return res.status(400).json({
        success: false,
        message: "OTP and email/mobile are required",
      });
    }

    if (isDbConnected()) {
      // Database connected - use real MongoDB operations
      let user;
      if (email) {
        user = await User.findOne({ email });
      } else {
        user = await User.findOne({ mobile });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const result = user.verifyOTP(otp, type);

      if (!result.valid) {
        await user.save();
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      await user.save();

      // Check if both email and mobile are verified
      const isFullyVerified = user.isEmailVerified && user.isMobileVerified;

      if (isFullyVerified) {
        // Generate JWT token
        const token = generateToken(user._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
          success: true,
          message: "OTP verified successfully",
          token,
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
      } else {
        res.json({
          success: true,
          message: `${type.toUpperCase()} verified successfully`,
          requiresVerification: true,
          verified: type,
          remainingVerification: type === "email" ? "sms" : "email",
        });
      }
    } else {
      // Mock mode - verify OTP from mock storage
      const identifier = email || mobile;
      const storedOtp = mockOtps[identifier];

      if (!storedOtp || storedOtp.type !== type) {
        return res.status(400).json({
          success: false,
          message: "No OTP found for this identifier",
        });
      }

      if (Date.now() > storedOtp.expires) {
        delete mockOtps[identifier];
        return res.status(400).json({
          success: false,
          message: "OTP has expired",
        });
      }

      if (storedOtp.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      // Find user and update verification status
      const user = mockUsers.find(
        (u) => u.email === email || u.mobile === mobile,
      );
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (type === "email") {
        user.emailVerified = true;
      } else if (type === "sms") {
        user.mobileVerified = true;
      }

      // Remove used OTP
      delete mockOtps[identifier];

      // Check if both are verified
      const isFullyVerified = user.emailVerified && user.mobileVerified;

      if (isFullyVerified) {
        // Generate mock JWT token
        const token = generateToken(user._id);

        res.json({
          success: true,
          message: "OTP verified successfully",
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            profilePhoto: user.profilePhoto,
            isEmailVerified: user.emailVerified,
            isMobileVerified: user.mobileVerified,
          },
        });
      } else {
        res.json({
          success: true,
          message: `${type.toUpperCase()} verified successfully`,
          requiresVerification: true,
          verified: type,
          remainingVerification: type === "email" ? "sms" : "email",
        });
      }
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login with email/mobile and password
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or mobile

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/mobile and password are required",
      });
    }

    if (isDbConnected()) {
      // Database connected - use real MongoDB operations
      // Find user by email or mobile
      const user = await User.findOne({
        $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }],
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Account is deactivated",
        });
      }

      // Check if user needs verification
      if (!user.isEmailVerified || !user.isMobileVerified) {
        // Send OTPs for verification
        const emailOTP = user.generateOTP("email");
        const smsOTP = user.generateOTP("sms");

        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Danah Web - Complete Your Verification",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Complete Your Verification</h2>
                <p>Your email verification code is:</p>
                <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                  ${emailOTP}
                </div>
              </div>
            `,
          });
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
        }

        try {
          await sendSMS(
            `${user.countryCode}${user.mobile}`,
            `Danah Web: Your verification code is ${smsOTP}. Valid for 10 minutes.`,
          );
        } catch (smsError) {
          console.error("SMS sending failed:", smsError);
        }

        await user.save();

        return res.json({
          success: true,
          message: "Please verify your account",
          requiresVerification: true,
          userId: user._id,
        });
      }

      // Generate JWT token
      const token = generateToken(user._id);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          profilePhoto: user.profilePhoto,
          isEmailVerified: user.isEmailVerified,
          isMobileVerified: user.isMobileVerified,
          lastLogin: user.lastLogin,
        },
      });
    } else {
      // Mock mode - simulate login
      const user = mockUsers.find(
        (u) => u.email === identifier.toLowerCase() || u.mobile === identifier,
      );

      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check if user needs verification
      if (!user.emailVerified || !user.mobileVerified) {
        // Generate mock OTPs
        const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const smsOTP = Math.floor(100000 + Math.random() * 900000).toString();

        mockOtps[user.email] = {
          otp: emailOTP,
          type: "email",
          expires: Date.now() + 10 * 60 * 1000,
        };
        mockOtps[user.mobile] = {
          otp: smsOTP,
          type: "sms",
          expires: Date.now() + 10 * 60 * 1000,
        };

        console.log(`📧 Mock Email OTP for ${user.email}: ${emailOTP}`);
        console.log(`📱 Mock SMS OTP for ${user.mobile}: ${smsOTP}`);

        return res.json({
          success: true,
          message: "Please verify your account",
          requiresVerification: true,
          userId: user._id,
        });
      }

      // Generate mock JWT token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          profilePhoto: user.profilePhoto,
          isEmailVerified: user.emailVerified,
          isMobileVerified: user.mobileVerified,
          lastLogin: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

module.exports = router;
