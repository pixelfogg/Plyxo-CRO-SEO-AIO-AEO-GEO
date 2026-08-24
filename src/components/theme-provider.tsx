"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  attribute?: string;
};

const ThemeProviderContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: "system",
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  attribute = "class",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else if (enableSystem) {
      setThemeState("system");
    }
  }, [enableSystem]);

  useEffect(() => {
    const root = window.document.documentElement;

    if (disableTransitionOnChange) {
      root.classList.add("[&_*]:!transition-none");
      window.setTimeout(() => {
        root.classList.remove("[&_*]:!transition-none");
      }, 0);
    }

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      
      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
      root.style.colorScheme = systemTheme;
      return;
    }

    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }, [theme, enableSystem, disableTransitionOnChange]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem("theme", newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
