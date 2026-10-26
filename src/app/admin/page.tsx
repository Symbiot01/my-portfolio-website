// File: src/app/admin/page.tsx
// Description: Deep Space Observatory Admin Merge Queue styled like a GitHub PR review queue.
'use client';

import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/sections/home/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { BlogPost } from '@/types';
import PostReviewModal from '@/components/admin/PostReviewModal';

const Container = styled.main`
  max-width: 1120px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
`;

const Header = styled.div`
  background: ${({ theme }) => `${theme.cardBg}d9`};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 1.85rem 2rem;
  margin-bottom: 1.75rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const Eyebrow = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.72rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  letter-spacing: 0.08em;
`;

const Title = styled.h1`
  font-family: var(--font-display), 'Space Grotesk', sans-serif;
  font-size: 1.85rem;
  margin: 0.25rem 0;
  color: ${({ theme }) => theme.headingText};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.mutedText};
  margin: 0;
  font-size: 0.92rem;
`;

const CountPill = styled.div`
  font-family: var(--font-mono), monospace;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: ${({ theme }) => `${theme.primary}22`};
  border: 1px solid ${({ theme }) => `${theme.primary}55`};
  color: ${({ theme }) => theme.headingText};
`;

const QueueCard = styled(motion.div)`
  background: ${({ theme }) => `${theme.cardBg}d9`};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  transition: border-color 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const PostInfo = styled.div`
  flex: 1;
  min-width: 240px;
`;

const PrBadge = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.16rem 0.5rem;
  border-radius: 5px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #f59e0b;
  margin-right: 0.6rem;
`;

const PostTitle = styled.h3`
  margin: 0.35rem 0;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.headingText};
`;

const PostMeta = styled.p`
  margin: 0;
  font-family: var(--font-mono), monospace;
  font-size: 0.76rem;
  color: ${({ theme }) => theme.mutedText};
`;

const ReviewButton = styled.button`
  background: ${({ theme }) => theme.gradient};
  color: white;
  border: none;
  padding: 0.55rem 1.15rem;
  border-radius: 8px;
  font-family: var(--font-mono), monospace;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.92;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 14px;
  border: 1px dashed ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.mutedText};
`;

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingPosts();
      setPosts(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch pending posts'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      void fetchPendingPosts();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  return (
    <>
      <Navbar />
      <Container>
        {authLoading ? (
          <EmptyState>Verifying administrator credentials...</EmptyState>
        ) : !user || user.role !== 'admin' ? (
          <EmptyState>
            <h2 style={{ marginBottom: '0.5rem' }}>CLEARANCE_REQUIRED // 403</h2>
            <p>Administrator role is required to access the Editorial Merge Queue.</p>
          </EmptyState>
        ) : (
          <>
            <Header>
              <div>
                <Eyebrow>EDITORIAL_PIPELINE // PR_MERGE_QUEUE</Eyebrow>
                <Title>Admin Specification Review Queue</Title>
                <Subtitle>
                  Inspect, approve, or return pending community and author submissions.
                </Subtitle>
              </div>
              <CountPill>{posts.length} PENDING</CountPill>
            </Header>

            {error && (
              <div style={{ color: '#f87171', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {loading ? (
              <EmptyState>Scanning merge queue...</EmptyState>
            ) : posts.length === 0 ? (
              <EmptyState>
                <h3 style={{ marginBottom: '0.4rem' }}>Merge Queue Clean</h3>
                <p>Zero pending specifications awaiting review.</p>
              </EmptyState>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                {posts.map((post) => (
                  <QueueCard
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <PostInfo>
                      <div>
                        <PrBadge>PENDING_REVIEW</PrBadge>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono), monospace',
                            fontSize: '0.72rem',
                            opacity: 0.7,
                          }}
                        >
                          #{String(post.id).slice(-6)}
                        </span>
                      </div>
                      <PostTitle>{post.title}</PostTitle>
                      <PostMeta>
                        AUTHOR: @{post.author.username} • SUBMITTED:{' '}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </PostMeta>
                    </PostInfo>
                    <ReviewButton onClick={() => setSelectedPost(post)}>
                      Inspect Diff & Merge →
                    </ReviewButton>
                  </QueueCard>
                ))}
              </div>
            )}

            <AnimatePresence>
              {selectedPost && (
                <PostReviewModal
                  post={selectedPost}
                  onClose={() => setSelectedPost(null)}
                  onReviewed={() => {
                    setSelectedPost(null);
                    fetchPendingPosts();
                  }}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </Container>
    </>
  );
}
