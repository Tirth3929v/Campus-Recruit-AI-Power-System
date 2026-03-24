# 🚀 Quick Start Guide - Campus Recruitment System

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v18+) installed
- ✅ MongoDB installed and running
- ✅ npm or yarn installed
- ✅ Git installed

---

## 🏃 Quick Start (3 Steps)

### Step 1: Start MongoDB
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

### Step 2: Start Backend Server
```bash
cd "d:\SEM-6\Major final\server"
npm install
npm start
```

**Expected Output:**
```
🔗 Attempting MongoDB connection to: mongodb://127.0.0.1:27017/campus_recruit_v2
✅ MongoDB Connected: 127.0.0.1
📊 MongoDB ready - campus_recruit_v2 DB
🚀 Server fully initialized and listening on port 5000
```

### Step 3: Start Company Portal
```bash
# Open NEW terminal
cd "d:\SEM-6\Major final\company"
npm install
npm run dev
```

**Expected Output:**
```
  VITE v5.4.1  ready in 500 ms

  ➜  Local:   http://localhost:5177/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## 🌐 Access the Application

### Company Portal
- URL: http://localhost:5177
- Login: Use company credentials or register

### Other Portals (Optional)

#### Admin Portal
```bash
cd "d:\SEM-6\Major final\admin"
npm install
npm run dev
# Access: http://localhost:5173
```

#### Employee Portal
```bash
cd "d:\SEM-6\Major final\employee"
npm install
npm run dev
# Access: http://localhost:5174
```

#### User/Student Portal
```bash
cd "d:\SEM-6\Major final\user"
npm install
npm run dev
# Access: http://localhost:5175
```

---

## 🧪 Test the AI Interview Feature

### 1. Register/Login
1. Go to http://localhost:5177/login
2. Register a new account or login
3. Verify your email with OTP

### 2. Start AI Interview
1. Navigate to AI Interview section
2. Select job role and skills
3. Choose interview topic (e.g., "MERN Stack")
4. Click "Start Interview"

### 3. During Interview
- ✅ Camera and microphone will be requested
- ✅ AI will ask dynamic questions
- ✅ You can type or use voice dictation
- ✅ Proctoring will monitor your behavior
- ✅ 2 minutes per question
- ✅ 5 questions total

### 4. View Results
- ✅ Overall score (0-100%)
- ✅ Detailed feedback
- ✅ Question-by-question analysis
- ✅ Strengths and improvements

---

## 🔧 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh

# If not running, start it
mongod
```

### Port Already in Use
```bash
# Kill process on port 5000 (Backend)
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Kill process on port 5177 (Frontend)
# Windows
netstat -ano | findstr :5177
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5177 | xargs kill -9
```

### Gemini API Error
- Check `.env` file has valid `GEMINI_API_KEY`
- Verify API key at: https://makersuite.google.com/app/apikey
- Fallback questions will be used if API fails

### Camera/Microphone Not Working
- Allow browser permissions for camera/microphone
- Use Chrome or Edge (best compatibility)
- Check if other apps are using camera/mic

### Face Detection Not Loading
- Check internet connection (loads from CDN)
- Wait 5-10 seconds for models to load
- Check browser console for errors

---

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://127.0.0.1:27017/campus_recruit_v2
JWT_SECRET=campus_recruit_jwt_secret_2026_secure_key
GEMINI_API_KEY=AIzaSyB9DVPFR9tKh2AxLfrx5uGyNmZEwasneFg
PORT=5000
EMAIL_USER=tirthpatel82032@gmail.com
EMAIL_PASS=zuessfjgehxxwluh
```

---

## 🎯 Key Features to Test

### 1. AI Interview
- [x] Dynamic question generation
- [x] Voice recognition
- [x] Text-to-speech
- [x] Real-time proctoring
- [x] Strict grading

### 2. Proctoring
- [x] Face detection
- [x] Multiple faces warning
- [x] Looking away detection
- [x] Tab switching detection
- [x] Window blur detection

### 3. Grading
- [x] Gibberish detection (0 score)
- [x] Keyword matching
- [x] Technical accuracy
- [x] Communication skills
- [x] Comprehensive feedback

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
├─────────────────────────────────────────────────────────┤
│  Admin (5173) │ Employee (5174) │ User (5175) │ Company (5177) │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend Server (5000)                 │
├─────────────────────────────────────────────────────────┤
│  • Express.js                                            │
│  • JWT Authentication                                    │
│  • REST API                                              │
│  • Socket.io                                             │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌──────────────────────┐   ┌──────────────────────┐
│   MongoDB (27017)    │   │   Gemini AI API      │
├──────────────────────┤   ├──────────────────────┤
│  • Users             │   │  • Question Gen      │
│  • Sessions          │   │  • Grading           │
│  • Interviews        │   │  • Feedback          │
└──────────────────────┘   └──────────────────────┘
```

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Backend shows: `🚀 Server fully initialized and listening on port 5000`
2. ✅ Frontend shows: `➜  Local:   http://localhost:5177/`
3. ✅ MongoDB shows: `✅ MongoDB Connected: 127.0.0.1`
4. ✅ You can login/register successfully
5. ✅ AI interview starts without errors
6. ✅ Camera and microphone work
7. ✅ Face detection loads (green indicator)
8. ✅ Questions are generated dynamically
9. ✅ Grading works and shows results

---

## 📞 Need Help?

1. Check `ERRORS_FIXED.md` for known issues
2. Check browser console for errors (F12)
3. Check server logs in terminal
4. Verify all environment variables
5. Ensure MongoDB is running
6. Check network connectivity

---

## 🔄 Restart Everything

If something goes wrong, restart in this order:

```bash
# 1. Stop all processes (Ctrl+C in each terminal)

# 2. Restart MongoDB
mongod

# 3. Restart Backend
cd server
npm start

# 4. Restart Frontend
cd company
npm run dev
```

---

**Happy Coding! 🚀**

Last Updated: January 2025
