// src/app/layout.tsx
// Description: Root layout component providing Deep Space Observatory fonts, theme, and global styles.
import '../styles/globals.css';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import ThemeClient from '../components/ThemeClient';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Sahil Patel // Deep Space Observatory & Systems Engineering',
  description:
    'Autonomous Robotics, AI/ML & Deep RL, Computer Vision, Full-Stack Systems, TripSync & Hardware Registry.',
};

const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('portfolio-theme');var d=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches);var m=d?'dark':'light';var el=document.documentElement;el.dataset.theme=m;el.style.colorScheme=m;el.style.backgroundColor=d?'#070a14':'#f8fafc';el.style.color=d?'#e2e8f0':'#0f172a';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <ThemeClient>{children}</ThemeClient>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}