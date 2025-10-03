// src/app/layout.tsx
// Description: Root layout component providing theme and global styles.
import '../styles/globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import ThemeClient from '../components/ThemeClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata = { /* ... */ };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {/* 2. Wrap everything */}
          <ThemeProvider>
            <ThemeClient>
              {children}
            </ThemeClient>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}