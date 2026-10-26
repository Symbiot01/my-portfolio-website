// File: src/sections/home/Research.tsx
// Description: Research Lab & Coursework archive with filterable paper summaries, Colab notebooks, and graduate coursework.
'use client';

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiBookOpen, FiCode, FiAward } from 'react-icons/fi';

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

const Title = styled.h2`
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

const Grid = styled.div`
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(motion.article)`
  background: ${({ theme }) => `${theme.cardBg}d9`};
  backdrop-filter: blur(12px);
  border-radius: 14px;
  padding: 1.4rem;
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 8px 24px ${({ theme }) => theme.shadow};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.9rem;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ theme }) => `${theme.accent}77`};
  }
`;

const TopMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const DocId = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.7rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
`;

const CategoryPill = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.68rem;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.toggleBg};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.mutedText};
`;

const CardTitle = styled.h3`
  font-family: var(--font-display), 'Space Grotesk', sans-serif;
  font-size: 1.12rem;
  font-weight: 700;
  color: ${({ theme }) => theme.headingText};
  display: flex;
  align-items: center;
  gap: 0.55rem;

  svg {
    color: ${({ theme }) => theme.primary};
    flex-shrink: 0;
  }
`;

const CardDesc = styled.p`
  font-size: 0.88rem;
  color: ${({ theme }) => theme.mutedText};
  line-height: 1.58;
`;

const TagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding-top: 0.4rem;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const TagChip = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.68rem;
  padding: 0.16rem 0.45rem;
  border-radius: 4px;
  background: ${({ theme }) => theme.toggleBg};
  color: ${({ theme }) => theme.text};
`;

const categories = ['All', 'Papers', 'Notebooks', 'Courses'];

const items = [
  {
    code: 'ARCH_01 // RLHF',
    title: 'RLHF & Policy Alignment Breakdown',
    desc: 'Mathematical formulation of Reward Modeling, KL-penalized PPO objectives, and human preference optimization in large models.',
    icon: <FiBookOpen />,
    category: 'Papers',
    tags: ['PPO', 'Reward Modeling', 'KL Divergence'],
  },
  {
    code: 'ARCH_02 // TRANSFORMER',
    title: 'Attention Is All You Need — Systems Review',
    desc: 'Multi-head scaled dot-product attention complexity, positional encodings, and KV-cache memory bandwidth bottlenecks.',
    icon: <FiBookOpen />,
    category: 'Papers',
    tags: ['Self-Attention', 'Sequence Modeling', 'Complexity'],
  },
  {
    code: 'LAB_03 // DDPG_GYM',
    title: 'Continuous Control with DDPG on OpenAI Gym',
    desc: 'Actor-Critic deterministic policy gradient implementation with target network soft-updates and Ornstein-Uhlenbeck exploration noise.',
    icon: <FiCode />,
    category: 'Notebooks',
    tags: ['PyTorch', 'Actor-Critic', 'OpenAI Gym'],
  },
  {
    code: 'LAB_04 // CNN_VISION',
    title: 'Deep Residual Image Classification Pipeline',
    desc: 'End-to-end PyTorch training notebook with data augmentation, cosine annealing schedules, and confusion matrix diagnostics.',
    icon: <FiCode />,
    category: 'Notebooks',
    tags: ['PyTorch', 'Computer Vision', 'CNN'],
  },
  {
    code: 'COURSE_05 // CS285',
    title: 'UC Berkeley CS285: Deep Reinforcement Learning',
    desc: 'Graduate coursework covering policy gradients, Q-learning, model-based RL, offline RL, and inverse reinforcement learning.',
    icon: <FiAward />,
    category: 'Courses',
    tags: ['Deep RL', 'MDPs', 'Trajectory Optimization'],
  },
  {
    code: 'COURSE_06 // DL_SPEC',
    title: 'Deep Learning & Robot Autonomy Track',
    desc: 'Neural networks, hyperparameter tuning, sequence models, plus IIT Kharagpur coursework in AI/ML for Robot Autonomy & Optimization.',
    icon: <FiAward />,
    category: 'Courses',
    tags: ['IIT Kharagpur', 'Autonomy', 'Optimization'],
  },
];

export default function Research() {
  const [active, setActive] = useState('All');

  const filteredItems =
    active === 'All' ? items : items.filter((i) => i.category === active);

  return (
    <Section id="research">
      <HeaderBar>
        <div>
          <Eyebrow>RESEARCH_ARCHIVE // PAPERS, LABS & COURSEWORK</Eyebrow>
          <Title>Research & Technical Foundations</Title>
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

      <Grid>
        {filteredItems.map((item, i) => (
          <Card
            key={item.code}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <div>
              <TopMeta>
                <DocId>{item.code}</DocId>
                <CategoryPill>{item.category}</CategoryPill>
              </TopMeta>
              <CardTitle style={{ marginTop: '0.65rem' }}>
                {item.icon}
                <span>{item.title}</span>
              </CardTitle>
              <CardDesc style={{ marginTop: '0.5rem' }}>{item.desc}</CardDesc>
            </div>

            <TagsRow>
              {item.tags.map((t) => (
                <TagChip key={t}>{t}</TagChip>
              ))}
            </TagsRow>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}
