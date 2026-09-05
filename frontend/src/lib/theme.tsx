"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/** Pages that must always render in light mode regardless of the user's stored preference. */
const FORCED_LIGHT_PATHS = new Set(["/", "/login", "/register"]);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isForcedLight = FORCED_LIGHT_PATHS.has(pathname);

  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Load stored preference – but only for pages that support theming
  useEffect(() => {
    if (isForcedLight) return;
    const stored = localStorage.getItem("scaffold-theme") as Theme | null;
    if (stored) setThemeState(stored);
  }, [isForcedLight]);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function resolve(t: Theme): "light" | "dark" {
      if (t === "system") {
        return mediaQuery.matches ? "dark" : "light";
      }
      return t;
    }

    function apply(t: Theme) {
      // Forced-light pages always get the light class regardless of stored theme
      const resolved: "light" | "dark" = isForcedLight ? "light" : resolve(t);
      setResolvedTheme(resolved);
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
    }

    apply(theme);

    const listener = () => {
      if (theme === "system") apply("system");
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme, pathname, isForcedLight]);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("scaffold-theme", t);
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
