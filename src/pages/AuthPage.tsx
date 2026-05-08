import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type Tab = "signin" | "signup";

const passwordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.07-1.1-.16-1.6H12z"/>
  </svg>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [tab, setTab] = useState<Tab>("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  // signup
  const [fullName, setFullName] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    if (session) navigate("/dashboard", { replace: true });
  }, [session, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPw) {
      setError("Passwords do not match");
      return;
    }
    if (!agree) {
      setError("Please agree to the Privacy Policy and Terms");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }
    toast.success("Welcome to MindLens! Please check your email to verify your account.");
    setTab("signin");
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate("/dashboard", { replace: true });
  };

  const handleForgot = async () => {
    if (!email) {
      setError("Enter your email above first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent");
  };

  const strength = passwordStrength(password);
  const strengthLabel = ["", "Weak", "Weak", "Medium", "Strong"][strength];
  const strengthColor = ["bg-muted", "bg-destructive", "bg-destructive", "bg-warning", "bg-success"][strength];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] gradient-hero overflow-hidden">
      <div className="container relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-2xl border border-accent/20 bg-card/90 p-8 shadow-elevated backdrop-blur-xl"
          style={{ boxShadow: "0 0 0 1px rgba(45,212,191,0.15), 0 20px 60px rgba(0,0,0,0.4)" }}
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl gradient-accent shadow-glow">
              <Brain className="h-6 w-6 text-accent-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-card-foreground">MindLens</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your private AI wellbeing companion</p>
          </div>

          {/* Tabs */}
          <div className="relative mb-6 grid grid-cols-2 rounded-lg bg-muted p-1">
            {(["signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(null); }}
                className={`relative z-10 rounded-md py-2 text-sm font-medium transition-colors ${
                  tab === t ? "text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === t && (
                  <motion.div
                    layoutId="auth-tab-active"
                    className="absolute inset-0 -z-10 rounded-md gradient-accent"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "signin" ? (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSignIn}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={loading} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button type="button" onClick={handleForgot} className="text-xs text-accent hover:underline">Forgot Password?</button>
                  </div>
                  <div className="relative">
                    <Input id="password" type={showPw ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg gradient-accent px-4 py-2.5 font-medium text-accent-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign In
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSignUp}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email2">Email</Label>
                  <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password2">Password</Label>
                  <div className="relative">
                    <Input id="password2" type={showPw ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-1">
                      <div className="flex h-1.5 gap-1">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className={`h-full flex-1 rounded ${i <= strength ? strengthColor : "bg-muted"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Strength: {strengthLabel || "—"}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type={showPw ? "text" : "password"} required value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} disabled={loading} />
                </div>
                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
                  <span>I agree to the <a className="text-accent hover:underline">Privacy Policy</a> and <a className="text-accent hover:underline">Terms</a></span>
                </label>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg gradient-accent px-4 py-2.5 font-medium text-accent-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign Up
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or continue with <div className="h-px flex-1 bg-border" />
          </div>

          <button type="button" onClick={handleGoogle} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted disabled:opacity-60">
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {tab === "signin" ? (
              <>Don't have an account? <button onClick={() => setTab("signup")} className="text-accent hover:underline">Sign Up</button></>
            ) : (
              <>Already have an account? <button onClick={() => setTab("signin")} className="text-accent hover:underline">Sign In</button></>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
