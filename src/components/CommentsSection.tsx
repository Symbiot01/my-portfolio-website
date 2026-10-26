// File: src/components/CommentsSection.tsx
// Description: Observatory-styled threaded discussion & comment stream for blog articles.
'use client';

import React, { useState } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Comment } from '@/types';
import { format } from 'date-fns';

const Section = styled.section`
  margin-top: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    font-family: var(--font-display), 'Space Grotesk', sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: ${({ theme }) => theme.headingText};
    margin: 0;
  }

  span {
    font-family: var(--font-mono), monospace;
    font-size: 0.72rem;
    color: ${({ theme }) => theme.mutedText};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1rem;

  textarea {
    width: 100%;
    padding: 0.7rem 0.85rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.toggleBg};
    color: ${({ theme }) => theme.text};
    font-family: var(--font-sans), sans-serif;
    font-size: 0.9rem;
    resize: vertical;
    outline: none;

    &:focus {
      border-color: ${({ theme }) => theme.primary};
    }
  }
`;

const SubmitBtn = styled.button`
  align-self: flex-end;
  padding: 0.52rem 1.05rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.gradient};
  color: #ffffff;
  font-family: var(--font-mono), monospace;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SignInPrompt = styled.div`
  padding: 1rem 1.25rem;
  border-radius: 10px;
  border: 1px dashed ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.toggleBg};
  font-size: 0.88rem;
  color: ${({ theme }) => theme.mutedText};

  a {
    color: ${({ theme }) => theme.accent};
    font-weight: 600;
    text-decoration: underline;
  }
`;

const CommentCard = styled.div`
  padding: 1rem 1.15rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const CommentMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono), monospace;
  font-size: 0.72rem;
  color: ${({ theme }) => theme.mutedText};

  strong {
    color: ${({ theme }) => theme.headingText};
  }
`;

export default function CommentsSection({
  initialComments,
  postId,
}: {
  initialComments: Comment[];
  postId: string;
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const postedComment = await api.postComment(postId, newComment.trim());
      setComments([postedComment, ...comments]);
      setNewComment('');
    } catch (error: any) {
      setErrorMsg(error?.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section>
      <Header>
        <h3>Discussion Stream</h3>
        <span>{comments.length} ENTRIES</span>
      </Header>

      {user ? (
        <Form onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a technical note, question, or observation..."
            rows={3}
            required
          />
          {errorMsg && (
            <div style={{ color: '#f87171', fontSize: '0.82rem' }}>{errorMsg}</div>
          )}
          <SubmitBtn type="submit" disabled={submitting}>
            {submitting ? 'Transmitting...' : 'Post Comment →'}
          </SubmitBtn>
        </Form>
      ) : (
        <SignInPrompt>
          Please <Link href="/login">sign in</Link> to contribute to the discussion stream.
        </SignInPrompt>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {comments.map((comment) => (
          <CommentCard key={comment.id}>
            <CommentMeta>
              <strong>@{comment.author?.username || 'engineer'}</strong>
              <span>
                {comment.createdAt
                  ? format(new Date(comment.createdAt), 'yyyy.MM.dd HH:mm')
                  : ''}
              </span>
            </CommentMeta>
            <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.55 }}>
              {comment.content}
            </p>
          </CommentCard>
        ))}
      </div>
    </Section>
  );
}
