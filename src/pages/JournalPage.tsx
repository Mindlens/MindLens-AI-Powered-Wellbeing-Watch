import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle, TrendingUp, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { analyzeSentiment, type SentimentResult } from "@/lib/analysis";
import { useWellbeing } from "@/context/WellbeingContext";

type Lang = "EN" | "HI" | "HI-EN";

const langToCode: Record<Lang, string> = {
  EN: "en-IN",
  HI: "hi-IN",
  "HI-EN": "hi-IN",
};

const JournalPage = () => {
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState<Lang>("HI-EN");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addEntry } = useWellbeing();

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setSupported(false);
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      try {
        recognitionRef.current?.stop();
      } catch {}
      toast("No speech detected. Tap the mic to try again.");
    }, 10000);
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = langToCode[lang];
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += transcript;
        else interimChunk += transcript;
      }
      if (finalChunk) {
        setText((prev) => (prev ? prev.replace(/\s+$/, "") + " " : "") + finalChunk.trim() + " ");
      }
      setInterim(interimChunk);
      resetSilenceTimer();
    };

    recognition.onerror = (e: any) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        toast.error("Microphone access denied. Please allow it in your browser settings.");
      } else if (e.error === "no-speech") {
        // handled by silence timer
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      resetSilenceTimer();
    } catch {
      setListening(false);
    }
  };

  const toggleListening = () => {
    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setListening(false);
    } else {
      startListening();
    }
  };

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

  const wordCount = (text + " " + interim).split(/\s+/).filter(Boolean).length;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Daily Journal</h1>
        <p className="mt-2 text-muted-foreground">Write about your day. Our AI will analyze your emotional state.</p>

        <div className="mt-8">
          <div className="relative">
            <textarea
              value={interim ? `${text}${interim}` : text}
              onChange={(e) => {
                if (!listening) setText(e.target.value);
              }}
              placeholder="How are you feeling today? Write about your thoughts, experiences, and emotions..."
              className="w-full rounded-xl border border-input bg-card p-4 pr-16 text-card-foreground shadow-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[200px] resize-y"
            />
            {supported && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  onClick={toggleListening}
                  title={listening ? "Stop listening" : "Start voice input"}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                    listening
                      ? "bg-destructive text-destructive-foreground shadow-lg"
                      : "gradient-accent text-accent-foreground hover:scale-105"
                  }`}
                >
                  {listening && (
                    <span className="absolute inset-0 rounded-full bg-destructive opacity-75 animate-ping" />
                  )}
                  {listening ? <MicOff className="relative h-5 w-5" /> : <Mic className="relative h-5 w-5" />}
                </button>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{wordCount} words</span>
              {listening && (
                <span className="flex items-center gap-1.5 text-sm text-destructive">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  Listening...
                </span>
              )}
              {supported && (
                <div className="flex items-center rounded-full border border-input bg-card p-0.5 text-xs">
                  {(["EN", "HI", "HI-EN"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      disabled={listening}
                      className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
                        lang === l
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      } disabled:opacity-50`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
              {!supported && (
                <span className="text-xs text-muted-foreground" title="Voice input not supported in this browser. Try Chrome.">
                  Voice input not supported in this browser. Try Chrome.
                </span>
              )}
            </div>
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
            <div className="rounded-xl bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-card-foreground">Mood Analysis</h3>
                <span className={`text-2xl font-bold ${moodColor(result.score)}`}>{result.label}</span>
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
