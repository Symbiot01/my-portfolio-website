// File: src/app/dashboard/write/page.tsx
// Description: Editorial Studio page with Navbar, author submission queue status, and full Tiptap workstation.
'use client';

import React, { useState } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/sections/home/Navbar';
import EditorComponent, { EditorSavePayload } from '@/components/EditorComponent';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const StudioContainer = styled.main`
  max-width: 1120px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem;
`;

const HeaderBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  span.eyebrow {
    font-family: var(--font-mono), monospace;
    font-size: 0.72rem;
    font-weight: 600;
    color: ${({ theme }) => theme.accent};
    letter-spacing: 0.08em;
  }

  h1 {
    font-family: var(--font-display), 'Space Grotesk', sans-serif;
    font-size: 1.85rem;
    font-weight: 700;
    color: ${({ theme }) => theme.headingText};
  }
`;

const StatusBanner = styled.div<{ tone: 'success' | 'error' }>`
  padding: 0.9rem 1.2rem;
  border-radius: 10px;
  margin-bottom: 1.25rem;
  font-size: 0.88rem;
  border: 1px solid
    ${({ tone }) => (tone === 'success' ? '#10b98166' : '#f8717166')};
  background: ${({ tone }) =>
    tone === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(248, 113, 113, 0.12)'};
  color: ${({ theme }) => theme.headingText};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

export default function WritePostPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [banner, setBanner] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleSavePost = async (data: EditorSavePayload) => {
    setIsSaving(true);
    setBanner(null);
    try {
      const newPost = await api.createPost(data);
      setBanner({
        tone: 'success',
        text:
          newPost.status === 'published'
            ? 'Article published! Redirecting...'
            : 'Specification submitted to the Admin Merge Queue for review.',
      });
      setTimeout(() => {
        if (newPost.status === 'published' && newPost.slug) {
          router.push(`/blog/${newPost.slug}`);
        } else {
          router.push('/blog');
        }
      }, 1200);
    } catch (error: any) {
      setBanner({
        tone: 'error',
        text:
          error?.message ||
          'Failed to save post. Ensure you are signed in to your author account.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <StudioContainer>
        <HeaderBar>
          <TitleBlock>
            <span className="eyebrow">EDITORIAL_WORKSTATION // DOC_STUDIO</span>
            <h1>Write Engineering Specification</h1>
          </TitleBlock>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: '0.76rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--obs-border)',
                }}
              >
                Admin Merge Queue ↗
              </Link>
            )}
            <Link
              href="/blog"
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '0.76rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--obs-border)',
              }}
            >
              ← Documentation Index
            </Link>
          </div>
        </HeaderBar>

        {banner && (
          <StatusBanner tone={banner.tone}>
            <span>{banner.text}</span>
          </StatusBanner>
        )}

        <EditorComponent onSave={handleSavePost} isSaving={isSaving} />
      </StudioContainer>
    </>
  );
}
