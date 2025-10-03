// File: src/sections/Research.tsx
// Description: Research section with papers, notebooks, and courses filter and cards.
'use client';

import styled from '@emotion/styled';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiCode, FiAward } from 'react-icons/fi';

const Section = styled.section`
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: auto;
`;

const Title = styled.h2`
  font-size: 3rem;
  margin-bottom: 2rem;
  font-weight: 700;
  text-align: center;
  background: ${({ theme }) => theme.titleGradient};
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1.25rem;
  background: ${({ active, theme }) => (active ? theme.accent : theme.toggleBg)};
  color: ${({ active, theme }) => (active ? '#fff' : theme.text)};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 999px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.accent};
    color: #fff;
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(2, 1fr);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  backdrop-filter: blur(12px);
  border-radius: 1.5rem;
  padding: 2rem;
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const CardDesc = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.mutedText};
  line-height: 1.5;
`;

const IconWrap = styled.div`
  font-size: 2.25rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.accent};
`;

const categories = ['All', 'Papers', 'Notebooks', 'Courses'];

const items = [
  {
    title: 'RLHF Paper Summary',
    desc: 'Understanding Reinforcement Learning with Human Feedback.',
    icon: <FiBookOpen />,
    category: 'Papers',
  },
  {
    title: 'Attention is All You Need',
    desc: 'Explains the Transformer architecture with self-attention.',
    icon: <FiBookOpen />,
    category: 'Papers',
  },
  {
    title: 'DDPG on OpenAI Gym',
    desc: 'Deep Deterministic Policy Gradient implementation on custom gym env.',
    icon: <FiCode />,
    category: 'Notebooks',
  },
  {
    title: 'Image Classification with PyTorch',
    desc: 'CNN-based image classifier Colab notebook.',
    icon: <FiCode />,
    category: 'Notebooks',
  },
  {
    title: 'Deep Learning Specialization',
    desc: 'Andrew Ng’s 5-part course on Coursera.',
    icon: <FiAward />,
    category: 'Courses',
  },
  {
    title: 'CS285: Deep RL',
    desc: 'Berkeley’s graduate course with assignments and lectures.',
    icon: <FiAward />,
    category: 'Courses',
  },
];

export default function Research() {
  const [active, setActive] = useState('All');

  const filteredItems = active === 'All' ? items : items.filter(i => i.category === active);

  return (
    <Section id="research">
      <Title>Research & Learning</Title>
      <FilterBar>
        {categories.map(cat => (
          <FilterButton
            key={cat}
            active={active === cat}
            onClick={() => setActive(cat)}
          >
            {cat}
          </FilterButton>
        ))}
      </FilterBar>

      <Grid>
        {filteredItems.map((item, i) => (
          <Card
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <IconWrap>{item.icon}</IconWrap>
            <CardTitle>{item.title}</CardTitle>
            <CardDesc>{item.desc}</CardDesc>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}
