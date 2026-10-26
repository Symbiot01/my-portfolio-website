/**
 * Deep Space Observatory & Daylight — Wishlist design tokens
 * Powered by CSS custom properties so it automatically adapts to Dark & Light mode.
 */

export const wl = {
  primary: 'var(--obs-primary)',
  primaryDeep: 'var(--obs-primary-deep)',
  primarySoft: 'var(--obs-primary-soft)',
  secondary: 'var(--obs-secondary)',
  secondarySoft: 'var(--obs-secondary-soft)',
  tertiary: 'var(--obs-tertiary)',
  tertiarySoft: 'var(--obs-tertiary-soft)',
  reserved: 'var(--obs-reserved)',
  reservedSoft: 'var(--obs-reserved-soft)',
  danger: 'var(--obs-danger)',
  dangerSoft: 'var(--obs-danger-soft)',
  success: 'var(--obs-success)',

  ink: 'var(--obs-ink)',
  inkMuted: 'var(--obs-ink-muted)',
  inkFaint: 'var(--obs-ink-faint)',
  border: 'var(--obs-border)',
  borderStrong: 'var(--obs-border-strong)',
  surface: 'var(--obs-surface)',
  surfaceLow: 'var(--obs-surface-low)',
  surfaceHigh: 'var(--obs-surface-high)',
  canvas: 'var(--obs-bg)',
  canvasWarm: 'var(--obs-surface-low)',

  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusPill: 999,

  shadow: 'var(--obs-shadow)',
  shadowHover: 'var(--obs-shadow-hover)',

  space: (n: number) => `${n * 8}px`,

  font: {
    family: 'var(--font-sans), "Inter", system-ui, sans-serif',
    mono: 'var(--font-mono), "JetBrains Mono", monospace',
    headline: '700 2rem/1.2 var(--font-display), "Space Grotesk", system-ui, sans-serif',
    headlineSm: '600 1.25rem/1.3 var(--font-display), "Space Grotesk", system-ui, sans-serif',
    body: '400 0.95rem/1.55 var(--font-sans), "Inter", system-ui, sans-serif',
    bodySm: '400 0.84rem/1.45 var(--font-sans), "Inter", system-ui, sans-serif',
    label: '600 0.78rem/1.3 var(--font-mono), "JetBrains Mono", monospace',
    labelSm: '600 0.7rem/1.2 var(--font-mono), "JetBrains Mono", monospace',
  },
} as const;

export type WishlistTokens = typeof wl;
