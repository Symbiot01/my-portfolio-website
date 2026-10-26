// src/app/layout.tsx
// Description: Root layout component providing theme and global styles.
import '../styles/globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import ThemeClient from '../components/ThemeClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sahil Patel — Portfolio & TripSync',
  description: 'Full-Stack Portfolio, AI/ML & Robotics Engineering, and TripSync Collaborative Planner.',
};

const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('portfolio-theme');var d=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches);var m=d?'dark':'light';var el=document.documentElement;el.dataset.theme=m;el.style.colorScheme=m;el.style.backgroundColor=d?'#0f141c':'#faf8f5';el.style.color=d?'#e2e8f0':'#1e293b';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={inter.className}>
        <AuthProvider>
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