import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, Loader, SkipForward } from "lucide-react";
import { Link } from "react-router-dom";
import { useWellbeing } from "@/context/WellbeingContext";
import { supabase } from "@/integrations/supabase/client";
import ChatMessage from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const FRIENDLY_ERROR = "I'm having a moment — please try again shortly 💙";

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi there! 👋 I'm your MindLens AI Support Assistant. I'm here to listen and help you through any challenges you're facing. How are you feeling today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { latestEntry } = useWellbeing();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const latest = latestEntry();
      const contextNote = `User wellbeing context — questionnaireScore: ${latest.questionnaireScore ?? "n/a"}, burnoutRisk: ${latest.burnoutRisk ?? "n/a"}, recentMood: ${latest.mood ?? "n/a"}.`;

      const conversationHistory = nextMessages.map((m, i) => ({
        role: m.role,
        content:
          i === nextMessages.length - 1 && m.role === "user"
            ? `${contextNote}\n\n${m.content}`
            : m.content,
      }));

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: conversationHistory },
      });

      if (error || !data?.reply) throw new Error(error?.message || "no reply");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, timestamp: Date.now() },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: FRIENDLY_ERROR, timestamp: Date.now() },
      ]);
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

        <div className="flex-1 overflow-y-auto mb-6 space-y-4 rounded-xl bg-card/50 p-4 shadow-card">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

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
