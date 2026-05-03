import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Camera, ClipboardList, LayoutDashboard, Shield, AlertTriangle } from "lucide-react";
import heroBrain from "@/assets/hero-brain.jpg";

const features = [
  {
    icon: BookOpen,
    title: "Journal Analysis",
    desc: "AI-powered sentiment analysis detects stress, anxiety, and emotional patterns in your writing.",
    path: "/journal",
    color: "bg-accent text-accent-foreground",
  },
  {
    icon: Camera,
    title: "Mood Camera",
    desc: "Real-time facial emotion detection to understand your current emotional state.",
    path: "/camera",
    color: "bg-info text-info-foreground",
  },
  {
    icon: ClipboardList,
    title: "Burnout Check",
    desc: "Predict burnout risk based on sleep, study habits, screen time, and stress levels.",
    path: "/burnout",
    color: "bg-warning text-warning-foreground",
  },
  {
    icon: LayoutDashboard,
    title: "Insights Dashboard",
    desc: "View mood trends, combined wellbeing scores, and personalized AI suggestions.",
    path: "/dashboard",
    color: "bg-primary text-primary-foreground",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const HomePage = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0">
          <img src={heroBrain} alt="" className="h-full w-full object-cover opacity-30 mix-blend-lighten" />
        </div>
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="hero-badge mb-4 inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent">
              <Shield className="h-4 w-4" />
              Private & Secure
            </div>
            <h1 className="hero-title font-display text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
              MindLens
            </h1>
            <p className="hero-subtitle mt-3 font-display text-lg text-primary-foreground/80 md:text-xl">
              AI Student Wellbeing Analyzer
            </p>
            <p className="hero-desc mx-auto mt-6 max-w-lg text-primary-foreground/60">
              Early, private warnings using AI-powered journaling, facial emotion detection, and lifestyle analysis — before it's too late.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/journal"
                className="hero-primary-btn rounded-lg gradient-accent px-6 py-3 font-medium text-accent-foreground shadow-glow transition-transform hover:scale-105"
              >
                Start Journaling
              </Link>
              <Link
                to="/dashboard"
                className="hero-ghost-btn rounded-lg border border-primary-foreground/20 px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                View Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={item}>
              <Link
                to={f.path}
                className="group block rounded-xl bg-card p-6 shadow-card transition-all hover:shadow-elevated"
              >
                <div className={`mb-4 inline-flex rounded-lg p-3 ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-card-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Disclaimer */}
      <section className="container mx-auto px-4 pb-16">
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
            <div>
              <h4 className="font-display font-semibold text-foreground">Disclaimer</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                MindLens is a student hackathon project and is <strong>not a substitute for professional medical advice</strong>, diagnosis, or treatment. If you're experiencing a mental health crisis, please contact a mental health professional or call your local emergency services. All data stays in your browser — we don't store or transmit your information.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
