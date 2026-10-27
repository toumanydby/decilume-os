"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-lg bg-muted/40 animate-pulse" />;
  }

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
      title={`Current: ${theme}. Click to switch.`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="w-4 h-4 text-indigo-400" />
      ) : theme === "light" ? (
        <Sun className="w-4 h-4 text-amber-500" />
      ) : (
        <Monitor className="w-4 h-4 text-zinc-400" />
      )}
    </button>
  );
}

