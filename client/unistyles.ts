import { StyleSheet } from 'react-native-unistyles';

/**
 * Design tokens, ported 1:1 from the previous Tailwind/`global.css` dark palette.
 * Dark is the only theme — there is intentionally no light theme.
 */
const colors = {
  background: '#0a0a0a',
  foreground: '#fafafa',
  card: '#171717',
  cardForeground: '#fafafa',
  popover: '#0a0a0a',
  popoverForeground: '#fafafa',
  primary: '#e5e5e5',
  primaryForeground: '#171717',
  secondary: '#262626',
  secondaryForeground: '#fafafa',
  muted: '#262626',
  mutedForeground: '#a1a1a1',
  accent: '#404040',
  accentForeground: '#fafafa',
  destructive: '#ff6568',
  destructiveForeground: '#fafafa',
  border: '#282828',
  input: '#343434',
  ring: '#737373',
} as const;

const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  '2xl': 16,
  full: 9999,
} as const;

/** Tailwind text scale (fontSize / lineHeight), spread into a style with `...theme.typography.xl`. */
const typography = {
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 14, lineHeight: 20 },
  base: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 28 },
  xl: { fontSize: 20, lineHeight: 28 },
  '2xl': { fontSize: 24, lineHeight: 32 },
  '3xl': { fontSize: 30, lineHeight: 36 },
  '4xl': { fontSize: 36, lineHeight: 40 },
} as const;

const darkTheme = {
  colors,
  radius,
  typography,
  /** Tailwind spacing: 1 unit === 4px. e.g. `theme.space(4)` -> 16. */
  space: (n: number) => n * 4,
};

const appThemes = {
  dark: darkTheme,
};

const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

type AppThemes = typeof appThemes;
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  themes: appThemes,
  breakpoints,
  settings: {
    initialTheme: 'dark',
  },
});
