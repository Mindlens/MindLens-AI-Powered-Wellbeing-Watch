# MindLens – AI Student Wellbeing Analyzer

MindLens is a comprehensive mental health and wellbeing platform for students, featuring AI-powered insights and supportive tools.

## Features

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
2. **Journal** - Write and get sentiment analysis
3. **Mood Camera** - Facial emotion detection
4. **Burnout Check** - Lifestyle assessment
5. **Questionnaire** - Mental health questions → **redirects to:**
6. **AI Support Chat** (NEW!) - Talk to supportive AI assistant → **then go to:**
7. **Dashboard** - View all insights and trends

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS + shadcn/ui for styling
- Framer Motion for animations
- React Router for navigation
- Recharts for data visualization
- React Query for state management

**Backend:**
- Express.js
- Google Generative AI (Gemini)
- TypeScript
- CORS enabled for secure requests

## Project Structure

```
MindLens/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── JournalPage.tsx
│   │   ├── CameraPage.tsx
│   │   ├── BurnoutPage.tsx
│   │   ├── QuestionnairePage.tsx
│   │   ├── ChatPage.tsx (NEW!)
│   │   ├── DashboardPage.tsx
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── ChatMessage.tsx (NEW!)
│   │   ├── TypingIndicator.tsx (NEW!)
│   │   ├── AppLayout.tsx
│   │   └── ... (UI components)
│   ├── context/
│   │   └── WellbeingContext.tsx
│   ├── lib/
│   │   └── analysis.ts
│   └── App.tsx
├── server/
│   ├── server.ts (NEW!)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
└── public/
```

## Development

### Running Both Frontend & Backend

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
```

### Build for Production

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
cd server
npm run build
```

### Run Tests

```bash
npm run test
```

## API Documentation

The AI Chat uses a backend API to securely communicate with Gemini:

- **POST** `/api/chat` - Send a message and get AI response
- **GET** `/api/health` - Health check

See [server/README.md](./server/README.md) for full API documentation.

## Design System

MindLens uses a cohesive design with:
- **Colors**: Teal/green accents, soft pastels
- **Typography**: Clear hierarchy with display fonts
- **Effects**: Glassmorphism, soft shadows, smooth transitions
- **Components**: Rounded corners, gradient buttons, card-based layouts

## Important Notes

⚠️ **Disclaimer**
MindLens is a student hackathon project and is **NOT a substitute for professional medical advice, diagnosis, or treatment**. If you're experiencing a mental health crisis, please contact a mental health professional or call your local emergency services.

🔐 **Privacy & Security**
- Chat messages are only stored in browser memory during the session
- Questionnaire responses are stored locally using React Context
- No personal data is transmitted except to the Gemini API (via secure backend)
- API keys are NEVER exposed to the frontend

## Troubleshooting

### Chat not working?
- Ensure backend is running on `localhost:5000`
- Check that `GEMINI_API_KEY` is set in `server/.env`
- Look at browser console (F12) for error messages
- Try refreshing the page

### Frontend won't start?
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Try killing port 8080: `lsof -ti:8080 | xargs kill` (Mac/Linux)
- Check that Node.js version is 18+

## Contributing

This is a student hackathon project. Feel free to fork and modify!

## License

MIT - Free to use and modify

## Support

For issues or questions, please open a GitHub issue.

---

**Made with ❤️ for student wellbeing**
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
