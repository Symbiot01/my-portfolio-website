// src/app/page.tsx
'use client';

import ThemeClient from '../components/ThemeClient';
import Navbar from '@/sections/Navbar';
import Hero from '../sections/Hero';
import Projects from '../sections/Projects';
import Skills from '../sections/Skills';
import Research from '../sections/Research';
import Gallery from '../sections/Gallery';
import BlogPreview from '../sections/BlogPreview';
import About from '../sections/About';
import Contact from '../sections/Contact';

export default function HomePage() {
  return (
    <main>
     <ThemeClient>
        <Navbar />
     </ThemeClient>
      <Hero />
      <Projects />
      <Skills />
      <Research />
      <BlogPreview />
      <Gallery />
      <About />
      <Contact />
    </main>
  );
}