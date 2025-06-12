// src/app/layout.tsx
import '../styles/globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '../context/ThemeContext';
import ThemeClient from '../components/ThemeClient'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Portfolio | [Your Name]',
  description: 'ML/DL Engineer | AR/VR Engineer | Graphic Programmer | Robotics & Vision Enthusiast | Developer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <ThemeClient>
            {children}
          </ThemeClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
