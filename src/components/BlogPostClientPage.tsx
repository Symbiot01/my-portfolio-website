// File: src/components/BlogPostClientPage.tsx
// Description: Deep Space Observatory Article Reader with reading telemetry, interactive Like button, cover image, and comments stream.
'use client';

import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import Navbar from '@/sections/home/Navbar';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import CommentsSection from '@/components/CommentsSection';
import { BlogPost, Comment } from '@/types';
import { api } from '@/lib/api';
import { format } from 'date-fns';

const ArticleOuter = styled.article`
  max-width: 860px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
  color: ${({ theme }) => theme.text};
`;

const TopNavRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const BackLink = styled(Link)`
  font-family: var(--font-mono), monospace;
  font-size: 0.76rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;

  &:hover {
    text-decoration: underline;
  }
`;

const HeaderCard = styled.header`
  background: ${({ theme }) => `${theme.cardBg}d9`};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 12px 32px ${({ theme }) => theme.shadow};
`;

const TelemetryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-family: var(--font-mono), monospace;
  font-size: 0.72rem;
  color: ${({ theme }) => theme.mutedText};
  margin-bottom: 0.85rem;
`;

const ArticleTitle = styled.h1`
  font-family: var(--font-display), 'Space Grotesk', sans-serif;
  font-size: clamp(1.9rem, 3.6vw, 2.75rem);
  font-weight: 700;
  color: ${({ theme }) => theme.headingText};
  line-height: 1.18;
  margin-bottom: 1rem;
`;

const TagsAndLikeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;

  span {
    font-family: var(--font-mono), monospace;
    font-size: 0.7rem;
    padding: 0.2rem 0.55rem;
    border-radius: 5px;
    background: ${({ theme }) => theme.toggleBg};
    border: 1px solid ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.text};
  }
`;

const LikeBtn = styled.button<{ liked?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.9rem;
  border-radius: 999px;
  font-family: var(--font-mono), monospace;
  font-size: 0.76rem;
  font-weight: 600;
  border: 1px solid
    ${({ liked, theme }) => (liked ? theme.primary : theme.border)};
  background: ${({ liked, theme }) =>
    liked ? `${theme.primary}22` : theme.toggleBg};
  color: ${({ theme }) => theme.headingText};
  cursor: pointer;
  transition: all 0.16s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const CoverImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  margin-bottom: 2rem;
`;

const ContentBody = styled.div`
  background: ${({ theme }) => `${theme.cardBg}b3`};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 2.2rem;
  line-height: 1.78;
  font-size: 1rem;

  h1,
  h2,
  h3 {
    margin: 1.75rem 0 0.85rem;
    color: ${({ theme }) => theme.headingText};
  }

  p {
    margin-bottom: 1.1rem;
    color: ${({ theme }) => theme.text};
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
  }

  blockquote {
    border-left: 3px solid ${({ theme }) => theme.primary};
    padding-left: 1rem;
    margin: 1.25rem 0;
    color: ${({ theme }) => theme.mutedText};
  }

  @media (max-width: 640px) {
    padding: 1.35rem;
  }
`;

interface Props {
  post: BlogPost;
  comments: Comment[];
}

export default function BlogPostClientPage({ post, comments }: Props) {
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [liked, setLiked] = useState(false);
  const [likeHint, setLikeHint] = useState<string | null>(null);

  const stats = useMemo(() => {
    const plain = (post.content || '').replace(/<[^>]+>/g, '');
    const words = plain.trim().split(/\s+/).filter(Boolean).length;
    const readMins = Math.max(1, Math.ceil(words / 200));
    return { words, readMins };
  }, [post.content]);

  const handleLike = async () => {
    setLikeHint(null);
    try {
      const updated = await api.likePost(post.id);
      setLikesCount(updated.likes_count);
      setLiked((v) => !v);
    } catch (err: any) {
      setLikeHint(err?.message || 'Sign in to endorse this article');
    }
  };

  return (
    <>
      <Navbar />
      <ArticleOuter>
        <TopNavRow>
          <BackLink href="/blog">← Back to Documentation Index</BackLink>
          <BackLink href="/dashboard/write">Edit / New Post ✎</BackLink>
        </TopNavRow>

        <HeaderCard>
          <TelemetryRow>
            <span>
              AUTHOR: @{post.author?.username || 'sahil'} •{' '}
              {post.createdAt
                ? format(new Date(post.createdAt), 'yyyy.MM.dd')
                : 'LOG'}
            </span>
            <span>
              {stats.words} WORDS • {stats.readMins} MIN READ
            </span>
          </TelemetryRow>

          <ArticleTitle>{post.title}</ArticleTitle>

          {post.excerpt && (
            <p
              style={{
                color: 'var(--obs-ink-muted)',
                fontSize: '0.98rem',
                lineHeight: 1.6,
                marginBottom: '0.5rem',
              }}
            >
              {post.excerpt}
            </p>
          )}

          <TagsAndLikeRow>
            <TagList>
              {(post.tags && post.tags.length > 0
                ? post.tags
                : ['systems']
              ).map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </TagList>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {likeHint && (
                <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                  {likeHint}
                </span>
              )}
              <LikeBtn type="button" liked={liked} onClick={handleLike}>
                <span>♥</span>
                <span>{likesCount} Endorsements</span>
              </LikeBtn>
            </div>
          </TagsAndLikeRow>
        </HeaderCard>

        {post.cover_image_url && (
          <CoverImage src={post.cover_image_url} alt={post.title} />
        )}

        <ContentBody>
          <MarkdownRenderer content={post.content} />
        </ContentBody>

        <CommentsSection initialComments={comments} postId={post.id} />
      </ArticleOuter>
    </>
  );
}
