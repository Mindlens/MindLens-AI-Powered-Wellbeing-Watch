import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="relative ml-1 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-all duration-300 hover:border-accent/50 hover:shadow-glow"
    >
      <Sun
        className={`absolute h-4 w-4 transition-all duration-500 ${
          isDark ? "rotate-[360deg] scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-500 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-[360deg] scale-0 opacity-0"
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
