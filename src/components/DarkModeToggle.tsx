import { useTheme } from '../context/ThemeContext';

export default function DarkModeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {isDarkMode ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
}
