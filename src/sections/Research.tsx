'use client';

import styled from '@emotion/styled';
import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
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

const StyledTabs = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const StyledTabList = styled(TabList)`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  border: none;

  .react-tabs__tab {
    background: ${({ theme }) => theme.surface};
    color: ${({ theme }) => theme.text};
    padding: 0.6rem 1.4rem;
    border-radius: 999px;
    border: 2px solid transparent;
    font-weight: 600;
    cursor: pointer;
    transition: 0.3s ease;

    &:hover {
      background: ${({ theme }) => theme.toggleBg};
    }
  }

  .react-tabs__tab--selected {
    background: ${({ theme }) => theme.accent};
    color: white;
    border-color: ${({ theme }) => theme.accent};
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(2, 1fr);

  @media (max-width: 768px) {
    grid-template-columns: 1fr; // Stack on small screens
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

export default function Research() {
  const [tabIndex, setTabIndex] = useState(0);

  const papers = [
    {
      title: 'RLHF Paper Summary',
      desc: 'Understanding Reinforcement Learning with Human Feedback.',
      icon: <FiBookOpen />,
    },
    {
      title: 'Attention is All You Need',
      desc: 'Explains the Transformer architecture with self-attention.',
      icon: <FiBookOpen />,
    },
  ];

  const notebooks = [
    {
      title: 'DDPG on OpenAI Gym',
      desc: 'Deep Deterministic Policy Gradient implementation on custom gym env.',
      icon: <FiCode />,
    },
    {
      title: 'Image Classification with PyTorch',
      desc: 'CNN-based image classifier Colab notebook.',
      icon: <FiCode />,
    },
  ];

  const courses = [
    {
      title: 'Deep Learning Specialization',
      desc: 'Andrew Ng’s 5-part course on Coursera.',
      icon: <FiAward />,
    },
    {
      title: 'CS285: Deep RL',
      desc: 'Berkeley’s graduate course with assignments and lectures.',
      icon: <FiAward />,
    },
  ];

  const renderCards = (items: typeof papers, animate: boolean) =>
    items.map((item, index) => (
      <Card
        key={item.title}
        initial={animate ? { opacity: 0, y: 30 } : false}
        animate={animate ? { opacity: 1, y: 0 } : false}
        transition={{ duration: 0.4 }}
      >
        <IconWrap>{item.icon}</IconWrap>
        <CardTitle>{item.title}</CardTitle>
        <CardDesc>{item.desc}</CardDesc>
      </Card>
    ));

  return (
    <Section id="research">
      <Title>Research & Learning</Title>
      <Tabs selectedIndex={tabIndex} onSelect={setTabIndex}>
        <StyledTabs>
          <StyledTabList>
            <Tab>Papers</Tab>
            <Tab>Notebooks</Tab>
            <Tab>Courses</Tab>
          </StyledTabList>

          <TabPanel>{tabIndex === 0 && <Grid>{renderCards(papers, true)}</Grid>}</TabPanel>
          <TabPanel>{tabIndex === 1 && <Grid>{renderCards(notebooks, true)}</Grid>}</TabPanel>
          <TabPanel>{tabIndex === 2 && <Grid>{renderCards(courses, true)}</Grid>}</TabPanel>
        </StyledTabs>
      </Tabs>
    </Section>
  );
}
