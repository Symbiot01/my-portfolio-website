'use client';

import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import blogAnim from '../../public/lottie/blog.json'; 
import { useState } from 'react';

const Section = styled.section`
  padding: 4rem 2rem;
`;

const Header = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
`;

const Title = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  background: ${({ theme }) => theme.titleGradient};
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  border-bottom: 2px solid #ccc;
  padding-bottom: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const BlogCard = styled(motion.div)`
  background: none;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
  font-size: 0.75rem;
`;

const Badge = styled.span`
  background: #eee;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const posts = [
  {
    title: 'How I Trained an Agent in Unity',
    excerpt: 'Exploring Unity ML-Agents for intelligent behaviors...',
    date: 'June 2025',
    readTime: '4 min',
    tags: ['AI', 'Unity', 'RL'],
  },
  {
    title: 'Vision Systems with OpenCV',
    excerpt: 'A walkthrough of object tracking and detection methods...',
    date: 'May 2025',
    readTime: '3 min',
    tags: ['OpenCV', 'Robotics', 'Python'],
  },
];

export default function BlogPreview() {
  const [filter] = useState('All');
  const filtered = filter === 'All' ? posts : posts.filter(p => p.tags.includes(filter));

  return (
    <Section>
      <Header
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Lottie animationData={blogAnim} style={{ width: 64, height: 64 }} />
        <Title>Blog & Learnings</Title>
      </Header>

      <Grid>
        {filtered.map((post, idx) => (
          <BlogCard
            key={idx}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Avatar src="/avatar.png" alt="avatar" />
            <h3>{post.title}</h3>
            <BadgeRow>
              <Badge>{post.date}</Badge>
              <Badge>{post.readTime}</Badge>
              {post.tags.map(tag => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </BadgeRow>
            <p>{post.excerpt}</p>
          </BlogCard>
        ))}
      </Grid>
    </Section>
  );
}