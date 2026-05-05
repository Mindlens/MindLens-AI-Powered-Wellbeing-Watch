<<<<<<< HEAD
# MindLens – AI Student Wellbeing Analyzer

MindLens is a comprehensive mental health and wellbeing platform for students, featuring AI-powered insights and supportive tools.
=======
🧠 MindLens – Wellbeing Watch

MindLens is an AI-powered mental wellbeing web application designed to help users track their mood, analyze emotional patterns, and enhance their mental health through intelligent insights and interactive dashboards. Built using modern development and AI tools, it offers a simple, intuitive, and accessible approach to daily wellbeing monitoring.
>>>>>>> 64566e07cf44fbf330ae8f64c0e00e6a2f4c857f

## Features

<<<<<<< HEAD
✨ **AI-Powered Analysis**
- **Journal Analysis**: AI-powered sentiment analysis detects stress, anxiety, and emotional patterns
- **Mood Camera**: Real-time facial emotion detection to understand emotional state
- **Burnout Risk Predictor**: Assess burnout based on sleep, study habits, and lifestyle
- **Mental Health Questionnaire**: Comprehensive mental health assessment
- **AI Support Chat**: Context-aware emotional support chatbot (NEW!)
- **Insights Dashboard**: View trends and personalized AI suggestions

🔒 **Privacy First**
- All data stays in your browser
- No data transmission or storage on servers
- Optional: Chat history stored only in session memory

## Quick Start

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080/`

### Backend Setup (for AI Chat)

The AI Support Chat requires a backend server to securely call the Gemini API.

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Add your Gemini API key to .env
# GEMINI_API_KEY=your_api_key_here

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000/`

**Get a Gemini API Key:**
1. Visit [Google Generative AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy to your `.env` file in the server directory

## User Flow

1. **Home** - Overview of all features
# MindLens – AI Student Wellbeing Analyzer

MindLens is an AI-powered mental wellbeing web application designed to help students track mood, analyze emotional patterns, and get supportive insights through journaling, camera-based mood detection, burnout analysis, a questionnaire, and an AI support chat.

## Features

✨ **AI-Powered Analysis**
- **Journal Analysis**: Sentiment analysis detects stress, anxiety, and emotional patterns
- **Mood Camera**: Real-time facial emotion detection to understand emotional state
- **Burnout Risk Predictor**: Assess burnout based on sleep, study habits, and lifestyle
- **Mental Health Questionnaire**: Structured mental health self-check
- **AI Support Chat**: Context-aware emotional support chatbot
- **Insights Dashboard**: View trends and personalized suggestions

🔒 **Privacy First**
- All data stays in your browser unless you explicitly use the chat backend
- Questionnaire and wellbeing state are kept in app state during the session
- API keys are never exposed to the frontend

## Quick Start

### Frontend Setup

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:8080/`

### Backend Setup for AI Chat

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Add your Gemini API key to `server/.env`:

```env
GEMINI_API_KEY=your_api_key_here
PORT=5000
NODE_ENV=development
```

The backend will run on `http://localhost:5000/`

## User Flow

1. Home
2. Journal
3. Mood Camera
4. Burnout Check
5. Questionnaire
6. AI Support Chat
7. Dashboard

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, React Router, Recharts

**Backend:** Express.js, Google Generative AI (Gemini), TypeScript, CORS

## Project Structure

```
MindLens/
├── src/
│   ├── pages/
│   ├── components/
│   ├── context/
│   ├── lib/
│   └── App.tsx
├── server/
│   ├── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
└── public/
```

## Development

### Run Both Services

Frontend:
```bash
npm run dev
```

Backend:
```bash
cd server
npm run dev
```

### Build

Frontend:
```bash
npm run build
```

Backend:
```bash
cd server
npm run build
```

## API Documentation

- `POST /api/chat` - Send a chat message and get a response
- `GET /api/health` - Health check

See [server/README.md](./server/README.md) for backend details.

## Design System

MindLens uses teal and green accents, rounded cards, gradient buttons, soft shadows, and glassmorphism-inspired surfaces.

## Important Notes

⚠️ **Disclaimer**
MindLens is a student project and is **not a substitute for professional medical advice, diagnosis, or treatment**.

## Troubleshooting

### Chat not working?
- Ensure backend is running on `localhost:5000`
- Confirm `GEMINI_API_KEY` is set in `server/.env`
- If Gemini quota is unavailable, the app falls back to a local supportive response engine

### Frontend won't start?
- Reinstall dependencies with `npm install`
- Check that Node.js 18+ is installed

## License

MIT - Free to use and modify

**Made with care for student wellbeing**
---
