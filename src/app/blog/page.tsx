// src/app/blog/page.tsx
'use client'; 

import Link from 'next/link';
import styled from '@emotion/styled';
import { api } from '@/lib/api';
import Navbar from '@/sections/home/Navbar';
import { format } from 'date-fns';

const BlogContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 6rem 2rem 4rem;
  color: ${({ theme }) => theme.text};
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const PostCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.25rem;
  transition: border-color 0.2s ease, transform 0.2s ease;
  &:hover {
    border-color: ${({ theme }) => theme.primary};
    transform: translateY(-2px);
  }
`;

// Note: Because this is now a Client Component, we can't fetch data directly.
// We must use useEffect to fetch data when the component mounts.
import { useEffect, useState } from 'react';
import { BlogPost } from '@/types';

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await api.getBlogPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <BlogContainer>
          <p>Loading posts...</p>
        </BlogContainer>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <BlogContainer>
        <Header>
          <h1>Digital Journal</h1>
          <p>Thoughts on AI, Robotics, and Code.</p>
        </Header>
        <div>
          {posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <PostCard>
                <h2>{post.title}</h2>
                <p style={{ color: 'inherit', opacity: 0.72, fontSize: '0.9rem' }}>
                  {format(new Date(post.createdAt), 'MMMM d, yyyy')} by {post.author.username}
                </p>
                <p>{post.excerpt}</p>
              </PostCard>
            </Link>
          ))}
        </div>
      </BlogContainer>
    </>
  );
}