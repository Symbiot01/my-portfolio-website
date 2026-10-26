// File: src/app/blog/page.tsx
// Description: Deep Space Observatory Documentation & Engineering Notes index with search, tag filters, and reading telemetry.
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { api } from '@/lib/api';
import Navbar from '@/sections/home/Navbar';
import { format } from 'date-fns';
import { BlogPost } from '@/types';

const PageContainer = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 3.5rem 1.5rem 5rem;
  color: ${({ theme }) => theme.text};
`;

const HeroBanner = styled.header`
  background: ${({ theme }) => `${theme.cardBg}d9`};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 2.2rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 12px 32px ${({ theme }) => theme.shadow};
`;

const TopMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const Eyebrow = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.74rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.accent};
`;

const WriteStudioBtn = styled(Link)`
  font-family: var(--font-mono), monospace;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.48rem 0.95rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.gradient};
  color: #ffffff;
  transition: opacity 0.16s ease;

  &:hover {
    opacity: 0.92;
  }
`;

const Title = styled.h1`
  font-family: var(--font-display), 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 3.6vw, 2.75rem);
  font-weight: 700;
  color: ${({ theme }) => theme.headingText};
`;

const Subtitle = styled.p`
  font-size: 0.98rem;
  color: ${({ theme }) => theme.mutedText};
  max-width: 64ch;
  line-height: 1.6;
`;

const ControlsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.75rem;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 240px;
  padding: 0.65rem 0.95rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const TagBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const TagChip = styled.button<{ active: boolean }>`
  font-family: var(--font-mono), monospace;
  font-size: 0.73rem;
  font-weight: 600;
  padding: 0.36rem 0.72rem;
  border-radius: 7px;
  border: 1px solid
    ${({ active, theme }) => (active ? theme.primary : theme.border)};
  background: ${({ active, theme }) =>
    active ? `${theme.primary}22` : theme.toggleBg};
  color: ${({ active, theme }) =>
    active ? theme.headingText : theme.mutedText};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.headingText};
  }
`;

const PostsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PostCard = styled.article`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => `${theme.cardBg}d9`};
  backdrop-filter: blur(12px);
  color: ${({ theme }) => theme.text};
  padding: 1.5rem 1.75rem;
  border-radius: 14px;
  transition: border-color 0.2s ease, transform 0.2s ease;
  box-shadow: 0 6px 20px ${({ theme }) => theme.shadow};
  display: flex;
  flex-direction: column;
  gap: 0.65rem;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    transform: translateY(-2px);
  }
`;

const PostMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-family: var(--font-mono), monospace;
  font-size: 0.72rem;
  color: ${({ theme }) => theme.mutedText};
`;

const PostTitle = styled.h2`
  font-family: var(--font-display), 'Space Grotesk', sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: ${({ theme }) => theme.headingText};
`;

const Excerpt = styled.p`
  font-size: 0.94rem;
  line-height: 1.62;
  color: ${({ theme }) => theme.mutedText};
`;

const CardFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 0.45rem;
`;

const TagsInline = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;

  span {
    font-family: var(--font-mono), monospace;
    font-size: 0.68rem;
    padding: 0.16rem 0.5rem;
    border-radius: 5px;
    background: ${({ theme }) => theme.toggleBg};
    border: 1px solid ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.text};
  }
`;

const EmptyBox = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  border: 1px dashed ${({ theme }) => theme.border};
  border-radius: 14px;
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.mutedText};
`;

function estimateReadingMinutes(post: BlogPost): number {
  const raw = (post.content || post.excerpt || '').replace(/<[^>]+>/g, '');
  const words = raw.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await api.getBlogPosts(0, 50);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return ['All', ...Array.from(set)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesTag =
        activeTag === 'All' || (p.tags && p.tags.includes(activeTag));
      const q = search.trim().toLowerCase();
      if (!q) return matchesTag;
      const matchesQuery =
        p.title.toLowerCase().includes(q) ||
        (p.excerpt || '').toLowerCase().includes(q) ||
        p.author?.username?.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchesTag && matchesQuery;
    });
  }, [posts, activeTag, search]);

  return (
    <>
      <Navbar />
      <PageContainer>
        <HeroBanner>
          <TopMeta>
            <Eyebrow>DOCUMENTATION_ARCHIVE // ENGINEERING NOTES</Eyebrow>
            <WriteStudioBtn href="/dashboard/write">
              + Open Editorial Studio
            </WriteStudioBtn>
          </TopMeta>
          <Title>Technical Journal & Architecture Logs</Title>
          <Subtitle>
            Deep-dives on Reinforcement Learning, OpenCV computer vision pipelines,
            robotics control loops, and distributed web engineering.
          </Subtitle>
        </HeroBanner>

        <ControlsRow>
          <SearchInput
            type="search"
            placeholder="Filter logs by title, keyword, tag, or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search blog posts"
          />

          <TagBar>
            {allTags.map((tag) => (
              <TagChip
                key={tag}
                type="button"
                active={activeTag === tag}
                onClick={() => setActiveTag(tag)}
              >
                {tag === 'All' ? 'ALL_LOGS' : `#${tag}`}
              </TagChip>
            ))}
          </TagBar>
        </ControlsRow>

        {loading ? (
          <EmptyBox>Loading technical specifications...</EmptyBox>
        ) : filteredPosts.length === 0 ? (
          <EmptyBox>
            <h3 style={{ marginBottom: '0.4rem' }}>No matching logs found</h3>
            <p>
              Try clearing your search filter or publish a new note in the{' '}
              <Link
                href="/dashboard/write"
                style={{ textDecoration: 'underline' }}
              >
                Editorial Studio
              </Link>
              .
            </p>
          </EmptyBox>
        ) : (
          <PostsGrid>
            {filteredPosts.map((post) => {
              const readMins = estimateReadingMinutes(post);
              const dateStr = post.createdAt
                ? format(new Date(post.createdAt), 'yyyy.MM.dd')
                : 'RECENT';
              return (
                <Link
                  href={`/blog/${post.slug}`}
                  key={post.id}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <PostCard>
                    <PostMetaRow>
                      <span>
                        {dateStr} • @{post.author?.username || 'sahil'} • {readMins} MIN READ
                      </span>
                      <span>♥ {post.likes_count || 0} LIKES</span>
                    </PostMetaRow>
                    <PostTitle>{post.title}</PostTitle>
                    {post.excerpt && <Excerpt>{post.excerpt}</Excerpt>}
                    <CardFooter>
                      <TagsInline>
                        {(post.tags && post.tags.length > 0
                          ? post.tags
                          : ['engineering']
                        ).map((t) => (
                          <span key={t}>#{t}</span>
                        ))}
                      </TagsInline>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono), monospace',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        Read Entry →
                      </span>
                    </CardFooter>
                  </PostCard>
                </Link>
              );
            })}
          </PostsGrid>
        )}
      </PageContainer>
    </>
  );
}
