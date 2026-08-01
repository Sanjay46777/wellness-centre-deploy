import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

// Colors mirror global.css variables exactly
export const THEME = {
  light: {
    background: 'hsl(260 20% 98%)',
    foreground: 'hsl(260 25% 10%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(260 25% 10%)',
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(260 25% 10%)',
    primary: 'hsl(263 56% 52%)',
    primaryForeground: 'hsl(0 0% 100%)',
    secondary: 'hsl(199 92% 60%)',
    secondaryForeground: 'hsl(260 25% 10%)',
    muted: 'hsl(260 20% 95%)',
    mutedForeground: 'hsl(260 10% 45%)',
    accent: 'hsl(158 64% 42%)',
    accentForeground: 'hsl(0 0% 100%)',
    destructive: 'hsl(0 72% 51%)',
    destructiveForeground: 'hsl(0 0% 100%)',
    border: 'hsl(260 20% 90%)',
    input: 'hsl(260 20% 90%)',
    ring: 'hsl(263 56% 52%)',
    radius: '0.75rem',
  },
  dark: {
    background: 'hsl(260 20% 7%)',
    foreground: 'hsl(260 20% 96%)',
    card: 'hsl(260 20% 10%)',
    cardForeground: 'hsl(260 20% 96%)',
    popover: 'hsl(260 20% 10%)',
    popoverForeground: 'hsl(260 20% 96%)',
    primary: 'hsl(263 56% 65%)',
    primaryForeground: 'hsl(260 25% 6%)',
    secondary: 'hsl(199 92% 55%)',
    secondaryForeground: 'hsl(260 25% 6%)',
    muted: 'hsl(260 18% 16%)',
    mutedForeground: 'hsl(260 10% 65%)',
    accent: 'hsl(158 64% 48%)',
    accentForeground: 'hsl(260 25% 6%)',
    destructive: 'hsl(0 72% 55%)',
    destructiveForeground: 'hsl(0 0% 100%)',
    border: 'hsl(260 18% 20%)',
    input: 'hsl(260 18% 20%)',
    ring: 'hsl(263 56% 65%)',
    radius: '0.75rem',
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
