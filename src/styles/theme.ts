// src/styles/theme.ts
// File: src/styles/theme.ts
// Description: Theme definitions for light and dark mode, and theme type.

export const lightTheme = {
  background: '#fefaf6',
  surface: '#ffffff',
  primary: '#4f46e5',
  accent: '#eab308',
  text: '#1a1a1a',
  mutedText: '#6b7280',
  headingText: '#0f172a', 
  border: '#e5e7eb',
  toggleBg: '#f4f1ed',
  cardBg: '#ffffff',
  titleGradient: 'linear-gradient(90deg, #4f46e5, #22d3ee)',
};

export const darkTheme = {
  background: '#0a0f1c',
  surface: '#111827',
  primary: '#67e8f9',
  accent: '#f472b6',
  text: '#f1f5f9',
  mutedText: '#cbd5e1',
  headingText: '#f8fafc',
  border: '#1f2937',
  toggleBg: '#1e293b',
  cardBg: '#1a2233',
  titleGradient: 'linear-gradient(90deg, #84fab0, #8fd3f4)',
};

// ✅ Add this:
export type ThemeType = typeof darkTheme;
