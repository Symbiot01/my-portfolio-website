'use client';

import styled from '@emotion/styled';
import { useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import { motion } from 'framer-motion';


declare module '@emotion/react' {
  export interface Theme {
    cardBg: string;
    mutedText: string;
    titleGradient: string;
    primary: string;
    accent: string;
    text: string;
    toggleBg: string;

  }
}

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

  @media (min-width: 2000px) {
    font-size: 8rem;
    margin-left: 6rem;
  }

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
    @media (min-width: 2000px) {
    font-size: 1.8rem;
    margin-left: 6rem;
  }

  @media (max-width: 1024px) {
    font-size: 1.4rem;
    margin-left: 2rem;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-left: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    margin-left: 0.5rem;
  }
`;

const Section = styled.section`
  padding: 4rem 2rem;
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
  font-size: 1.4rem; // base size
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.primary};
    color: #fff;
  }

  @media (min-width: 2000px) {
    font-size: 2rem;
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;


const ProjectsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  justify-content: space-between;

  @media (min-width: 2000px) {
    & > * {
      flex: 1 1 calc(33.33% - 2rem);
      min-width: 30%;
    }
  }

  @media (max-width: 1999px) {
    & > * {
      flex: 1 1 calc(50% - 1.5rem);
      min-width: 40%;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;

    & > * {
      flex: 1 1 100%;
      min-width: 100%;
    }
  }
`;

const MotionCard = styled(motion.div)`
  @media (min-width: 2000px) {
    flex: 1 1 calc(33.33% - 2rem);
    min-width: 30%;
  }

  @media (max-width: 1999px) {
    flex: 1 1 calc(50% - 1.5rem);
    min-width: 40%;
  }

  @media (max-width: 768px) {
    flex: 1 1 100%;
    min-width: 100%;
  }
`;

const categories = [
  'All',
  'AI/ML & DL',
  'Computer Vision & Robotics',
  'Web Dev & Full Stack',
  'GameDev & AR/VR',
  'Creative Works',
];

const sampleProjects = [
  {
    title: 'Self-learning Enemy AI in Unity',
    stack: ['Unity', 'ML-Agents', 'C#'],
    description: 'A reinforcement learning agent trained to behave like a smart enemy in 3D environments.',
    image: '/projects/enemy-ai.jpg',
    category: 'GameDev & AR/VR',
  },
  {
    title: 'OpenCV Object Detection',
    stack: ['Python', 'OpenCV'],
    description: 'Real-time object detection system using traditional computer vision techniques.',
    image: '/projects/object-detection.jpg',
    category: 'Computer Vision & Robotics',
  },
  {
    title: 'Personal Portfolio',
    stack: ['Next.js', 'Emotion', 'TypeScript'],
    description: 'Fully responsive dark/light mode developer portfolio with blog, gallery, and contact.',
    image: '/projects/portfolio.jpg',
    category: 'Web Dev & Full Stack',
  },

];

export default function Projects() {
  const [active, setActive] = useState('All');

  const filtered = active === 'All'
    ? sampleProjects
    : sampleProjects.filter(p => p.category === active);

  return (
    <Section id="projects">
      <HeadingWrapper>
        <Heading>Projects</Heading>
        <Subheading>
          A curated selection of work showcasing AI, robotics, full-stack, and game development.
        </Subheading>
      </HeadingWrapper>
      <FilterBar>
        {categories.map(cat => (
          <FilterButton key={cat} active={active === cat} onClick={() => setActive(cat)}>
            {cat}
          </FilterButton>
        ))}
      </FilterBar>

      <ProjectsGrid>
        {filtered.map((p, i) => (
          <MotionCard
          key={i}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          <ProjectCard
            key={i}
            title={p.title}
            stack={p.stack}
            description={p.description}
            image={p.image}
          />
        </MotionCard>
        ))}
      </ProjectsGrid>
    </Section>
  );
}
