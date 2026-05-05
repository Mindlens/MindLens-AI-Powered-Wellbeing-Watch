import { Link, useLocation } from "react-router-dom";
import { Brain, BookOpen, Camera, ClipboardList, LayoutDashboard, FileQuestion, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { path: "/", label: "Home", icon: Brain },
  { path: "/journal", label: "Journal", icon: BookOpen },
  { path: "/camera", label: "Mood Camera", icon: Camera },
  { path: "/burnout", label: "Burnout Check", icon: ClipboardList },
  { path: "/questionnaire", label: "Questionnaire", icon: FileQuestion },
  { path: "/chat", label: "AI Chat", icon: MessageCircle },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border glass">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent">
              <Brain className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">MindLens</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-center rounded-lg p-2 transition-colors",
                  location.pathname === item.path
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default AppLayout;
