"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeStyle =
  | "original-baseline"
  | "soft-midnight-lounge"
  | "paper-card-social"
  | "cyber-matchmaking-hub"
  | "starry-midnight";

interface ThemeContextType {
  theme: ThemeStyle;
  setTheme: (newTheme: ThemeStyle) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// 主題白名單：setTheme 僅接受此清單內的值（add-standalone-theme-style）
// 新主題上線流程：globals.css 加 theme class → 此清單加名稱 → layout 掛回 ThemeSwitcher
const THEME_WHITELIST: ThemeStyle[] = [
  "original-baseline",
  "soft-midnight-lounge",
  "paper-card-social",
  "cyber-matchmaking-hub",
  "starry-midnight",
];

const ALL_THEME_CLASSES = THEME_WHITELIST.map((t) => `theme-${t}`);

const THEME_STORAGE_KEY = "theme-style";

function applyThemeClass(theme: ThemeStyle) {
  const html = document.documentElement;
  html.classList.remove(...ALL_THEME_CLASSES);
  html.classList.add(`theme-${theme}`);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeStyle>("original-baseline");
  const [isDark, setIsDarkState] = useState<boolean>(false);

  useEffect(() => {
    // TODO(theme-FOUC): useEffect 補 class 會讓「非預設主題」在重新整理時短暫閃現
    // original-baseline（已知限制，受眾僅 developer 預覽）。若未來開放一般用戶
    // 切換主題，必須升級為 cookie/inline-script 方案（REF-032）。
    const savedDark = localStorage.getItem("theme-dark") === "true";
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeStyle | null;
    const initialTheme =
      savedTheme && THEME_WHITELIST.includes(savedTheme) ? savedTheme : "original-baseline";

    setThemeState(initialTheme);
    setIsDarkState(savedDark);

    const html = document.documentElement;
    applyThemeClass(initialTheme);
    if (savedDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, []);

  const setTheme = (newTheme: ThemeStyle) => {
    // 僅接受白名單主題；切換入口由 ThemeSwitcher（developer-only UI）把關，
    // Context 本身不做角色檢查（主題純視覺、非安全邊界）。
    if (!THEME_WHITELIST.includes(newTheme)) return;
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyThemeClass(newTheme);
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
