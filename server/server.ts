import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

type ChatIntent = "greeting" | "gratitude" | "identity" | "crisis" | "question" | "advice" | "reflection";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a supportive AI mental wellness assistant for students. Your role is to provide empathetic, caring support while helping students manage stress, anxiety, and burnout.

Guidelines:
- Be warm, empathetic, and non-judgmental
- Listen actively and validate their feelings
- Offer practical, actionable suggestions
- Encourage positive coping strategies (exercise, sleep, social connection, mindfulness)
- Do NOT provide clinical diagnosis or act as a replacement for mental health professionals
- If someone mentions suicidal thoughts or severe crisis, encourage them to contact professional help immediately
- Keep responses concise (2-3 sentences usually) but warm
- Use a conversational, friendly tone
- Personalize responses when context about their wellbeing is provided`;

interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    questionnaireScore?: number;
    burnoutRisk?: string;
    recentMood?: string;
  };
  chatHistory?: Array<{ role: string; content: string }>;
}

interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface ConversationState {
  turnCount: number;
  lastIntent?: ChatIntent;
  lastAssistantReply?: string;
  recentTopics: string[];
}

const SUPPORTIVE_OPENERS = [
  "That sounds really heavy.",
  "I can see why that would feel difficult.",
  "You’re carrying a lot right now.",
  "Thanks for telling me that.",
  "I’m glad you said that out loud.",
];

const SUPPORTIVE_CLOSINGS = [
  "If you want, I can help you break this into one small step.",
  "If you’d like, tell me what part feels hardest right now.",
  "We can keep this simple and focus on the next helpful move.",
  "If you want, I can stay with you and help you think it through.",
  "If you’d like, I can also help you make a plan for tonight.",
];

const TOPIC_RESPONSES: Array<{ topic: RegExp; lines: string[] }> = [
  {
    topic: /\b(exam|exams|study|studying|assignment|homework|quiz|deadline|project|grade|class|school|college|university)\b/i,
    lines: [
      "For school pressure, it often helps to choose just one task and make it smaller, like a 25-minute focus block.",
      "If the workload feels messy, write down everything on your mind and circle only the one thing that matters most today.",
      "A quick reset can be: water, a 2-minute stretch, and then one tiny step instead of the whole assignment.",
    ],
  },
  {
    topic: /\b(stress|stressed|overwhelm|overwhelmed|pressure|burnout|exhausted|tired)\b/i,
    lines: [
      "When stress spikes, slow breathing can help your body settle before your brain tries to solve the problem.",
      "If burnout is creeping in, protect one non-negotiable break today, even if it is only 10 minutes.",
      "You do not need to fix everything at once; narrowing to one controllable action can make this feel lighter.",
    ],
  },
  {
    topic: /\b(anxious|anxiety|worried|nervous|panic|panicking|fear|scared|uncertain|doubt|overthinking)\b/i,
    lines: [
      "For anxiety, try grounding: notice 3 things you can see, 2 you can hear, and 1 you can touch.",
      "It may help to name the exact worry in one sentence, then ask yourself what is actually under your control.",
      "If your mind is racing, a slower exhale than inhale can help interrupt the spiral a little.",
    ],
  },
  {
    topic: /\b(sad|lonely|loneliness|down|hopeless|miserable|empty|hurt|crying|depressed)\b/i,
    lines: [
      "When things feel low, keeping the next step small is often kinder than trying to force motivation.",
      "A gentle routine can help here: water, light movement, and one message to someone safe.",
      "You deserve support, not pressure. Reaching out to one trusted person can make the day feel less isolated.",
    ],
  },
  {
    topic: /\b(angry|irritated|frustrated|annoyed|mad)\b/i,
    lines: [
      "When frustration builds, it can help to step away for a minute before replying or deciding anything big.",
      "Try loosening your jaw and shoulders on purpose; the body sometimes settles before the thoughts do.",
      "If you want, we can turn the frustration into a practical next step instead of letting it keep building.",
    ],
  },
  {
    topic: /\b(sleep|insomnia|rest|rested|nap|asleep|awake|bedtime)\b/i,
    lines: [
      "Sleep problems usually improve when the routine gets simpler: dim lights, less screen time, and a repeatable bedtime cue.",
      "If your mind is busy at night, try writing down tomorrow's worries so they are not circling in your head.",
      "A short wind-down routine can be more effective than forcing sleep directly.",
    ],
  },
  {
    topic: /\b(friend|friends|family|parents|roommate|relationship|girlfriend|boyfriend|partner|people)\b/i,
    lines: [
      "Relationships can add a lot to your plate, especially when you are already stretched thin.",
      "If this is about someone else, it may help to separate what happened from what you are assuming it means.",
      "You do not have to solve the whole relationship right now; one honest conversation can be enough for today.",
    ],
  },
  {
    topic: /\b(help|what should i do|how do i|can you|advice|plan|strategy)\b/i,
    lines: [
      "Here is a simple starting point: choose the next smallest useful step, not the perfect one.",
      "If you want a plan, we can make one that takes less than five minutes and does not assume you have endless energy.",
      "A good rule is: reduce the problem, reduce the pressure, then move one step forward.",
    ],
  },
];

const buildHash = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

const pickByHash = (items: string[], seed: number) => items[seed % items.length];

const normalizeText = (value: string) => value.toLowerCase().replace(/[^\w\s']/g, " ").replace(/\s+/g, " ").trim();

const conversationMemory = new Map<string, ConversationState>();

const getConversationId = (body: Partial<ChatRequest>) => {
  if (body.conversationId) return body.conversationId;
  return `anon-${buildHash(JSON.stringify(body ?? {})).toString(36)}`;
};

const detectIntent = (normalizedMessage: string): ChatIntent => {
  if (/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(normalizedMessage)) return "greeting";
  if (/\b(thanks|thank you|appreciate it|thanks a lot)\b/i.test(normalizedMessage)) return "gratitude";
  if (/\b(what are you|who are you|are you real|are you human|what can you do)\b/i.test(normalizedMessage)) return "identity";
  if (/\b(suicid|kill myself|hurt myself|self harm|self-harm|end my life|want to die)\b/i.test(normalizedMessage)) return "crisis";
  if (normalizedMessage.includes("?") || /^(what|how|why|when|where|can|could|should|would|is|are|do|does)\b/.test(normalizedMessage)) return "question";
  if (/\b(need help|help me|advice|plan|strategy|what should i do|how do i)\b/i.test(normalizedMessage)) return "advice";
  return "reflection";
};

const detectTopic = (normalizedMessage: string) => {
  const topic = TOPIC_RESPONSES.find((entry) => entry.topic.test(normalizedMessage));
  if (!topic) return null;
  return topic;
};

const getConversationState = (conversationId: string): ConversationState => {
  const existing = conversationMemory.get(conversationId);
  if (existing) return existing;
  const created: ConversationState = { turnCount: 0, recentTopics: [] };
  conversationMemory.set(conversationId, created);
  return created;
};

const updateConversationState = (conversationId: string, updates: Partial<ConversationState>) => {
  const current = getConversationState(conversationId);
  conversationMemory.set(conversationId, {
    ...current,
    ...updates,
    recentTopics: updates.recentTopics ?? current.recentTopics,
  });
};

const recentUserMessages = (chatHistory: ChatRequest["chatHistory"] = []) =>
  chatHistory.filter((entry) => entry.role === "user").map((entry) => entry.content.trim()).filter(Boolean);

const buildLocalChatResponse = (
  message: string,
  context?: ChatRequest["context"],
  chatHistory?: ChatRequest["chatHistory"],
  conversationId?: string
) => {
  const normalizedMessage = normalizeText(message);
  const seed = buildHash(`${normalizedMessage}|${chatHistory?.length ?? 0}|${context?.questionnaireScore ?? 0}|${context?.burnoutRisk ?? ""}|${conversationId ?? ""}`);
  const state = conversationId ? getConversationState(conversationId) : { turnCount: chatHistory?.length ?? 0, recentTopics: [] };
  const intent = detectIntent(normalizedMessage);
  const topic = detectTopic(normalizedMessage);
  const opener = pickByHash(SUPPORTIVE_OPENERS, seed + state.turnCount);
  const closing = pickByHash(SUPPORTIVE_CLOSINGS, seed + 3 + state.turnCount);
  const lines: string[] = [opener];

  if (intent === "crisis") {
    lines.push("If you might act on those thoughts or feel unsafe, call emergency services right now or reach out to a crisis hotline immediately.");
    lines.push("If you can, move to a safer space and contact a trusted person nearby while you get urgent help.");
    return [...lines, closing].join(" ");
  }

  if (intent === "identity") {
    lines.push("I’m a supportive AI wellness assistant for students. I can help you think through stress, school pressure, low mood, burnout, or a specific problem you want to unpack.");
  }

  if (intent === "gratitude") {
    lines.push("You’re welcome. I’m glad this is helping a little, and we can keep going if you want.");
  }

  if (intent === "greeting") {
    lines.push("I’m here with you. Tell me what’s been on your mind, and we’ll work through it together.");
  }

  if (context?.burnoutRisk === "High") {
    lines.push("Your wellbeing signals suggest you may be carrying a heavy load, so a lower-effort plan could help today.");
  } else if (typeof context?.questionnaireScore === "number" && context.questionnaireScore >= 3.5) {
    lines.push("Your questionnaire results suggest you could use some extra support and smaller steps right now.");
  }

  if (topic) {
    const topicLine = pickByHash(topic.lines, seed + 11 + state.turnCount);
    if (!state.recentTopics.includes(topic.lines[0])) {
      lines.push(topicLine);
      state.recentTopics = [...state.recentTopics.slice(-3), topic.lines[0]];
    } else {
      lines.push(topicLine.replace("It may help", "Another angle is"));
    }
  }

  if (intent === "question") {
    if (/^(what|how|why|when|where|can|could|should|would|is|are|do|does)\b/.test(normalizedMessage)) {
      lines.push("Here’s the short version first, and then we can go deeper if you want more detail.");
    }
    lines.push("If you want, I can break this into a clearer next step or help you think it through from a different angle.");
  }

  if (intent === "advice") {
    lines.push("A simple starting point is to choose the next smallest useful step, not the perfect one.");
  }

  if (intent === "reflection" && !topic) {
    if (normalizedMessage.length < 25) {
      lines.push("Say a little more about what happened or what you’re hoping for, and I’ll respond more directly.");
    } else if (normalizedMessage.length > 180) {
      lines.push("I’m hearing a lot here, so I’ll keep the response focused and practical rather than overwhelming you with too much at once.");
    } else {
      lines.push("It may help to name the main feeling in one word, because that can make the next step clearer.");
    }
  }

  const recentUsers = recentUserMessages(chatHistory);
  if (recentUsers.length > 1) {
    const recentFocus = recentUsers.slice(-2).join(" ");
    if (normalizeText(recentFocus) !== normalizedMessage) {
      lines.push("I’m keeping track of what you’ve shared so we can build on it instead of starting over.");
    }
  }

  if (intent !== "question") {
    lines.push(closing);
  }

  return lines.join(" ");
};

// Chat endpoint
app.post("/api/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, context, chatHistory = [] }: ChatRequest = req.body;
    const conversationId = getConversationId(req.body ?? {});
    const state = getConversationState(conversationId);

    if (!message || typeof message !== "string") {
      res.status(400).json({ success: false, error: "Message is required" });
      return;
    }

    // Build context-aware prompt
    let contextString = "";
    if (context) {
      const parts = [];
      if (context.questionnaireScore) {
        parts.push(`Their recent wellbeing score: ${context.questionnaireScore}/5`);
      }
      if (context.burnoutRisk) {
        parts.push(`Burnout risk level: ${context.burnoutRisk}`);
      }
      if (context.recentMood) {
        parts.push(`Recent mood: ${context.recentMood}`);
      }
      if (parts.length > 0) {
        contextString = `\n\nContext about the student:\n${parts.join("\n")}`;
      }
    }

    // Prepare conversation history for multi-turn support
    // Filter to exclude the initial greeting message and ensure it starts with user message
    const conversationHistory = chatHistory
      .filter((msg) => msg.content !== "Hi there! 👋 I'm your MindLens AI Support Assistant. I'm here to listen and help you through any challenges you're facing. How are you feeling today?")
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })) as Array<{ role: "user" | "model"; parts: { text: string }[] }>;

    const useGemini = state.turnCount === 0 || state.turnCount % 3 === 0;
    let responseText: string;

    if (useGemini) {
      try {
        // Start a chat session with conversation history
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const chat = model.startChat({
          history: conversationHistory as any,
        });

        // Send the message
        const result = await chat.sendMessage(`${SYSTEM_PROMPT}${contextString}\n\nUser message: ${message}`);
        responseText = result.response.text();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "";
        const shouldFallback = /429|quota|rate limit|resource exhausted|not found|unsupported/i.test(errorMessage);
        if (!shouldFallback) {
          throw error;
        }

        responseText = buildLocalChatResponse(message, context, chatHistory, conversationId);
        updateConversationState(conversationId, {
          turnCount: state.turnCount + 1,
          lastIntent: detectIntent(normalizeText(message)),
          lastAssistantReply: responseText,
          recentTopics: state.recentTopics,
        });

        res.json({
          success: true,
          message: responseText,
          source: "local",
        });
        return;
      }
    } else {
      responseText = buildLocalChatResponse(message, context, chatHistory, conversationId);
    }

    updateConversationState(conversationId, {
      turnCount: state.turnCount + 1,
      lastIntent: detectIntent(normalizeText(message)),
      lastAssistantReply: responseText,
      recentTopics: state.recentTopics,
    });

    res.json({
      success: true,
      message: responseText,
      source: useGemini ? "gemini" : "local",
    });
  } catch (error) {
    console.error("Chat API error:", error);

    const fallbackMessage = buildLocalChatResponse(
      req.body?.message ?? "",
      req.body?.context,
      req.body?.chatHistory ?? [],
      req.body?.conversationId
    );

    res.json({
      success: true,
      message: fallbackMessage,
      source: "local",
    });
  }
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Chat API available at http://localhost:${PORT}/api/chat`);
});
