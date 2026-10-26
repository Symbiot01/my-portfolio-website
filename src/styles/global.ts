// File: src/styles/global.ts
// Description: Global Emotion CSS styles for Deep Space Observatory theming and layout.
import { css } from '@emotion/react';
import { ThemeType } from './theme';

export const globalStyles = (theme: ThemeType) => css`
  html {
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: ${theme.background};
    background-image: ${theme.background === '#070a14'
      ? `radial-gradient(ellipse 80% 50% at 50% -15%, rgba(99, 102, 241, 0.14), transparent 70%),
         radial-gradient(ellipse 55% 40% at 85% 55%, rgba(56, 189, 248, 0.06), transparent 65%)`
      : `radial-gradient(ellipse 80% 45% at 50% -15%, rgba(79, 70, 229, 0.06), transparent 70%)`};
    background-attachment: fixed;
    color: ${theme.text};
    transition: background-color 0.25s ease, color 0.25s ease;
    font-family: var(--font-sans), 'Inter', system-ui, -apple-system, sans-serif;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-display), 'Space Grotesk', system-ui, sans-serif;
    letter-spacing: -0.02em;
  }

  code,
  pre,
  kbd {
    font-family: var(--font-mono), 'JetBrains Mono', monospace;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;
