'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { BlogPost } from '@/types';
import { api } from '@/lib/api';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.background};
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TitleInfo = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.text};
`;

const Meta = styled.div`
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.9rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.mutedText};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  
  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
`;

const Prose = styled.div`
  color: ${({ theme }) => theme.text};
  line-height: 1.8;
  
  img {
    max-width: 100%;
    border-radius: 8px;
  }
`;

const ModalFooter = styled.div`
  padding: 1.5rem 2rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const ActionButton = styled.button<{ variant: 'approve' | 'reject' | 'draft' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
  
  background: ${({ variant }) => 
    variant === 'approve' ? '#27AE60' : 
    variant === 'reject' ? '#E74C3C' : 
    '#95A5A6'};
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

  const handleStatusChange = async (status: 'published' | 'rejected' | 'draft') => {
    try {
      setSubmitting(true);
      await api.updatePostStatus(post.id, status);
      onReviewed();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update post status. Please try again.');
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
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
      >
        <ModalHeader>
          <TitleInfo>
            <Title>{post.title}</Title>
            <Meta>
              By <strong>{post.author.username}</strong> • Submitted{' '}
              {new Date(post.createdAt).toLocaleDateString()}
            </Meta>
          </TitleInfo>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalBody>
          {post.cover_image_url && (
            <img 
              src={post.cover_image_url} 
              alt={post.title} 
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px', marginBottom: '2rem' }}
            />
          )}
          
          <Prose dangerouslySetInnerHTML={{ __html: post.content }} />
        </ModalBody>

        <ModalFooter>
          <ActionButton 
            variant="draft" 
            onClick={() => handleStatusChange('draft')}
            disabled={submitting}
          >
            Send to Draft
          </ActionButton>
          <ActionButton 
            variant="reject" 
            onClick={() => handleStatusChange('rejected')}
            disabled={submitting}
          >
            Reject
          </ActionButton>
          <ActionButton 
            variant="approve" 
            onClick={() => handleStatusChange('published')}
            disabled={submitting}
          >
            Approve & Publish
          </ActionButton>
        </ModalFooter>
      </ModalContent>
    </Overlay>
  );
}