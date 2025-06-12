// src/styles/global.ts
import { css } from '@emotion/react';

export const globalStyles = (theme: any) => css`
  html {
    scroll-behavior: smooth;
  }
  body {
    margin: 0;
    padding: 0;
    background-color: ${theme.background};
    color: ${theme.color};
    transition: background-color 0.3s ease, color 0.3s ease;
    font-family: sans-serif;
  }

  a {
    color: ${theme.linkColor};
    text-decoration: none;
  }

  h1, h2, h3 {
    font-weight: bold;
  }

  /* Add more global styles here */
`;
