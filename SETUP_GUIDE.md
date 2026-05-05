# MindLens AI Chatbot - Complete Setup Guide

This guide walks you through setting up and running the MindLens application with the new AI Support Chat feature.

## 📋 Prerequisites

- **Node.js** v18 or higher ([download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Google Gemini API Key** (free - [get one here](https://makersuite.google.com/app/apikey))

Verify your setup:
```bash
node --version  # Should show v18+
npm --version   # Should show 8+
```

---

## 🚀 Quick Start (5 minutes)

### Step 1: Get a Google Gemini API Key

1. Visit [Google Generative AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key

### Step 2: Set Up Backend Server

```bash
# Navigate to server directory
cd server

# Copy the environment template
cp .env.example .env

# Edit .env and paste your API key
# On Windows: notepad .env
# On Mac: nano .env
# On Linux: vim .env

# Your .env should look like:
# GEMINI_API_KEY=AIzaSyDr4r...
# PORT=5000
# NODE_ENV=development
```

### Step 3: Start Both Services

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```

Expected output:
```
✓ Server running on http://localhost:5000
✓ Chat API available at http://localhost:5000/api/chat
```

**Terminal 2 - Frontend App:**
```bash
npm run dev
```

Expected output:
```
  VITE v5.4.19  ready in 779 ms
  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.1.3:8080/
```

### Step 4: Test the App

1. Open `http://localhost:8080` in your browser
2. Navigate: Home → Journal → Camera → Burnout → **Questionnaire**
3. Complete the questionnaire and click **"Continue to AI Chat"**
4. Type a message and chat with the AI!

---

## 🔧 Detailed Setup Instructions

### For Windows Users

1. **Install Node.js:**
   - Download from https://nodejs.org/
   - Run installer with default settings
   - Open PowerShell/Command Prompt and verify: `node --version`

2. **Set Up Backend:**
   ```powershell
   cd C:\Users\[YourUsername]\Desktop\MindLens\server
   npm install
   ```

3. **Configure API Key:**
   ```powershell
   # Open .env in Notepad
   notepad .env
   
   # Paste your API key next to GEMINI_API_KEY=
   ```

4. **Start Server:**
   ```powershell
   npm run dev
   ```

### For Mac Users

1. **Install Node.js:**
   ```bash
   # Using Homebrew (install Homebrew first if needed)
   brew install node
   
   # Verify
   node --version
   ```

2. **Set Up Backend:**
   ```bash
   cd ~/Desktop/MindLens/server
   npm install
   ```

3. **Configure API Key:**
   ```bash
   # Open .env in your editor
   nano .env
   
   # Paste your API key, then press Ctrl+X, Y, Enter to save
   ```

4. **Start Server:**
   ```bash
   npm run dev
   ```

### For Linux Users

1. **Install Node.js:**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Verify
   node --version
   ```

2. **Set Up Backend:**
   ```bash
   cd ~/Desktop/MindLens/server
   npm install
   ```

3. **Configure API Key:**
   ```bash
   # Open .env in your editor
   vim .env
   
   # Or use nano
   nano .env
   ```

4. **Start Server:**
   ```bash
   npm run dev
   ```

---

## 📁 File Structure

```
MindLens/
├── src/
│   ├── pages/
│   │   ├── ChatPage.tsx          ← NEW: AI Chat interface
│   │   └── ... other pages
│   ├── components/
│   │   ├── ChatMessage.tsx       ← NEW: Message bubble component
│   │   ├── TypingIndicator.tsx   ← NEW: Loading animation
│   │   └── ... other components
│   └── App.tsx                   (updated with chat route)
├── server/
│   ├── server.ts                 ← NEW: Express backend
│   ├── package.json              (new backend dependencies)
│   ├── .env                      ← Set your API key here
│   ├── .env.example              (template)
│   └── README.md
└── README.md                     (main project guide)
```

---

## 🧪 Testing

### Test 1: Backend Health Check

```bash
# In a terminal, test the health endpoint
curl http://localhost:5000/api/health

# Should respond with:
# {"status":"ok","timestamp":"2026-05-04T18:00:00.000Z"}
```

### Test 2: Chat API

```bash
# Test the chat endpoint
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am stressed",
    "context": {"questionnaireScore": 3.5}
  }'

# Should respond with:
# {"success":true,"message":"That sounds tough..."}
```

### Test 3: Full User Flow

1. Complete questionnaire with various answers
2. Click "Continue to AI Chat"
3. Type several messages to ensure conversation flow works
4. Try different conversation topics
5. Click "Go to Dashboard" to verify navigation

---

## 🐛 Troubleshooting

### Issue: "Backend server is not running"

**Solution:**
```bash
# Make sure you're in the correct directory
cd server

# Check if npm packages are installed
ls node_modules

# If empty, reinstall
npm install

# Start the server
npm run dev
```

### Issue: "GEMINI_API_KEY is not defined"

**Solution:**
1. Check that `.env` file exists in `server/` directory
2. Verify it contains: `GEMINI_API_KEY=your_key_here`
3. Make sure there are NO spaces around the `=`
4. Restart the server after updating `.env`

```bash
# Example .env (correct format)
GEMINI_API_KEY=AIzaSyD...xyz123
PORT=5000

# WRONG (with spaces)
GEMINI_API_KEY = AIzaSyD...xyz123
```

### Issue: "Failed to fetch" or CORS error

**Solution:**
1. Ensure backend server is running (you should see "Server running on http://localhost:5000")
2. Check that the backend is on port 5000 (not blocked by firewall)
3. On Windows, you may need to allow Node.js through firewall:
   - Search "Allow an app through firewall"
   - Click "Allow another app"
   - Find Node.js and add it

### Issue: Frontend changes not appearing

**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Clear browser cache
3. Stop and restart dev server: `npm run dev`

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Reinstall all dependencies
rm -rf node_modules
npm install

# For backend
cd server
rm -rf node_modules
npm install
```

### Issue: Port already in use

If port 5000 or 8080 is already in use:

**On Windows:**
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

**On Mac/Linux:**
```bash
# Find process on port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

---

## 🔐 Security Notes

⚠️ **Important Security Reminders:**

1. **Never commit `.env` file** to version control
   - It contains your API key
   - Add `server/.env` to `.gitignore` (already done)

2. **Keep your API key private**
   - Don't share your GEMINI_API_KEY with anyone
   - If compromised, regenerate from Google Generative AI Studio

3. **Production Deployment**
   - Set environment variables on your hosting platform
   - Don't hardcode secrets in code
   - Use authentication if deploying publicly

---

## 📊 User Flow

```
🏠 Home
  ↓
📝 Journal
  ↓
📷 Mood Camera
  ↓
🔥 Burnout Check
  ↓
📋 Questionnaire (stores wellbeing data)
  ↓
💬 AI Support Chat (uses questionnaire context) ← NEW!
  ↓
📊 Insights Dashboard
```

---

## 🎯 What's New in This Update

✨ **New Features Added:**

1. **AI Support Chat Page** (`/chat`)
   - Context-aware conversations
   - Uses questionnaire responses
   - Beautiful UI matching MindLens design

2. **Backend API Server**
   - Secure Gemini API integration
   - Multi-turn conversation support
   - Error handling and timeouts

3. **New Components**
   - `ChatMessage`: Message bubble (user/AI)
   - `TypingIndicator`: Loading animation

4. **Enhanced Navigation**
   - Questionnaire → Chat → Dashboard flow
   - "Skip Chat" option available
   - Back navigation for retakes

---

## 📞 Support

### Common Questions

**Q: Do I need a Google account?**
A: Yes, to generate a Gemini API key from Google Generative AI Studio.

**Q: Is the API key free?**
A: Yes! Google provides free tier access for testing and development.

**Q: Are my conversations stored?**
A: No, only in your browser memory during the session. Conversations are not saved.

**Q: Can I use a different AI provider?**
A: Yes! You can modify `server/server.ts` to use OpenAI, Claude, or other APIs.

**Q: Why do I need a backend server?**
A: To keep your API key secure. It's never exposed to the frontend.

---

## 🚀 Next Steps

1. ✅ Get Gemini API key
2. ✅ Start backend server (`cd server && npm run dev`)
3. ✅ Start frontend app (`npm run dev`)
4. ✅ Test the chat flow
5. 🎓 Customize the system prompt in `server/server.ts` if desired
6. 🚀 Deploy to production (see deployment guides in docs)

---

## 📝 Notes

- The AI assistant uses a supportive, non-clinical tone
- It considers questionnaire responses for personalized support
- The system prompt explicitly avoids medical diagnosis
- Users are reminded that this is not a replacement for professional help

---

## ✅ Verification Checklist

Before declaring success, verify:

- [ ] Node.js v18+ installed
- [ ] Backend `.env` file has GEMINI_API_KEY
- [ ] Backend server running on port 5000
- [ ] Frontend app running on port 8080
- [ ] Can navigate through all pages
- [ ] Questionnaire redirects to chat
- [ ] Can send messages in chat
- [ ] AI responds with supportive messages
- [ ] Can navigate to dashboard from chat
- [ ] No console errors

---

**Happy chatting! 🎉**
