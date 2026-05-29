"use client";

import { Palette } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";
import { themes, type ThemeId } from "@/theme/themes";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-xs text-[var(--muted)]">
      <Palette className="h-4 w-4 text-[var(--accent)]" />
      <span className="sr-only">Theme</span>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as ThemeId)}
        className="max-w-[9rem] bg-transparent font-semibold outline-none"
        aria-label="Select visual theme"
      >
        {themes.map((item) => (
          <option key={item.id} value={item.id} className="bg-black text-white">
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}
