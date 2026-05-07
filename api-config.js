// API Configuration
// Update this file with your backend URL after deployment

const API_CONFIG = {
  // CHANGE THIS to your production backend URL
  // For local development: http://localhost:5000
  // For production (Railway): https://your-railway-url.up.railway.app
  BASE_URL: "http://localhost:5000",

  // API Endpoints (auto-constructed)
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
    SEND_OTP: "/api/auth/send-otp",
    VERIFY_OTP: "/api/auth/verify-otp",
    RESEND_OTP: "/api/auth/resend-otp",

    // User endpoints
    GET_PROFILE: "/api/user/profile",
    UPDATE_PROFILE: "/api/user/profile",
    UPLOAD_PHOTO: "/api/user/upload-photo",
    CHANGE_PASSWORD: "/api/user/change-password",

    // Health check
    HEALTH: "/api/health",
  },

  // Utility function to get full API URL
  getUrl: function (endpoint) {
    return this.BASE_URL + endpoint;
  },

  // Utility function for API calls
  async fetch(endpoint, options = {}) {
    const url = this.getUrl(endpoint);
    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok && response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
      }

      return await response.json();
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  },
};

// Export for use in modules (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = API_CONFIG;
}
