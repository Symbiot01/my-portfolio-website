// File: src/styles/global.ts
// Description: Global Emotion CSS styles for theming and layout.
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
    color: ${theme.text};
    transition: background-color 0.3s ease, color 0.3s ease;
    font-family: sans-serif;
  }

  a {
    color: ${theme.primary};
    text-decoration: none;
  }

  h1, h2, h3 {
    font-weight: bold;
  }
`;
