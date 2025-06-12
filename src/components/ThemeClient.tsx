'use client';

import { useTheme } from '../context/ThemeContext';
import { ThemeProvider as EmotionThemeProvider, Global } from '@emotion/react';
import { lightTheme, darkTheme } from '../styles/theme';
import { globalStyles } from '../styles/global'; // <- importing the styles


import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function ThemeClient({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <EmotionThemeProvider theme={currentTheme}>
      <Global styles={globalStyles(currentTheme)} />
      {children}
    </EmotionThemeProvider>
  );
}
