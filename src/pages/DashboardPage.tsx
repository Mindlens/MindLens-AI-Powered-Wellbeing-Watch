import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Brain, TrendingDown, TrendingUp, Activity, Lightbulb } from "lucide-react";
import { useWellbeing } from "@/context/WellbeingContext";

const DashboardPage = () => {
  const { entries, latestEntry } = useWellbeing();
  const latest = latestEntry();

  const trendData = entries.map((e) => ({
    date: e.date.slice(5),
    burnout: e.burnoutScore ?? 0,
    wellbeing: e.questionnaireScore ? Math.round((1 - e.questionnaireScore / 5) * 100) : 50,
  }));

  const moodData = entries.map((e) => ({
    date: e.date.slice(5),
    mood: e.mood === "😊" ? 3 : e.mood === "😐" ? 2 : e.mood === "😟" ? 1 : 2,
  }));

  const stats = [
    {
      label: "Today's Mood",
      value: latest.mood || "—",
      icon: Activity,
      sub: latest.cameraEmotion || "No camera data",
    },
    {
      label: "Burnout Risk",
      value: latest.burnoutRisk || "—",
      icon: latest.burnoutRisk === "High" ? TrendingDown : TrendingUp,
      sub: latest.burnoutScore != null ? `Score: ${latest.burnoutScore}/100` : "Not assessed",
    },
    {
      label: "Journal Mood",
      value: latest.journalSentiment?.label || "—",
      icon: Brain,
      sub: latest.journalSentiment?.emotions.join(", ") || "No journal today",
    },
    {
      label: "Wellbeing Score",
      value: latest.questionnaireScore != null ? `${latest.questionnaireScore}/5` : "—",
      icon: Lightbulb,
      sub: "From questionnaire",
    },
  ];

  const suggestions = [
    latest.burnoutRisk === "High" && "🛑 Your burnout risk is high. Consider reducing study hours and getting more sleep.",
    latest.journalSentiment?.emotions.includes("stress") && "📝 Journal analysis detected stress. Try a 5-minute breathing exercise.",
    latest.journalSentiment?.emotions.includes("anxiety") && "🧘 Anxiety detected in your writing. Grounding techniques can help.",
    latest.cameraEmotion?.includes("Tired") && "😴 You look tired. A short power nap (20 min) can boost your energy.",
    latest.cameraEmotion?.includes("Stressed") && "😰 Facial analysis suggests stress. Step away from screens for a while.",
    "💡 Regular physical exercise can significantly improve your mental wellbeing.",
    "🌿 Try spending 15 minutes outdoors today for a natural mood boost.",
  ].filter(Boolean) as string[];

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Insights Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Your combined wellbeing analysis at a glance.</p>

        {/* Stat cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-card p-5 shadow-card">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <s.icon className="h-4 w-4 text-accent" />
                {s.label}
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-card-foreground">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-card p-6 shadow-card">
            <h3 className="font-display font-semibold text-card-foreground mb-4">Weekly Mood Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
                <YAxis domain={[0, 4]} ticks={[1, 2, 3]} tickFormatter={(v) => v === 3 ? "😊" : v === 2 ? "😐" : "😟"} stroke="hsl(220,10%,46%)" />
                <Tooltip formatter={(v: number) => v === 3 ? "Happy" : v === 2 ? "Neutral" : "Sad"} />
                <Bar dataKey="mood" fill="hsl(170,55%,42%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl bg-card p-6 shadow-card">
            <h3 className="font-display font-semibold text-card-foreground mb-4">Burnout & Wellbeing Trends</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
                <YAxis stroke="hsl(220,10%,46%)" />
                <Tooltip />
                <Line type="monotone" dataKey="burnout" stroke="hsl(0,72%,51%)" strokeWidth={2} name="Burnout Score" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="wellbeing" stroke="hsl(170,55%,42%)" strokeWidth={2} name="Wellbeing %" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="mt-8 rounded-xl bg-card p-6 shadow-card">
          <h3 className="font-display font-semibold text-card-foreground flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            AI Suggestions
          </h3>
          <ul className="mt-4 space-y-3">
            {suggestions.slice(0, 5).map((s, i) => (
              <li key={i} className="rounded-lg bg-muted p-3 text-sm text-foreground">{s}</li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
