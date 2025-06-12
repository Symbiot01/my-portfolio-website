// theme.ts

export const lightTheme = {
  background: '#fefaf6',
  surface: '#ffffff',
  primary: '#4f46e5',
  accent: '#eab308',
  text: '#1a1a1a',
  mutedText: '#6b7280',
  border: '#e5e7eb',
  toggleBg: '#f4f1ed',
  cardBg: '#ffffff', // subtle contrast from background
  titleGradient: 'linear-gradient(90deg, #4f46e5, #22d3ee)',
};

export const darkTheme = {
  background: '#0a0f1c',
  surface: '#111827',
  primary: '#67e8f9',       // CTA buttons, links (cyber blue)
  accent: '#f472b6',        // pink accent for labels/badges
  text: '#f1f5f9',          // main readable body text
  mutedText: '#cbd5e1',     // for subtitles, meta
  headingText: '#f8fafc',   // brighter for section titles
  border: '#1f2937',
  toggleBg: '#1e293b',
  cardBg: '#1a2233',        // slightly elevated look for dark mode
  titleGradient: 'linear-gradient(90deg, #84fab0, #8fd3f4)',
};
