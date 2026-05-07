# 🚀 Deploy Backend to Railway

Railway is a free platform to host Node.js applications. This guide will help you deploy your Danah Web backend in 5 minutes.

## ✅ Quick Start

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **Sign Up** → **Sign up with GitHub**
3. Authorize Railway to access your GitHub account
4. Accept the terms and create your account

### Step 2: Deploy Your Project

1. On Railway dashboard, click **Create New Project**
2. Select **Deploy from GitHub repo**
3. Search for and select `my-work` repository
4. Click **Deploy now**

### Step 3: Set Environment Variables

1. Go to your Railway project dashboard
2. Click on the service card
3. Go to the **Variables** tab
4. Add these variables:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/danahweb
JWT_SECRET=your_jwt_secret_key_here_change_this
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

**For Gmail Setup:**

- Enable 2-Step Verification on your Gmail account
- Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Generate an App Password
- Use that password in `EMAIL_PASS`

### Step 4: Get Your Live URL

1. Once deployment finishes (green check mark)
2. Click the service
3. Go to **Settings** tab
4. Copy the **Domain URL** (e.g., `https://my-work-production.up.railway.app`)
5. This is your `BACKEND_URL` - save it!

### Step 5: Update Frontend

Replace `http://localhost:5000` with your Railway URL in:

- `login.html`
- `signup.html`
- `verify-otp.html`
- `index.html`

**Example:**

```javascript
// OLD (localhost)
const response = await fetch("http://localhost:5000/api/auth/login", {

// NEW (Railway)
const response = await fetch("https://my-work-production.up.railway.app/api/auth/login", {
```

### Step 6: Commit and Redeploy

```bash
git add .
git commit -m "Update API endpoints to production backend"
git push origin master
```

Your site will automatically redeploy on Netlify with the new backend URL!

## 🔍 Troubleshooting

**Backend won't deploy?**

- Check build logs in Railway dashboard
- Ensure `.env` file is in `.gitignore` (don't commit secrets)
- Check that `package.json` and `server.js` exist

**Getting CORS errors?**

- Make sure you updated `server.js` with the new CORS configuration
- The backend automatically accepts Netlify domains

**OTP emails not sending?**

- Verify Gmail credentials in Railway Variables
- Check spam folder
- Test with the API documentation

**Database connection issues?**

- For free hosting, use MongoDB Atlas (cloud database)
- Get connection string from [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- Update `MONGODB_URI` in Railway Variables

## 📊 Monitoring

**Check logs:**

1. Go to Railway project
2. Click service card
3. Go to **Logs** tab
4. See real-time backend activity

**Test your backend:**

- Visit: `https://your-railway-url.up.railway.app/api/health`
- Should show: `{"status":"OK","message":"Danah Web Backend is running"}`

## 💡 Tips

- **Free tier includes:** 500 hours/month (covers development/testing)
- **Auto-restart:** Railway restarts your app if it crashes
- **GitHub integration:** Push to GitHub, Railway auto-deploys
- **Scale later:** Upgrade to paid if you need more resources

## 🆘 Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- GitHub Issues: Report bugs in your repository
- Check `VSCODE_TARGET_SESSION_LOG` for debug info
