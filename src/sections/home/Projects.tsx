// File: src/sections/home/Projects.tsx
// Description: 3-column Deep Space Observatory engineering bento matrix with category filters and live subsystem links.
'use client';

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import ProjectCard, { ProjectItem } from '../../components/ProjectCard';

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
  margin-bottom: 2.25rem;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
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
  font-size: clamp(1.85rem, 3.2vw, 2.6rem);
  font-weight: 700;
  color: ${({ theme }) => theme.headingText};
`;

const Subheading = styled.p`
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.96rem;
  max-width: 58ch;
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
  padding: 0.42rem 0.85rem;
  background: ${({ active, theme }) => (active ? theme.primary : 'transparent')};
  color: ${({ active, theme }) => (active ? '#ffffff' : theme.mutedText)};
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-family: var(--font-mono), monospace;
  font-weight: 600;
  font-size: 0.76rem;
  transition: all 0.16s ease;

  &:hover {
    color: ${({ active, theme }) => (active ? '#ffffff' : theme.headingText)};
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.4rem;

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const CATEGORIES = [
  'All',
  'AI/ML & RL',
  'CV & Robotics',
  'Full-Stack Systems',
  'Simulation & XR',
];

const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'enemy-ai-rl',
    codeId: 'SYS_01 // RL_COMBAT',
    title: 'Self-Learning Multi-Agent AI in Unity',
    category: 'AI/ML & RL',
    status: 'TRAINED • PPO',
    description:
      'Autonomous reinforcement learning agents trained with Proximal Policy Optimization (PPO) and curriculum reward shaping to coordinate, flank, and adapt in 3D arenas.',
    stack: ['Unity', 'ML-Agents', 'PyTorch', 'C#', 'PPO'],
    image: '/projects/enemy-ai.jpg',
    metrics: '2.4M Steps • 91% Win-Rate',
    architecture: [
      'RayPerceptionSensor3D + custom velocity/cooldown observation vector (48 floats)',
      'Curriculum learning across 4 progressive arena difficulty stages',
      'Exported ONNX policy running at <1.8ms inference per frame inside Unity Barracuda',
    ],
    repoHref: 'https://github.com/Symbiot01',
  },
  {
    id: 'tripsync-platform',
    codeId: 'SYS_02 // TRIPSYNC',
    title: 'TripSync — Group Expense & AI Itinerary Platform',
    category: 'Full-Stack Systems',
    status: 'LIVE PROD',
    description:
      'Full-stack collaborative travel workspace featuring multi-currency expense ledgers, minimum-transfer debt simplification, PIN/Token access, and a structured Gemini Co-Pilot.',
    stack: ['Next.js 14', 'FastAPI', 'MongoDB Beanie', 'TypeScript', 'Gemini AI'],
    image: '/hero/Project1.jpg',
    metrics: 'O(N log N) Debt Graph',
    architecture: [
      'Greedy net-balance matching reduces group settlements to minimal transactions',
      'Scoped capability tokens & PBKDF2 PIN auth for frictionless trip sharing',
      'Structured AI proposal diff engine with human-readable preview before commit',
    ],
    liveHref: '/tripsync',
    repoHref: 'https://github.com/Symbiot01',
  },
  {
    id: 'opencv-vision-pipeline',
    codeId: 'SYS_03 // CV_TRACKER',
    title: 'Real-Time OpenCV Object Detection & Tracking',
    category: 'CV & Robotics',
    status: '60 FPS • EDGE',
    description:
      'Low-latency visual perception pipeline combining contour filtering, Kalman state estimation, and feature matching for robotic target lock and obstacle avoidance.',
    stack: ['Python', 'OpenCV', 'NumPy', 'Kalman Filter', 'ROS'],
    image: '/projects/object-detection.jpg',
    metrics: '16.2ms Frame Latency',
    architecture: [
      'Adaptive HSV + morphological spatial filtering resilient to lighting shifts',
      'Multi-target centroid association with occlusion recovery buffer',
      'Serial/ROS geometry telemetry publisher for downstream actuator control',
    ],
    repoHref: 'https://github.com/Symbiot01',
  },
  {
    id: 'hardware-wishlist-depot',
    codeId: 'SYS_04 // WISHLIST_DEPOT',
    title: 'Anti-Spoiler Hardware & Gift Registry',
    category: 'Full-Stack Systems',
    status: 'LIVE PROD',
    description:
      'Collaborative wishlist and hardware procurement board with automated OpenGraph URL scraping, priority filtering, and anti-spoiler reservation masking for groupowners.',
    stack: ['Next.js', 'FastAPI', 'BeautifulSoup4', 'MongoDB', 'Emotion'],
    image: '/hero/Project2.jpg',
    metrics: 'Auto-OG URL Scraper',
    architecture: [
      'Server-side role serializer masks reserved_by fields when viewer == owner',
      'Live URL metadata extractor parses title, price, and product imagery automatically',
      'Tokenized read/write invite links with zero-account guest participation',
    ],
    liveHref: '/wishlist',
    repoHref: 'https://github.com/Symbiot01',
  },
  {
    id: 'editorial-studio-engine',
    codeId: 'SYS_05 // DOC_STUDIO',
    title: 'Observatory Editorial Studio & PR Review Queue',
    category: 'Full-Stack Systems',
    status: 'LIVE PROD',
    description:
      'Rich technical publishing workstation built on Tiptap with Markdown shortcuts, code syntax blocks, YouTube embeds, and an admin approval merge queue.',
    stack: ['Tiptap', 'Next.js', 'FastAPI', 'JWT Auth', 'Cloudinary'],
    image: '/projects/portfolio.jpg',
    metrics: 'MD + WYSIWYG Hybrid',
    architecture: [
      'Role-based publishing pipeline: authors submit drafts, admins inspect & merge',
      'Live word/character/reading-time telemetry and frontmatter tag indexing',
      'Interactive article reader with like counter, code copy, and threaded comments',
    ],
    liveHref: '/blog',
    repoHref: 'https://github.com/Symbiot01',
  },
  {
    id: 'vr-planet-simulation',
    codeId: 'SYS_06 // XR_SIM',
    title: 'VR Planetary Orbital & Shader Simulation',
    category: 'Simulation & XR',
    status: 'OPENXR • 90Hz',
    description:
      'Interactive virtual reality planetary exploration environment featuring custom GLSL/HLSL atmospheric scattering shaders and Newtonian orbital mechanics.',
    stack: ['Unity XR', 'OpenXR', 'HLSL Shaders', 'C#', 'Blender'],
    image: '/images/vr-planets.jpg',
    metrics: '90Hz Stereo Render',
    architecture: [
      'Custom procedural surface & Rayleigh atmosphere shader graph optimized for VR',
      'Physics-driven gravitational slingshot and orbital trajectory predictor',
      'Spatial audio and 6-DoF hand-tracked cockpit instrumentation',
    ],
    repoHref: 'https://github.com/Symbiot01',
  },
];

export default function Projects() {
  const [active, setActive] = useState('All');

  const filtered =
    active === 'All'
      ? PROJECTS_DATA
      : PROJECTS_DATA.filter((p) => p.category === active);

  return (
    <Section id="projects">
      <HeaderBar>
        <TitleBlock>
          <Eyebrow>SYS_MATRIX // DEPLOYED ARCHITECTURES</Eyebrow>
          <Heading>Featured Engineering Systems</Heading>
          <Subheading>
            Production web applications, reinforcement learning agents, and computer
            vision pipelines—complete with expandable architecture specs.
          </Subheading>
        </TitleBlock>

        <FilterBar role="tablist" aria-label="Filter projects by domain">
          {CATEGORIES.map((category) => (
            <FilterButton
              key={category}
              type="button"
              active={active === category}
              onClick={() => setActive(category)}
            >
              {category}
            </FilterButton>
          ))}
        </FilterBar>
      </HeaderBar>

      <ProjectsGrid>
        {filtered.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </ProjectsGrid>
    </Section>
  );
}
