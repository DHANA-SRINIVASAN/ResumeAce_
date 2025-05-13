// src/components/theme-toggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setThemeState] = React.useState<"theme-light" | "dark" | "system">(
    () => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("theme") as "theme-light" | "dark" | "system") || "system";
        }
        return "system";
    }
  );

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setThemeState(isDarkMode ? "dark" : "theme-light");
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "theme-light";
            root.classList.add(systemTheme === "dark" ? "dark" : "light"); // Use "light" for light theme class
            return;
        }
        root.classList.add(theme === "dark" ? "dark" : "light"); // Use "light" for light theme class
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "theme-light" : "dark";
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
        localStorage.setItem("theme", newTheme);
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-100" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-100 transition-all dark:rotate-0 dark:scale-0" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
