import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { scoreQuestionnaire } from "@/lib/analysis";
import { useWellbeing } from "@/context/WellbeingContext";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AISummary {
  risk: "Low" | "Moderate" | "High";
  reasons: string[];
  recommendations: string[];
}

const questions = [
  "I feel nervous or on edge",
  "I can't stop worrying about things",
  "I feel afraid, as if something awful might happen",
  "I feel under constant pressure",
  "I have difficulty relaxing",
  "I become easily irritated",
  "I feel emotionally drained",
  "I have trouble concentrating",
  "I feel physically exhausted even after rest",
];

const options = [
  { label: "Not at all", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Often", value: 3 },
  { label: "Very often", value: 4 },
  { label: "Always", value: 5 },
];

const QuestionnairePage = () => {
  const [answers, setAnswers] = useState<number[]>(Array(9).fill(0));
  const [result, setResult] = useState<ReturnType<typeof scoreQuestionnaire> | null>(null);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const { addEntry } = useWellbeing();

  const setAnswer = (idx: number, val: number) => {
    const updated = [...answers];
    updated[idx] = val;
    setAnswers(updated);
  };

  const allAnswered = answers.every((a) => a > 0);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    const r = scoreQuestionnaire(answers);
    setResult(r);
    addEntry({ questionnaireScore: r.total });
    setLoadingAI(true);
    setAiSummary(null);
    try {
      const qa = questions.map((q, i) => ({ q, a: options.find((o) => o.value === answers[i])?.label }));
      const { data, error } = await supabase.functions.invoke("analyze-burnout", {
        body: { context: { questionnaire: qa, scores: r } },
      });
      if (error || !data || data.error) throw new Error();
      setAiSummary(data as AISummary);
    } catch {
      toast.error("Couldn't generate personalized summary right now 💙");
    } finally {
      setLoadingAI(false);
    }
  };

  const levelColors: Record<string, string> = {
    "Good": "text-success",
    "Moderate": "text-warning",
    "Needs Attention": "text-destructive",
  };
  const riskColors: Record<string, string> = {
    Low: "text-success",
    Moderate: "text-warning",
    High: "text-destructive",
  };

  if (result) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
          <div className="text-center">
            <ClipboardCheck className="mx-auto h-12 w-12 text-accent" />
            <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Results</h1>
            <p className={`mt-2 font-display text-2xl font-bold ${levelColors[result.level]}`}>{result.level}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Anxiety", val: result.anxiety },
              { label: "Stress", val: result.stress },
              { label: "Fatigue", val: result.fatigue },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-card p-4 shadow-card text-center">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-display text-2xl font-bold text-card-foreground">{item.val}/5</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-card p-6 shadow-card">
            <h3 className="font-display font-semibold text-card-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" /> Personalized AI Summary
            </h3>
            {loadingAI && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Generating insights...
              </div>
            )}
            {aiSummary && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Risk Level</p>
                  <p className={`font-display text-2xl font-bold ${riskColors[aiSummary.risk]}`}>{aiSummary.risk}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Why</p>
                  <ul className="space-y-2">
                    {aiSummary.reasons.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Recommendations</p>
                  <ul className="space-y-2">
                    {aiSummary.recommendations.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setResult(null); setAnswers(Array(9).fill(0)); setAiSummary(null); }} className="flex-1 rounded-lg border border-border px-4 py-3 font-medium text-foreground hover:bg-muted transition-all active:scale-95">
              Retake
            </button>
            <Link to="/chat" className="flex flex-1 items-center justify-center rounded-lg gradient-accent px-4 py-3 font-medium text-accent-foreground shadow-glow transition-all hover:scale-[1.02] active:scale-95">
              Continue to AI Chat
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Mental Health Check</h1>
        <p className="mt-2 text-muted-foreground">Answer these questions about how you've felt in the past 2 weeks.</p>

        <div className="mt-8 space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="rounded-xl bg-card p-5 shadow-card">
              <p className="font-medium text-card-foreground text-sm">{i + 1}. {q}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {options.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setAnswer(i, o.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      answers[i] === o.value
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="flex w-full items-center justify-center gap-2 rounded-lg gradient-accent px-4 py-3 font-medium text-accent-foreground shadow-glow disabled:opacity-50"
          >
            Submit Assessment
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuestionnairePage;
