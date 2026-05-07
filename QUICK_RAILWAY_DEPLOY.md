# 🚀 Quick Railway Deployment (Web Dashboard)

Since CLI authentication is having issues, let's use the Railway web dashboard - it's actually easier!

## ✅ Step-by-Step Deployment:

### 1. Go to Railway Dashboard
- Open [railway.app](https://railway.app) in your browser
- Make sure you're logged in with GitHub

### 2. Create New Project
- Click **"Create New Project"**
- Select **"Deploy from GitHub repo"**
- Search for and select: `my-work`
- Click **"Deploy now"**

### 3. Wait for Initial Deploy
- Railway will automatically detect your Node.js app
- It will install dependencies and start the server
- This takes 2-3 minutes

### 4. Set Environment Variables
Once deployed (green checkmark):
- Click on your project card
- Go to **"Variables"** tab
- Add these variables:

```
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456789
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
MONGODB_URI=mongodb+srv://demo:demo123@cluster0.mongodb.net/danahweb?retryWrites=true&w=majority
```

### 5. Get Your Backend URL
- Go to **"Settings"** tab
- Copy the **"Domain"** URL (looks like: `https://my-work-production.up.railway.app`)

### 6. Update Frontend API Config
Edit `api-config.js` line 8:
```javascript
// Change this line:
BASE_URL: "http://localhost:5000",

// To your Railway URL:
BASE_URL: "https://my-work-production.up.railway.app",
```

### 7. Commit & Push
```bash
git add api-config.js
git commit -m "Update API endpoint to production backend"
git push origin master
```

## 🔧 For Gmail OTP Setup:

1. Enable 2-Step Verification on Gmail
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate an App Password
4. Use that password in `EMAIL_PASS` variable

## 📊 Monitor Your App:

- **View logs:** Project → Logs tab
- **Check health:** Visit `https://your-url.up.railway.app/api/health`
- **Restart if needed:** Project → Settings → Restart

## 🎯 That's it!

Your backend will be live and your frontend will connect to it automatically after the next Netlify deploy!