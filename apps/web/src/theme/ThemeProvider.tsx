"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getInitialTheme, themeStorageKey } from "@/theme/themeConfig";
import { defaultTheme, type ThemeId } from "@/theme/themes";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  setTheme: () => undefined
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(defaultTheme);

  useEffect(() => {
    const initialTheme = getInitialTheme(window.localStorage.getItem(themeStorageKey));
    setThemeState(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme(nextTheme) {
        setThemeState(nextTheme);
        document.documentElement.dataset.theme = nextTheme;
        window.localStorage.setItem(themeStorageKey, nextTheme);
      }
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
