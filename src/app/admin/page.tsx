'use client';

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { BlogPost } from '@/types';
import PostReviewModal from '@/components/admin/PostReviewModal';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 4rem 1rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.text};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.mutedText};
  margin: 0;
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const PostInfo = styled.div`
  flex: 1;
`;

const PostTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text};
`;

const PostMeta = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.mutedText};
`;

const ReviewButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
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
      setError(err instanceof Error ? err.message : 'Failed to fetch pending posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      void fetchPendingPosts();
    }
  }, [user, authLoading]);

  if (authLoading) return <Container>Loading...</Container>;
  
  if (!user || user.role !== 'admin') {
    return (
      <Container>
        <EmptyState>
          <h2>Access Denied</h2>
          <p>You must be an administrator to view this page.</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Admin Dashboard</Title>
        <Subtitle>Review and manage pending blog posts</Subtitle>
      </Header>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
      )}

      {loading ? (
        <div>Loading pending posts...</div>
      ) : posts.length === 0 ? (
        <EmptyState>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
          <h3>All caught up!</h3>
          <p>There are no posts waiting for review.</p>
        </EmptyState>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map((post) => (
            <Card
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PostInfo>
                <PostTitle>{post.title}</PostTitle>
                <PostMeta>
                  By <strong>{post.author.username}</strong> • Submitted{' '}
                  {new Date(post.createdAt).toLocaleDateString()}
                </PostMeta>
              </PostInfo>
              <ReviewButton onClick={() => setSelectedPost(post)}>
                Review Post
              </ReviewButton>
            </Card>
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
    </Container>
  );
}