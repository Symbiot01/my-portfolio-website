/**
 * Celebration Purple — Wishlist design tokens (isolated from portfolio theme).
 * 8px baseline grid.
 */

export const wl = {
  primary: '#4B0082',
  primaryDeep: '#2D0C57',
  primarySoft: '#F3E8FF',
  secondary: '#008080',
  secondarySoft: '#E6F5F5',
  tertiary: '#FFD700',
  tertiarySoft: '#FFF8DC',
  reserved: '#E67E22',
  reservedSoft: '#FFF0E0',
  danger: '#C0392B',
  dangerSoft: '#FDECEA',
  success: '#27AE60',

  ink: '#1A1A1A',
  inkMuted: '#6B7280',
  inkFaint: '#9CA3AF',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  surface: '#FFFFFF',
  canvas: '#F5F3F8',
  canvasWarm: '#FAF8FC',

  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusPill: 999,

  shadow: '0 4px 16px rgba(45, 12, 87, 0.08)',
  shadowHover: '0 8px 24px rgba(45, 12, 87, 0.12)',

  space: (n: number) => `${n * 8}px`,

  font: {
    family: "'Hanken Grotesk', system-ui, sans-serif",
    headline: '700 2rem/1.2 "Hanken Grotesk", system-ui, sans-serif',
    headlineSm: '700 1.5rem/1.25 "Hanken Grotesk", system-ui, sans-serif',
    body: '400 1rem/1.5 "Hanken Grotesk", system-ui, sans-serif',
    bodySm: '400 0.875rem/1.45 "Hanken Grotesk", system-ui, sans-serif',
    label: '600 0.8125rem/1.3 "Hanken Grotesk", system-ui, sans-serif',
    labelSm: '600 0.75rem/1.2 "Hanken Grotesk", system-ui, sans-serif',
  },
} as const;

export type WishlistTokens = typeof wl;
