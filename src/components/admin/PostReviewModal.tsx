// File: src/components/admin/PostReviewModal.tsx
// Description: Observatory PR-style inspection modal for approving, rejecting, or returning pending blog posts.
'use client';

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { BlogPost } from '@/types';
import { api } from '@/lib/api';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
`;

const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
`;

const ModalHeader = styled.div`
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const Title = styled.h2`
  margin: 0 0 0.35rem 0;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.headingText};
`;

const Meta = styled.div`
  font-family: var(--font-mono), monospace;
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.76rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.mutedText};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  line-height: 1;

  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const ModalBody = styled.div`
  padding: 1.75rem;
  overflow-y: auto;
  flex: 1;
`;

const Prose = styled.div`
  color: ${({ theme }) => theme.text};
  line-height: 1.75;

  img {
    max-width: 100%;
    border-radius: 8px;
  }
`;

const ModalFooter = styled.div`
  padding: 1rem 1.75rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const ActionButton = styled.button<{ variant: 'approve' | 'reject' | 'draft' }>`
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-family: var(--font-mono), monospace;
  font-size: 0.78rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;

  background: ${({ variant }) =>
    variant === 'approve'
      ? '#10b981'
      : variant === 'reject'
      ? '#ef4444'
      : '#64748b'};
  color: white;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface Props {
  post: BlogPost;
  onClose: () => void;
  onReviewed: () => void;
}

export default function PostReviewModal({ post, onClose, onReviewed }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStatusChange = async (
    status: 'published' | 'rejected' | 'draft'
  ) => {
    try {
      setSubmitting(true);
      setErrorMsg(null);
      await api.updatePostStatus(post.id, status);
      onReviewed();
    } catch (error: any) {
      setErrorMsg(
        error?.message || 'Failed to update post status. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <ModalContent
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
      >
        <ModalHeader>
          <div>
            <Title>{post.title}</Title>
            <Meta>
              AUTHOR: @{post.author.username} • SUBMITTED:{' '}
              {new Date(post.createdAt).toLocaleDateString()}
            </Meta>
          </div>
          <CloseButton onClick={onClose} aria-label="Close review modal">
            &times;
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {post.cover_image_url && (
            <img
              src={post.cover_image_url}
              alt={post.title}
              style={{
                width: '100%',
                maxHeight: '280px',
                objectFit: 'cover',
                borderRadius: '10px',
                marginBottom: '1.5rem',
              }}
            />
          )}

          <Prose dangerouslySetInnerHTML={{ __html: post.content }} />
        </ModalBody>

        <ModalFooter>
          <div>
            {errorMsg && (
              <span style={{ color: '#f87171', fontSize: '0.82rem' }}>
                ⚠ {errorMsg}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <ActionButton
              type="button"
              variant="draft"
              onClick={() => handleStatusChange('draft')}
              disabled={submitting}
            >
              Return to Draft
            </ActionButton>
            <ActionButton
              type="button"
              variant="reject"
              onClick={() => handleStatusChange('rejected')}
              disabled={submitting}
            >
              Reject
            </ActionButton>
            <ActionButton
              type="button"
              variant="approve"
              onClick={() => handleStatusChange('published')}
              disabled={submitting}
            >
              ✓ Merge & Publish
            </ActionButton>
          </div>
        </ModalFooter>
      </ModalContent>
    </Overlay>
  );
}
