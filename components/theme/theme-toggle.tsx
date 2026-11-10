"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark =
      localStorage.getItem("onboardx_theme") === "dark" ||
      (!("onboardx_theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("onboardx_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("onboardx_theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-cardDark" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle visual theme between Light and Dark mode"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
      className="p-2 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-cardDark text-graphite dark:text-ivory hover:bg-mist dark:hover:bg-graphite-dark transition-colors cursor-pointer"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-pine hover:text-pine-600 transition-transform duration-200" />
      ) : (
        <Sun className="w-4 h-4 text-amberSignal hover:text-amberSignal-hover transition-transform duration-200" />
      )}
    </button>
  );
}
