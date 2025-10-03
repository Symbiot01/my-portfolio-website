// File: src/components/DarkModeToggle.tsx
// Description: Toggle button for switching between dark and light mode.
import { useTheme } from '../context/ThemeContext';

export default function DarkModeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {isDarkMode ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
}
