// File: src/sections/home/BlogPreview.tsx
// Description: Engineering Notes & Blog preview section pulling live published posts with fallback articles.
'use client';

import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fetchPublishedPosts } from '@/lib/api';

const Section = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 4.5rem 1.5rem;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
`;

const ActionLink = styled(Link)<{ primary?: boolean }>`
  font-family: var(--font-mono), monospace;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.52rem 0.95rem;
  border-radius: 8px;
  border: 1px solid
    ${({ primary, theme }) => (primary ? theme.primary : theme.border)};
  background: ${({ primary, theme }) =>
    primary ? `${theme.primary}1f` : theme.toggleBg};
  color: ${({ theme }) => theme.headingText};
  transition: border-color 0.18s ease;

  &:hover {
    border-color: ${({ theme }) => theme.accent};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const BlogCard = styled(motion.article)`
  background: ${({ theme }) => `${theme.cardBg}d9`};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 1.4rem;
  box-shadow: 0 8px 24px ${({ theme }) => theme.shadow};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.9rem;
  transition: transform 0.18s ease, border-color 0.18s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ theme }) => theme.primary};
  }

  h3 {
    font-family: var(--font-display), 'Space Grotesk', sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: ${({ theme }) => theme.headingText};
    line-height: 1.32;
  }

  p {
    font-size: 0.88rem;
    color: ${({ theme }) => theme.mutedText};
    line-height: 1.6;
  }
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const Badge = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.68rem;
  background: ${({ theme }) => theme.toggleBg};
  color: ${({ theme }) => theme.mutedText};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 0.18rem 0.5rem;
  border-radius: 5px;
`;

const ReadLink = styled(Link)`
  font-family: var(--font-mono), monospace;
  font-size: 0.76rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;

  &:hover {
    text-decoration: underline;
  }
`;

interface PreviewPost {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  href: string;
}

const FALLBACK_POSTS: PreviewPost[] = [
  {
    title: 'Training Multi-Agent Combat Policies in Unity with PPO',
    excerpt:
      'Reward shaping, raycast sensor observations, and curriculum training loops for autonomous 3D game agents.',
    date: '2025.06',
    readTime: '5 MIN READ',
    tags: ['RL', 'Unity', 'PyTorch'],
    href: '/blog',
  },
  {
    title: 'Low-Latency Object Tracking Pipelines with OpenCV & Kalman Filters',
    excerpt:
      'Combining spatial contour filtering with linear quadratic state estimation for resilient robotics vision.',
    date: '2025.05',
    readTime: '4 MIN READ',
    tags: ['OpenCV', 'Robotics', 'Python'],
    href: '/blog',
  },
  {
    title: 'Designing TripSync: Minimum-Transfer Debt Simplification & AI Diffs',
    excerpt:
      'How we built an O(N log N) greedy net-balance settlement engine and structured LLM proposal previews.',
    date: '2025.08',
    readTime: '6 MIN READ',
    tags: ['FastAPI', 'Algorithms', 'Next.js'],
    href: '/blog',
  },
];

export default function BlogPreview() {
  const [posts, setPosts] = useState<PreviewPost[]>(FALLBACK_POSTS);

  useEffect(() => {
    let active = true;
    fetchPublishedPosts(0, 3)
      .then((res) => {
        if (!active || !Array.isArray(res) || res.length === 0) return;
        const mapped: PreviewPost[] = res.slice(0, 3).map((p: any) => ({
          title: p.title,
          excerpt:
            p.excerpt ||
            (typeof p.content === 'string'
              ? p.content.replace(/<[^>]+>/g, '').slice(0, 140) + '...'
              : 'Technical engineering note.'),
          date: p.created_at
            ? new Date(p.created_at).toISOString().slice(0, 7).replace('-', '.')
            : 'LOG',
          readTime: `${p.reading_time_minutes || 4} MIN READ`,
          tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags.slice(0, 3) : ['Systems'],
          href: `/blog/${p.slug}`,
        }));
        setPosts(mapped);
      })
      .catch(() => {
        // Keep fallback posts silently when backend is offline
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Section id="blog-preview">
      <HeaderRow>
        <div>
          <Eyebrow>EDITORIAL_STREAM // TECHNICAL LOGS</Eyebrow>
          <Title>Engineering Notes & Blog</Title>
        </div>

        <HeaderActions>
          <ActionLink href="/dashboard/write">Open Editorial Studio ✎</ActionLink>
          <ActionLink href="/blog" primary>
            All Articles →
          </ActionLink>
        </HeaderActions>
      </HeaderRow>

      <Grid>
        {posts.map((post, idx) => (
          <BlogCard
            key={post.title + idx}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: idx * 0.06 }}
          >
            <div>
              <BadgeRow style={{ marginBottom: '0.7rem' }}>
                <Badge>{post.date}</Badge>
                <Badge>{post.readTime}</Badge>
                {post.tags.map((tag) => (
                  <Badge key={tag}>#{tag}</Badge>
                ))}
              </BadgeRow>
              <h3>{post.title}</h3>
              <p style={{ marginTop: '0.55rem' }}>{post.excerpt}</p>
            </div>

            <ReadLink href={post.href}>Read Specification →</ReadLink>
          </BlogCard>
        ))}
      </Grid>
    </Section>
  );
}
