# Backend Server Setup & Troubleshooting Guide

## The Issue
You're seeing a **404 (Not Found)** error when trying to connect to `http://localhost:5000/api`. This means:
- Your backend server is **NOT running** on port 5000, OR
- There's a connectivity issue, OR
- Environment variables are not properly configured

---

## Quick Start: Running the Backend

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies (if not done yet)
```bash
npm install
```

### Step 3: Create .env File
Copy the `.env.example` file to `.env` and update the required values:
```bash
# Create .env from .env.example
copy .env.example .env
```

**Minimum required configuration in `.env`:**
```
MONGODB_URI=mongodb://localhost:27017/GardenGrains1
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Step 4: Start the Backend Server

**Option A: Development Mode (with auto-reload)**
```bash
npm run dev
```

**Option B: Production Mode**
```bash
npm start
```

### Step 5: Verify Backend is Running
- If successful, you should see: `Server running on port 5000`
- Test the health endpoint: http://localhost:5000/api/health
- You should see: `{"status":"OK","message":"Garden Grains API is running"}`

---

## MongoDB Setup

The backend requires **MongoDB** to be running. Here's how to set it up:

### Option 1: Local MongoDB Installation
1. Install MongoDB Community Edition from: https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - **Windows**: MongoDB should auto-start or go to Services and start "MongoDB"
   - **Mac**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

### Option 2: MongoDB Atlas (Cloud)
1. Create an account at: https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/GardenGrains1?retryWrites=true&w=majority
   ```

---

## Troubleshooting Checklist

### ❌ "Cannot find module" error
**Solution**: Run `npm install` in the backend directory

### ❌ "MONGODB_URI is not defined"
**Solution**: Create `.env` file with the required variables. Copy from `.env.example`

### ❌ "MongoDB connection error"
**Solutions**:
- Make sure MongoDB is running (check Services on Windows)
- Verify MONGODB_URI in `.env` is correct
- If using MongoDB Atlas, check your IP whitelist

### ❌ "Port 5000 already in use"
**Solutions**:
- Close other apps using port 5000
- Or change PORT in `.env` to a different port (e.g., 5001)

### ❌ Still getting 404 error
**Debug steps**:
1. Check browser console - verify API URL is `http://localhost:5000/api`
2. Check server terminal - look for any error messages
3. Try accessing: http://localhost:5000/api/health directly in browser
4. Check frontend `.env` has correct `VITE_API_URL`

---

## Complete Startup Sequence

Run these in separate terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
# Should show: Server running on port 5000
# And: MongoDB connected successfully
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
# Should show: VITE v... ready in ... ms
```

---

## Testing the Connection

Once both servers are running, the frontend should:
- ✅ Load without 404 errors
- ✅ Allow you to browse the menu
- ✅ Allow you to log in/register
- ✅ Show the health endpoint response

If you still see 404 errors, check:
1. **Backend running?** Look for "Server running on port 5000" message
2. **MongoDB connected?** Look for "MongoDB connected successfully" message
3. **Frontend API URL?** Check `.env`: `VITE_API_URL=http://localhost:5000/api`
4. **Firewall?** Ensure port 5000 is not blocked

---

## Environment Variables Reference

| Variable | Required | Example |
|----------|----------|---------|
| MONGODB_URI | Yes | mongodb://localhost:27017/GardenGrains1 |
| JWT_SECRET | Yes | your-secret-key-123 |
| PORT | No | 5000 (default) |
| FRONTEND_URL | Yes | http://localhost:3000 |
| NODE_ENV | No | development |
| GMAIL_USER / GMAIL_PASS | No | Gmail address + app password |
| STRIPE_SECRET_KEY | No | sk_test_... |
| OPENAI_API_KEY | No | sk-... (chatbot AI replies) |
| ADMIN_PASSWORD | For `create-admin` | a strong password |
| ADMIN_RESET_EMAIL | No | inbox for admin reset codes |

---

## Need Help?

Check these logs:
- Backend console output (npm run dev window)
- Browser console (F12 → Console tab)
- Network tab (F12 → Network tab, filter to "api")

