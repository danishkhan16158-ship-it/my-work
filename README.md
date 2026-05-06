# Danah Web Backend

A comprehensive Node.js backend for Danah Web with OTP authentication, user management, and file uploads.

## 🚀 Features

- **User Registration & Authentication**
- **Email & SMS OTP Verification**
- **JWT Token-based Authentication**
- **Profile Photo Upload**
- **Password Management**
- **Rate Limiting & Security**
- **MongoDB Integration**

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Gmail account (for email OTP) or other SMTP service

## 🛠️ Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Setup MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env` file

3. **Configure Email Service**
   - For Gmail: Enable 2FA and generate App Password
   - Update `EMAIL_USER` and `EMAIL_PASS` in `.env`

4. **Start the Server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📧 Email Configuration

### Gmail Setup

1. Enable 2FA on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use your Gmail address as `EMAIL_USER`
4. Use the App Password as `EMAIL_PASS`

### Other Email Services

Update the transporter configuration in `routes/auth.js` for services like SendGrid, Mailgun, etc.

## 📱 SMS Configuration

Currently using mock SMS service. For production:

### Twilio Setup

1. Create Twilio account
2. Get Account SID, Auth Token, and Phone Number
3. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID=your-sid
   TWILIO_AUTH_TOKEN=your-token
   TWILIO_PHONE_NUMBER=your-number
   ```
4. Update the `sendSMS` function in `routes/auth.js`

## 🔐 API Endpoints

### Authentication Routes

#### POST `/api/auth/signup`

Register a new user.

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "countryCode": "+91",
  "password": "StrongPass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email and mobile.",
  "userId": "...",
  "requiresVerification": true
}
```

#### POST `/api/auth/send-otp`

Send OTP to email or mobile.

**Request Body:**

```json
{
  "email": "john@example.com",
  "type": "email"
}
```

#### POST `/api/auth/verify-otp`

Verify OTP and complete registration/login.

**Request Body:**

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "type": "email"
}
```

#### POST `/api/auth/login`

Login with email/mobile and password.

**Request Body:**

```json
{
  "identifier": "john@example.com",
  "password": "StrongPass123!"
}
```

### User Routes (Require Authentication)

#### GET `/api/user/profile`

Get user profile information.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

#### PUT `/api/user/profile`

Update user profile.

**Request Body:**

```json
{
  "fullName": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### POST `/api/user/upload-photo`

Upload profile photo.

**Content-Type:** `multipart/form-data`
**Form Data:** `profilePhoto` (image file)

#### DELETE `/api/user/profile-photo`

Delete profile photo.

#### POST `/api/user/change-password`

Change user password.

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewStrongPass123!"
}
```

#### DELETE `/api/user/account`

Deactivate user account.

## 🔒 Security Features

- **Rate Limiting:** Prevents brute force attacks
- **Input Validation:** Comprehensive validation with express-validator
- **Password Hashing:** bcrypt with salt rounds
- **JWT Authentication:** Secure token-based auth
- **CORS Protection:** Configured for frontend integration
- **Helmet Security:** Security headers
- **File Upload Security:** Type and size validation

## 📁 Project Structure

```
danah-web-backend/
├── models/
│   └── User.js              # User model with OTP methods
├── routes/
│   ├── auth.js              # Authentication routes
│   └── user.js              # User management routes
├── uploads/                 # Profile photo storage
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── server.js                # Main server file
└── README.md               # This file
```

## 🧪 Testing the API

### Using cURL

1. **Signup:**

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "mobile": "9876543210",
    "countryCode": "+91",
    "password": "TestPass123!"
  }'
```

2. **Send OTP:**

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "type": "email"
  }'
```

3. **Verify OTP:**

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "type": "email"
  }'
```

## 🔧 Frontend Integration

Update your frontend JavaScript to call these API endpoints. Here's an example for login:

```javascript
// Login function
async function login(identifier, password) {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Store JWT token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to dashboard
      window.location.href = "/dashboard.html";
    } else {
      // Handle error
      console.error(data.message);
    }
  } catch (error) {
    console.error("Login failed:", error);
  }
}
```

## 🚀 Deployment

### Environment Variables for Production

- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production database
- Set up production email/SMS services
- Use HTTPS in production

### PM2 for Production

```bash
npm install -g pm2
pm2 start server.js --name "danah-web-backend"
```

## 📞 Support

For issues or questions:

- Check the console logs for error messages
- Verify MongoDB connection
- Ensure email credentials are correct
- Check firewall settings for port 5000

## 📝 License

This project is licensed under the ISC License.
