// File: src/sections/home/Gallery.tsx
// Description: Visual Vault section showcasing 3D renders, simulation scenes, and creative artworks with telemetry overlays.
'use client';

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Image from 'next/image';

const Section = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 4.5rem 1.5rem;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const HeaderBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Eyebrow = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.accent};
`;

const Heading = styled.h2`
  font-family: var(--font-display), 'Space Grotesk', sans-serif;
  font-size: clamp(1.85rem, 3.2vw, 2.5rem);
  font-weight: 700;
  color: ${({ theme }) => theme.headingText};
  margin-top: 0.35rem;
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  background: ${({ theme }) => theme.toggleBg};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 0.3rem;
  border-radius: 10px;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.4rem 0.85rem;
  background: ${({ active, theme }) => (active ? theme.primary : 'transparent')};
  color: ${({ active, theme }) => (active ? '#fff' : theme.mutedText)};
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-family: var(--font-mono), monospace;
  font-weight: 600;
  font-size: 0.76rem;
  transition: all 0.16s ease;

  &:hover {
    color: ${({ active, theme }) => (active ? '#fff' : theme.headingText)};
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => `${theme.cardBg}d9`};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 24px ${({ theme }) => theme.shadow};
  transition: transform 0.22s ease, border-color 0.22s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ theme }) => `${theme.primary}88`};
  }
`;

const Frame = styled.div`
  position: relative;
  width: 100%;
  height: 215px;
  background: #070a14;
`;

const CardMeta = styled.div`
  padding: 0.9rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  h3 {
    font-family: var(--font-display), 'Space Grotesk', sans-serif;
    font-size: 0.98rem;
    font-weight: 600;
    color: ${({ theme }) => theme.headingText};
  }

  span {
    font-family: var(--font-mono), monospace;
    font-size: 0.68rem;
    padding: 0.18rem 0.5rem;
    border-radius: 5px;
    background: ${({ theme }) => theme.toggleBg};
    border: 1px solid ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.mutedText};
  }
`;

const categories = ['All', 'GameDev', 'Creative', 'Art'];

const galleryItems = [
  {
    title: 'Multi-Agent RL Soccer Arena',
    category: 'GameDev',
    spec: 'UNITY // PPO',
    image: '/images/unity-ml-soccer.jpg',
  },
  {
    title: 'VR Planetary Cockpit & Shaders',
    category: 'GameDev',
    spec: 'OPENXR // HLSL',
    image: '/images/vr-planets.jpg',
  },
  {
    title: 'Orbital Sci-Fi Corridor Render',
    category: 'Creative',
    spec: 'BLENDER // CYCLES',
    image: '/images/sci-fi-corridor.jpg',
  },
  {
    title: 'Procedural Isometric Metropolis',
    category: 'Creative',
    spec: '3D // LIGHTING',
    image: '/images/isometric-city.jpg',
  },
  {
    title: 'Graphite Character Study',
    category: 'Art',
    spec: 'TRADITIONAL',
    image: '/images/portrait-sketch.jpg',
  },
  {
    title: 'Chromatic Ink Composition',
    category: 'Art',
    spec: 'ILLUSTRATION',
    image: '/images/ink-doodle.jpg',
  },
];

export default function Gallery() {
  const [active, setActive] = useState('All');

  const filtered =
    active === 'All'
      ? galleryItems
      : galleryItems.filter((item) => item.category === active);

  return (
    <Section id="gallery">
      <HeaderBar>
        <div>
          <Eyebrow>VISUAL_VAULT // RENDERS, SIMULATIONS & ART</Eyebrow>
          <Heading>3D Renders & Simulation Captures</Heading>
        </div>

        <FilterBar>
          {categories.map((cat) => (
            <FilterButton
              key={cat}
              type="button"
              active={active === cat}
              onClick={() => setActive(cat)}
            >
              {cat}
            </FilterButton>
          ))}
        </FilterBar>
      </HeaderBar>

      <GalleryGrid>
        {filtered.map((item, i) => (
          <Card
            key={item.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            viewport={{ once: true }}
          >
            <Frame>
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
            </Frame>
            <CardMeta>
              <h3>{item.title}</h3>
              <span>{item.spec}</span>
            </CardMeta>
          </Card>
        ))}
      </GalleryGrid>
    </Section>
  );
}
