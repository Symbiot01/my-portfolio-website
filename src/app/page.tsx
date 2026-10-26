// File: src/app/page.tsx
// Description: Main Deep Space Observatory portfolio homepage assembling all sections.
'use client';

import Navbar from '@/sections/home/Navbar';
import Hero from '../sections/home/Hero';
import Projects from '../sections/home/Projects';
import Skills from '../sections/home/Skills';
import Research from '../sections/home/Research';
import Gallery from '../sections/home/Gallery';
import BlogPreview from '../sections/home/BlogPreview';
import Contact from '../sections/home/Contact';

export default function HomePage() {
  return (
    <main id="top">
      <Navbar />
      <Hero />
      <Projects />
      <Skills />
      <Research />
      <BlogPreview />
      <Gallery />
      <Contact />
    </main>
  );
}
