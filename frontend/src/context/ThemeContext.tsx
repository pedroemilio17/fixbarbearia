import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ThemeType } from "../types";

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start with something deterministic; we'll sync from storage/system on mount.
  const [theme, setTheme] = useState<ThemeType>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1) explicit user choice in localStorage wins
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else {
      setTheme(prefersDark ? "dark" : "light");
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const htmlElement = document.documentElement;
    if (theme === "dark") htmlElement.classList.add("dark");
    else htmlElement.classList.remove("dark");

    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
