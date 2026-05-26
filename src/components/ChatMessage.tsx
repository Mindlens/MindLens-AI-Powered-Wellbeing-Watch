import { memo } from "react";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = memo(({ message, animate = true }: ChatMessageProps & { animate?: boolean }) => {
  const isUser = message.role === "user";
  const className = `flex ${isUser ? "justify-end" : "justify-start"}`;
  const bubbleClass = `max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
    isUser
      ? "rounded-br-none bg-accent text-accent-foreground shadow-glow"
      : "rounded-bl-none bg-muted text-muted-foreground border border-border"
  }`;

  if (!animate) {
    return (
      <div className={className}>
        <div className={bubbleClass}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={className}
    >
      <div className={bubbleClass}>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </motion.div>
  );
});
ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
