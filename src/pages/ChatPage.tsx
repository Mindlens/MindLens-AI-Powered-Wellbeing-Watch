import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, Loader, AlertCircle, SkipForward } from "lucide-react";
import { Link } from "react-router-dom";
import { useWellbeing } from "@/context/WellbeingContext";
import ChatMessage from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const ChatPage = () => {
  const [conversationId] = useState(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi there! 👋 I'm your MindLens AI Support Assistant. I'm here to listen and help you through any challenges you're facing. How are you feeling today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { latestEntry } = useWellbeing();

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      // Prepare context from questionnaire/wellbeing data
      const latest = latestEntry();
      const context = {
        questionnaireScore: latest.questionnaireScore,
        burnoutRisk: latest.burnoutRisk,
        recentMood: latest.mood,
      };

      // Call backend API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversationId,
          context,
          chatHistory: messages.map((msg) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          response.status === 503
            ? "Backend server is not running. Please start the server with: cd server && npm run dev"
            : `API error: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get response from AI");
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: data.message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Chat error:", err);
      
      let errorMsg = "Something went wrong. Please try again.";
      if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMsg =
          "Backend server is not running. Start it with: cd server && npm run dev";
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      setError(errorMsg);

      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `I encountered an issue: ${errorMsg}. Please make sure the backend server is running.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 h-screen flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-6 w-6 text-accent" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              AI Support Chat
            </h1>
          </div>
          <p className="text-muted-foreground">
            Talk to your supportive AI wellness assistant
          </p>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4 rounded-xl bg-card/50 p-4 shadow-card">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </motion.div>
        )}

        {/* Input area */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share how you're feeling..."
                disabled={isLoading}
                rows={2}
                className="w-full rounded-xl border border-input bg-card p-3 text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 resize-none"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center rounded-xl gradient-accent h-12 w-12 text-accent-foreground shadow-glow transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3 justify-between">
            <Link
              to="/questionnaire"
              className="flex-1 text-center rounded-lg border border-border px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors text-sm"
            >
              Back to Questionnaire
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 text-center rounded-lg gradient-accent px-4 py-2 font-medium text-accent-foreground shadow-glow transition-transform hover:scale-105 text-sm"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors text-sm"
              title="Skip chat and go directly to dashboard"
            >
              <SkipForward className="h-4 w-4" />
              <span className="hidden sm:inline">Skip</span>
            </Link>
          </div>
        </div>

        {/* Info footer */}
        <div className="mt-4 rounded-lg border border-accent/20 bg-accent/5 p-3 text-xs text-muted-foreground">
          <p>
            <strong>Privacy:</strong> This is a supportive tool and{" "}
            <strong>not a replacement for professional mental health care</strong>. If you're in crisis,
            please reach out to a mental health professional or crisis hotline.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatPage;
