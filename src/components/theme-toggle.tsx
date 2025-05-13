// src/components/theme-toggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  // Initialize theme as undefined to represent "not yet determined"
  const [theme, setThemeState] = React.useState<"theme-light" | "dark" | "system" | undefined>(undefined);
  const [mounted, setMounted] = React.useState(false);

  // Effect to run on client mount to determine initial theme
  React.useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme") as "theme-light" | "dark" | "system" | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    } else {
      // If no theme in localStorage, default to "system"
      setThemeState("system");
    }
  }, []);

  // Effect to apply theme class to HTML element and update localStorage
  React.useEffect(() => {
    if (theme === undefined || typeof window === "undefined") {
      return; // Don't do anything until theme is determined or if not in browser
    }

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveThemeClass: "light" | "dark";
    if (theme === "system") {
      effectiveThemeClass = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      effectiveThemeClass = theme === "dark" ? "dark" : "light";
    }
    
    root.classList.add(effectiveThemeClass);

    // Store the explicit choice ("dark", "theme-light") or "system" preference in localStorage.
    localStorage.setItem("theme", theme);

  }, [theme]);

  const toggleTheme = () => {
    let currentActualTheme: "theme-light" | "dark";
    if (theme === "system") {
        currentActualTheme = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "theme-light";
    } else {
        currentActualTheme = theme === "dark" ? "dark" : "theme-light";
    }

    const newTheme = currentActualTheme === "dark" ? "theme-light" : "dark";
    setThemeState(newTheme);
    // localStorage will be updated by the useEffect above when `theme` state changes.
  };

  if (!mounted || theme === undefined) {
    // Render a placeholder button until mounted and theme is determined.
    // This ensures server and client initial render for this button match.
    return (
      <Button variant="outline" size="icon" disabled aria-label="Toggle theme">
        {/* Use a consistent placeholder icon, e.g., Sun with generic classes */}
        <Sun className="h-[1.2rem] w-[1.2rem]" /> 
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }
  
  // Determine which icon to show based on the current effective theme
  let isCurrentlyDark: boolean;
  if (theme === "system") {
    isCurrentlyDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  } else {
    isCurrentlyDark = theme === "dark";
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {isCurrentlyDark ? (
        // If current theme is dark, show Sun icon (to switch to light)
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-100" />
      ) : (
        // If current theme is light, show Moon icon (to switch to dark)
        <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-100 transition-all dark:rotate-0 dark:scale-0" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
