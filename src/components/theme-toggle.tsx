"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-9 w-9 rounded-[8px] bg-[#efe9de] dark:bg-[#252320] border border-[#e6dfd8] dark:border-[#2e2b27] text-[#141413] dark:text-[#faf9f5] hover:bg-[#efe9de]/80 dark:hover:bg-[#252320]/80 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-center"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}
