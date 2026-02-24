import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, AlertCircle, TrendingUp } from "lucide-react";
import { analyzeSentiment, type SentimentResult } from "@/lib/analysis";
import { useWellbeing } from "@/context/WellbeingContext";

const JournalPage = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const { addEntry } = useWellbeing();

  const handleAnalyze = () => {
    if (!text.trim()) return;
    const r = analyzeSentiment(text);
    setResult(r);
    addEntry({
      journalSentiment: r,
      mood: r.score > 0.2 ? "😊" : r.score < -0.2 ? "😟" : "😐",
    });
  };

  const moodColor = (score: number) => {
    if (score > 0.3) return "text-success";
    if (score > 0) return "text-accent";
    if (score > -0.3) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Daily Journal</h1>
        <p className="mt-2 text-muted-foreground">Write about your day. Our AI will analyze your emotional state.</p>

        <div className="mt-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How are you feeling today? Write about your thoughts, experiences, and emotions..."
            className="w-full rounded-xl border border-input bg-card p-4 text-card-foreground shadow-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[200px] resize-y"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{text.split(/\s+/).filter(Boolean).length} words</span>
            <button
              onClick={handleAnalyze}
              disabled={!text.trim()}
              className="flex items-center gap-2 rounded-lg gradient-accent px-5 py-2.5 font-medium text-accent-foreground shadow-glow transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Sparkles className="h-4 w-4" />
              Analyze
            </button>
          </div>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4"
          >
            {/* Mood Score */}
            <div className="rounded-xl bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-card-foreground">Mood Analysis</h3>
                <span className={`text-2xl font-bold ${moodColor(result.score)}`}>
                  {result.label}
                </span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((result.score + 1) / 2) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full gradient-accent"
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
              </div>
            </div>

            {/* Emotions */}
            {result.emotions.length > 0 && (
              <div className="rounded-xl bg-card p-6 shadow-card">
                <h3 className="font-display font-semibold text-card-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  Detected Emotions
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.emotions.map((e) => (
                    <span key={e} className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground capitalize">
                      {e}
                    </span>
                  ))}
                </div>
                {result.keywords.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">Keywords: {result.keywords.join(", ")}</p>
                  </div>
                )}
              </div>
            )}

            {/* AI Insight */}
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <h4 className="font-display font-semibold text-foreground">AI Insight</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{result.insight}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default JournalPage;
