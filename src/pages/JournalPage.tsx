import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle, TrendingUp, Mic, MicOff, Loader2, Activity, ListChecks, Heart } from "lucide-react";
import { toast } from "sonner";
import { analyzeSentiment } from "@/lib/analysis";
import { useWellbeing } from "@/context/WellbeingContext";
import { supabase } from "@/integrations/supabase/client";

type Lang = "EN" | "HI";

const langToCode: Record<Lang, string> = {
  EN: "en-IN",
  HI: "hi-IN",
};

interface AIAnalysis {
  tone: "Positive" | "Neutral" | "Negative";
  emotions: string[];
  stressLevel: number;
  concerns: string[];
  suggestions: string[];
}

const JournalPage = () => {
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [result, setResult] = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState<Lang>("EN");
  const [supported, setSupported] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addEntry } = useWellbeing();

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setSupported(false);
    return () => {
      try { recognitionRef.current?.stop(); } catch {}
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
    };
  }, []);

  // Debounced word counter
  useEffect(() => {
    if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
    wordTimerRef.current = setTimeout(() => {
      setWordCount((text + " " + interim).split(/\s+/).filter(Boolean).length);
    }, 250);
  }, [text, interim]);

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      try { recognitionRef.current?.stop(); } catch {}
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
      try { recognitionRef.current?.stop(); } catch {}
      setListening(false);
    } else {
      startListening();
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim() || analyzing) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-journal", {
        body: { text },
      });
      if (error || !data || data.error) throw new Error(data?.error || "failed");
      const analysis = data as AIAnalysis;
      setResult(analysis);
      const local = analyzeSentiment(text);
      addEntry({
        journalSentiment: { ...local, emotions: analysis.emotions, label: analysis.tone, score: analysis.tone === "Positive" ? 0.5 : analysis.tone === "Negative" ? -0.5 : 0 },
        mood: analysis.tone === "Positive" ? "😊" : analysis.tone === "Negative" ? "😟" : "😐",
      });
    } catch {
      toast.error("Couldn't analyze right now — please try again shortly 💙");
    } finally {
      setAnalyzing(false);
    }
  };

  const toneColor = (t: string) =>
    t === "Positive" ? "text-success" : t === "Negative" ? "text-destructive" : "text-accent";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Daily Journal</h1>
        <p className="mt-2 text-muted-foreground">Write about your day. Our AI will analyze your emotional state.</p>

        <div className="mt-8">
          <div className="relative">
            <textarea
              value={interim ? `${text}${interim}` : text}
              onChange={(e) => { if (!listening) setText(e.target.value); }}
              placeholder="How are you feeling today? Write about your thoughts, experiences, and emotions..."
              className="w-full rounded-xl border border-input bg-card p-4 pr-16 text-card-foreground shadow-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[200px] resize-y transition-shadow"
            />
            {supported && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  onClick={toggleListening}
                  title={listening ? "Stop listening" : "Start voice input"}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 ${
                    listening
                      ? "bg-destructive text-destructive-foreground shadow-lg"
                      : "gradient-accent text-accent-foreground hover:scale-105"
                  }`}
                >
                  {listening && <span className="absolute inset-0 rounded-full bg-destructive opacity-75 animate-ping" />}
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
                  {(["EN", "HI"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      disabled={listening}
                      className={`rounded-full px-2.5 py-1 font-medium transition-colors active:scale-95 ${
                        lang === l ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                      } disabled:opacity-50`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
              {!supported && (
                <span className="text-xs text-muted-foreground">Voice input not supported. Try Chrome.</span>
              )}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={wordCount < 10 || analyzing}
              title={wordCount < 10 ? "Write at least 10 words to analyze" : "Analyze your entry"}
              className="flex items-center gap-2 rounded-lg gradient-accent px-5 py-2.5 font-medium text-accent-foreground shadow-glow transition-all hover:scale-105 active:scale-95 disabled:bg-muted disabled:bg-none disabled:text-muted-foreground disabled:opacity-60 disabled:shadow-none disabled:hover:scale-100"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {analyzing ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-8 space-y-4">
            <div className="rounded-xl bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <Heart className="h-5 w-5 text-accent" /> Emotional Tone
                </h3>
                <span className={`text-2xl font-bold ${toneColor(result.tone)}`}>{result.tone}</span>
              </div>
            </div>

            <div className="rounded-xl bg-card p-6 shadow-card">
              <h3 className="font-display font-semibold text-card-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" /> Detected Emotions
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.emotions.map((e) => (
                  <span key={e} className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground capitalize">{e}</span>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-card-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" /> Stress Level
                </h3>
                <span className="font-display text-2xl font-bold text-foreground">{result.stressLevel}/10</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(result.stressLevel / 10) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full gradient-accent"
                />
              </div>
            </div>

            {result.concerns.length > 0 && (
              <div className="rounded-xl bg-card p-6 shadow-card">
                <h3 className="font-display font-semibold text-card-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" /> Key Concerns
                </h3>
                <ul className="mt-3 space-y-2">
                  {result.concerns.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-accent" /> Wellness Suggestions
              </h3>
              <ul className="mt-3 space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default JournalPage;
