import { defaultTheme, themes, type ThemeId } from "@/theme/themes";

export const themeStorageKey = "resonance-genesis-theme";

export function isThemeId(value: string | null): value is ThemeId {
  return Boolean(value && themes.some((theme) => theme.id === value));
}

export function getInitialTheme(value: string | null): ThemeId {
  return isThemeId(value) ? value : defaultTheme;
}
