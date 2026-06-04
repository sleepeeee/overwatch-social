"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeStyle = "original-baseline" | "soft-midnight-lounge" | "paper-card-social" | "cyber-matchmaking-hub";

interface ThemeContextType {
  theme: ThemeStyle;
  setTheme: (newTheme: ThemeStyle) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const ALL_THEME_CLASSES = [
  "theme-original-baseline",
  "theme-soft-midnight-lounge",
  "theme-paper-card-social",
  "theme-cyber-matchmaking-hub"
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeStyle>("original-baseline");
  const [isDark, setIsDarkState] = useState<boolean>(false);

  useEffect(() => {
    // 從 localStorage 獲取初始主題
    const savedThemeId = localStorage.getItem("theme-style") || "theme-original-baseline";
    const savedDark = localStorage.getItem("theme-dark") === "true";
    
    const parsedTheme = savedThemeId.replace("theme-", "") as ThemeStyle;
    setThemeState(parsedTheme);
    setIsDarkState(savedDark);

    // 同步到 documentElement class
    const html = document.documentElement;
    html.classList.remove(...ALL_THEME_CLASSES);
    html.classList.add(`theme-${parsedTheme}`);
    if (savedDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, []);

  const setTheme = (newTheme: ThemeStyle) => {
    setThemeState(newTheme);
    localStorage.setItem("theme-style", `theme-${newTheme}`);
    const html = document.documentElement;
    html.classList.remove(...ALL_THEME_CLASSES);
    html.classList.add(`theme-${newTheme}`);
  };

  const setIsDark = (dark: boolean) => {
    setIsDarkState(dark);
    localStorage.setItem("theme-dark", dark ? "true" : "false");
    const html = document.documentElement;
    if (dark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // 預設 fallback 避免在 Server Side 或外部呼叫時崩潰
    return {
      theme: "original-baseline",
      setTheme: () => {},
      isDark: false,
      setIsDark: () => {},
    };
  }
  return ctx;
}
