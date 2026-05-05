# MindLens AI Support Chat Backend

This is the Express backend server for the MindLens AI Support Chat feature. It integrates with Google's Gemini API to provide context-aware mental wellness support.

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Google Generative AI API Key (get one [here](https://makersuite.google.com/app/apikey))

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your Gemini API key:

```bash
cp .env.example .env
```

Edit `.env`:
```
GEMINI_API_KEY=your_actual_api_key_here
PORT=5000
NODE_ENV=development
```

**Getting a Gemini API Key:**
1. Go to [Google Generative AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and paste it into your `.env` file

### 3. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## API Endpoints

### POST `/api/chat`

Send a chat message and get an AI-generated response.

**Request:**
```json
{
  "message": "I'm feeling stressed about exams",
  "context": {
    "questionnaireScore": 3.5,
    "burnoutRisk": "Medium",
    "recentMood": "😟"
  },
  "chatHistory": [
    {
      "role": "user",
      "content": "How are you doing?"
    },
    {
      "role": "assistant",
      "content": "I'm here to help..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "That sounds tough. Exams can definitely be stressful..."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description"
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-04T18:00:00.000Z"
}
```

## Features

- **Context-Aware Responses**: Uses questionnaire results and mood data to provide personalized support
- **Multi-turn Conversations**: Maintains conversation history for coherent discussions
- **Empathetic AI**: Uses a carefully crafted system prompt to ensure supportive, non-clinical advice
- **CORS Enabled**: Allows requests from the frontend
- **Error Handling**: Graceful error responses with detailed messages

## Architecture

```
server/
├── server.ts          # Main Express app
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
└── .env.example       # Environment variables template
```

## Security Notes

- ⚠️ **Never** commit `.env` file to version control
- Always use environment variables for API keys
- The API key is only used server-side, never exposed to the frontend
- CORS is enabled for localhost:3000 (frontend) in development

## Troubleshooting

### "GEMINI_API_KEY is not defined"
- Make sure you created a `.env` file in the `server/` directory
- Copy the exact API key from Google Generative AI Studio
- Restart the server after updating `.env`

### "Failed to fetch" from frontend
- Ensure the server is running on `localhost:5000`
- Check that CORS is enabled (it should be by default)
- Check browser console for specific error messages

### API rate limits
- Google Generative AI has usage limits
- Implement rate limiting in production if needed

## Development

Run with hot-reload:
```bash
npm run dev
```

Build:
```bash
npm run build
```

Run compiled version:
```bash
npm start
```

## License

MIT
