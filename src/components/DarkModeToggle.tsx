// File: src/components/DarkModeToggle.tsx
// Description: Toggle button for switching between dark and light mode.
'use client';

import styled from '@emotion/styled';
import { useTheme } from '../context/ThemeContext';

const ToggleButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.42rem 0.8rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.toggleBg};
  color: ${({ theme }) => theme.text};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

export default function DarkModeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <ToggleButton type="button" onClick={toggleTheme} aria-label="Toggle color theme">
      <span>{isDarkMode ? '☀️' : '🌙'}</span>
      <span>{isDarkMode ? 'Light' : 'Dark'}</span>
    </ToggleButton>
  );
}
