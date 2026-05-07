const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

// Parse custom Railway configuration variable if provided
const rawRailwayConfig =
  process.env.DANAH_WEB_CONF ||
  process.env["danah-web-conf"] ||
  process.env["danah_web_conf"] ||
  process.env["DANAH_WEB_CONF"] ||
  process.env["RAILWAY_STATIC_URL"] ||
  "";

const parsedRailwayConfig = {};
if (rawRailwayConfig) {
  try {
    // support JSON config or key=value pairs
    if (rawRailwayConfig.trim().startsWith("{")) {
      Object.assign(parsedRailwayConfig, JSON.parse(rawRailwayConfig));
    } else {
      rawRailwayConfig.split(/[\n;]+/).forEach((line) => {
        const [key, ...rest] = line.split("=");
        if (!key) return;
        parsedRailwayConfig[key.trim()] = rest.join("=").trim();
      });
    }
  } catch (err) {
    console.warn("Could not parse custom Railway config:", err.message);
  }
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  parsedRailwayConfig.MONGODB_URI ||
  parsedRailwayConfig.mongodb_uri ||
  parsedRailwayConfig.mongo_uri ||
  parsedRailwayConfig["mongo uri"] ||
  "";
const EMAIL_USER =
  process.env.EMAIL_USER ||
  parsedRailwayConfig.EMAIL_USER ||
  parsedRailwayConfig.email_user ||
  "";
const EMAIL_PASS =
  process.env.EMAIL_PASS ||
  parsedRailwayConfig.EMAIL_PASS ||
  parsedRailwayConfig.email_pass ||
  "";
const JWT_SECRET =
  process.env.JWT_SECRET ||
  parsedRailwayConfig.JWT_SECRET ||
  parsedRailwayConfig.jwt_secret ||
  "your-secret-key-change-in-production";

if (!process.env.MONGODB_URI && MONGODB_URI) {
  process.env.MONGODB_URI = MONGODB_URI;
}
if (!process.env.EMAIL_USER && EMAIL_USER) {
  process.env.EMAIL_USER = EMAIL_USER;
}
if (!process.env.EMAIL_PASS && EMAIL_PASS) {
  process.env.EMAIL_PASS = EMAIL_PASS;
}
if (!process.env.JWT_SECRET && JWT_SECRET) {
  process.env.JWT_SECRET = JWT_SECRET;
}

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow localhost, file protocol, and any netlify.app domain
      const allowedOrigins = [
        "http://localhost:3000",
        "http://127.0.0.1:5500",
        "file://",
        "http://localhost:5000",
      ];

      // Allow any netlify.app or railway.app domain
      if (
        origin &&
        (origin.includes("netlify.app") || origin.includes("railway.app"))
      ) {
        return callback(null, true);
      }

      // Allow requests with no origin (mobile apps, postman, etc)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("CORS not allowed"));
    },
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// OTP rate limiting (stricter)
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 OTP requests per windowMs
  message: "Too many OTP requests, please try again later.",
});
app.use("/api/auth/send-otp", otpLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Danah Web Backend is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Debug loaded environment configuration
console.log("🔧 Server configuration:");
console.log(" - PORT:", process.env.PORT || 8080);
console.log(" - MONGODB_URI present:", Boolean(process.env.MONGODB_URI));
console.log(" - EMAIL_USER present:", Boolean(process.env.EMAIL_USER));
console.log(" - EMAIL_PASS present:", Boolean(process.env.EMAIL_PASS));
console.log(" - JWT_SECRET present:", Boolean(process.env.JWT_SECRET));

// Connect to MongoDB
const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/danahweb";
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.log(
      "⚠️  Server will continue running without database connection for testing purposes",
    );
    // Don't exit process for testing
    // process.exit(1);
  });

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Danah Web Backend running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}/api`);
});
