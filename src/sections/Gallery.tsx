'use client';

import styled from '@emotion/styled';
import { useState } from 'react';
import { motion } from 'framer-motion';

const Section = styled.section`
  padding: 4rem 2rem;
`;

const HeadingWrapper = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Heading = styled.h2`
  font-size: 6rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  margin-left: 4rem;
  background: ${({ theme }) => theme.titleGradient};
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;

  @media (max-width: 1024px) {
    font-size: 3.5rem;
    margin-left: 2rem;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-left: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
    margin-left: 0.5rem;
  }
`;

const Subheading = styled.p`
  color: ${({ theme }) => theme.mutedText};
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-left: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    margin-left: 0.5rem;
  }
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 3rem;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1.25rem;
  background: ${({ active, theme }) => (active ? theme.primary : theme.toggleBg)};
  color: ${({ active, theme }) => (active ? '#fff' : theme.text)};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 999px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1.2rem;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.primary};
    color: #fff;
  }
`;

const GalleryGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Card = styled(motion.div)`
  flex: 1 1 calc(33.33% - 2rem);
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 1rem;
  overflow: hidden;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-6px);
  }

  img {
    width: 100%;
    height: 220px;
    object-fit: cover;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    padding: 1rem;
    color: ${({ theme }) => theme.text};
  }

  @media (max-width: 1024px) {
    flex: 1 1 calc(50% - 1rem);
  }

  @media (max-width: 768px) {
    flex: 1 1 100%;
  }
`;

const categories = ['All', 'GameDev', 'Creative', 'Art'];

const galleryItems = [
  {
    title: 'Self-learning Enemy AI',
    category: 'GameDev',
    image: '/images/unity-ml-soccer.jpg',
  },
  {
    title: 'VR Planet Explorer',
    category: 'GameDev',
    image: '/images/vr-planets.jpg',
  },
  {
    title: 'Sci-Fi Corridor Render',
    category: 'Creative',
    image: '/images/sci-fi-corridor.jpg',
  },
  {
    title: 'Isometric City',
    category: 'Creative',
    image: '/images/isometric-city.jpg',
  },
  {
    title: 'Portrait Sketch',
    category: 'Art',
    image: '/images/portrait-sketch.jpg',
  },
  {
    title: 'Colorful Ink Doodle',
    category: 'Art',
    image: '/images/ink-doodle.jpg',
  },
];

export default function Gallery() {
  const [active, setActive] = useState('All');

  const filtered = active === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === active);

  return (
    <Section id="gallery">
      <HeadingWrapper>
        <Heading>Gallery</Heading>
        <Subheading>
          A visual showcase of game demos, renders, and original artworks.
        </Subheading>
      </HeadingWrapper>

      <FilterBar>
        {categories.map(cat => (
          <FilterButton key={cat} active={active === cat} onClick={() => setActive(cat)}>
            {cat}
          </FilterButton>
        ))}
      </FilterBar>

      <GalleryGrid>
        {filtered.map((item, i) => (
          <Card
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <img src={item.image} alt={item.title} />
            <h3>{item.title}</h3>
          </Card>
        ))}
      </GalleryGrid>
    </Section>
  );
}
