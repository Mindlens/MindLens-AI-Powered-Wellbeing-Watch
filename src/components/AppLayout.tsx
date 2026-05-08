import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brain, BookOpen, Camera, ClipboardList, LayoutDashboard, FileQuestion, MessageCircle, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { path: "/", label: "Home", icon: Brain },
  { path: "/journal", label: "Journal", icon: BookOpen },
  { path: "/camera", label: "Mood Camera", icon: Camera },
  { path: "/burnout", label: "Burnout Check", icon: ClipboardList },
  { path: "/questionnaire", label: "Questionnaire", icon: FileQuestion },
  { path: "/chat", label: "AI Chat", icon: MessageCircle },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const initialsOf = (name?: string | null, email?: string | null) => {
  const src = (name || email || "U").trim();
  const parts = src.split(/\s+/);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
};

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const name = (user?.user_metadata?.full_name as string) || user?.email;
  const initials = initialsOf(user?.user_metadata?.full_name as string, user?.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full gradient-accent text-sm font-semibold text-accent-foreground shadow-glow">
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          <UserIcon className="mr-2 h-4 w-4" /> My Account
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            navigate("/", { replace: true });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { session } = useAuth();

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
            {session ? (
              <UserMenu />
            ) : (
              <Link
                to="/auth"
                className="ml-2 rounded-lg gradient-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-glow transition-transform hover:scale-105"
              >
                Login
              </Link>
            )}
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
            {session ? (
              <UserMenu />
            ) : (
              <Link to="/auth" className="rounded-lg gradient-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
                Login
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default AppLayout;
