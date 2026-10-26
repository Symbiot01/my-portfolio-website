// src/styles/theme.ts
// File: src/styles/theme.ts
// Description: Theme definitions for light and dark mode, and theme type.

export const lightTheme = {
  background: '#faf8f5',
  surface: '#ffffff',
  primary: '#4f46e5',
  accent: '#6366f1',
  text: '#1e293b',
  mutedText: '#64748b',
  headingText: '#0f172a',
  border: '#e2e8f0',
  toggleBg: '#f1f5f9',
  cardBg: '#ffffff',
  titleGradient: 'linear-gradient(120deg, #1e293b 0%, #4338ca 55%, #0f766e 100%)',
  gradient: 'linear-gradient(120deg, #4338ca 0%, #0f766e 100%)',
  shadow: 'rgba(15, 23, 42, 0.06)',
};

export const darkTheme = {
  background: '#0f141c',
  surface: '#151c27',
  primary: '#7c93c3',
  accent: '#8ca89e',
  text: '#e2e8f0',
  mutedText: '#94a3b8',
  headingText: '#f1f5f9',
  border: '#232e3f',
  toggleBg: '#1b2432',
  cardBg: '#171f2c',
  titleGradient: 'linear-gradient(120deg, #f1f5f9 0%, #a5b8d9 52%, #94b5ab 100%)',
  gradient: 'linear-gradient(120deg, #647bb0 0%, #5f8d82 100%)',
  shadow: 'rgba(2, 6, 23, 0.42)',
};

// ✅ Add this:
export type ThemeType = typeof darkTheme;
