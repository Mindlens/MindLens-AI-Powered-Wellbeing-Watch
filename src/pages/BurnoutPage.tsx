import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Brain, Moon, BookOpen, Monitor, Users, Zap, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { calculateBurnoutRisk } from "@/lib/analysis";
import { useWellbeing } from "@/context/WellbeingContext";
import { supabase } from "@/integrations/supabase/client";

interface AISummary {
  risk: "Low" | "Moderate" | "High";
  reasons: string[];
  recommendations: string[];
}

const BurnoutPage = () => {
  const [sleepHours, setSleepHours] = useState(7);
  const [studyHours, setStudyHours] = useState(5);
  const [screenTime, setScreenTime] = useState(4);
  const [socialInteraction, setSocialInteraction] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [result, setResult] = useState<ReturnType<typeof calculateBurnoutRisk> | null>(null);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const { addEntry } = useWellbeing();

  const handlePredict = async () => {
    const r = calculateBurnoutRisk({ sleepHours, studyHours, screenTime, socialInteraction, stressLevel });
    setResult(r);
    addEntry({ burnoutRisk: r.risk, burnoutScore: r.score });
    setAiSummary(null);
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-burnout", {
        body: { context: { sleepHours, studyHours, screenTime, socialInteraction, stressLevel, computedScore: r.score, computedRisk: r.risk } },
      });
      if (error || !data || data.error) throw new Error();
      setAiSummary(data as AISummary);
    } catch {
      toast.error("Couldn't generate personalized summary right now 💙");
    } finally {
      setLoadingAI(false);
    }
  };


  const riskColors = { Low: "text-success", Medium: "text-warning", High: "text-destructive" };
  const riskBg = { Low: "bg-success/10", Medium: "bg-warning/10", High: "bg-destructive/10" };

  const sliders = [
    { label: "Sleep Hours", value: sleepHours, set: setSleepHours, min: 0, max: 12, icon: Moon, unit: "hrs" },
    { label: "Study Hours", value: studyHours, set: setStudyHours, min: 0, max: 16, icon: BookOpen, unit: "hrs" },
    { label: "Screen Time", value: screenTime, set: setScreenTime, min: 0, max: 16, icon: Monitor, unit: "hrs" },
    { label: "Social Interaction", value: socialInteraction, set: setSocialInteraction, min: 0, max: 10, icon: Users, unit: "/10" },
    { label: "Stress Level", value: stressLevel, set: setStressLevel, min: 0, max: 10, icon: Zap, unit: "/10" },
  ];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Burnout Risk Predictor</h1>
        <p className="mt-2 text-muted-foreground">Assess your burnout risk based on lifestyle factors.</p>

        <div className="mt-8 space-y-6">
          {sliders.map((s) => (
            <div key={s.label} className="rounded-xl bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <s.icon className="h-4 w-4 text-accent" />
                  <span className="font-medium text-card-foreground">{s.label}</span>
                </div>
                <span className="font-display font-bold text-foreground">{s.value}{s.unit}</span>
              </div>
              <Slider
                value={[s.value]}
                onValueChange={([v]) => s.set(v)}
                min={s.min}
                max={s.max}
                step={1}
                className="w-full"
              />
            </div>
          ))}

          <button
            onClick={handlePredict}
            className="flex w-full items-center justify-center gap-2 rounded-lg gradient-accent px-4 py-3 font-medium text-accent-foreground shadow-glow transition-transform hover:scale-[1.02]"
          >
            <Brain className="h-4 w-4" />
            Predict Burnout Risk
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
            <div className={`rounded-xl p-6 ${riskBg[result.risk]}`}>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Burnout Risk Level</p>
                <p className={`font-display text-4xl font-bold ${riskColors[result.risk]}`}>{result.risk}</p>
                <p className="mt-1 text-sm text-muted-foreground">Score: {result.score}/100</p>
              </div>
            </div>
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h3 className="font-display font-semibold text-card-foreground">Suggestions</h3>
              <ul className="mt-3 space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    {s}
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

export default BurnoutPage;
