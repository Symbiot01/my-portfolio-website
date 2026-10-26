// src/styles/theme.ts
// Description: Deep Space Observatory (Dark) and Daylight Observatory (Light) theme tokens.

export const lightTheme = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceHigh: '#f1f5f9',
  primary: '#4f46e5',
  accent: '#0284c7',
  text: '#0f172a',
  mutedText: '#64748b',
  headingText: '#0f172a',
  border: '#e2e8f0',
  toggleBg: '#f1f5f9',
  cardBg: '#ffffff',
  titleGradient: 'linear-gradient(120deg, #0f172a 0%, #4338ca 55%, #0284c7 100%)',
  gradient: 'linear-gradient(120deg, #4f46e5 0%, #0284c7 100%)',
  shadow: 'rgba(15, 23, 42, 0.06)',
};

export const darkTheme = {
  background: '#070a14',
  surface: '#0c1120',
  surfaceHigh: '#17213a',
  primary: '#6366f1',
  accent: '#38bdf8',
  text: '#e2e8f0',
  mutedText: '#94a3b8',
  headingText: '#f8fafc',
  border: '#1e293b',
  toggleBg: '#131c31',
  cardBg: '#101729',
  titleGradient: 'linear-gradient(120deg, #f8fafc 0%, #a5b4fc 52%, #7dd3fc 100%)',
  gradient: 'linear-gradient(120deg, #6366f1 0%, #0284c7 100%)',
  shadow: 'rgba(2, 6, 23, 0.5)',
};

export type ThemeType = typeof darkTheme;
