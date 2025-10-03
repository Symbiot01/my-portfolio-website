// src/components/BlogPostClientPage.tsx
'use client'; // This marks the component as a Client Component

import styled from '@emotion/styled';
import Navbar from '@/sections/home/Navbar';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import CommentsSection from '@/components/CommentsSection';
import { BlogPost, Comment } from '@/types'; // Import your types

// Move your styled component here
const PostContainer = styled.article`
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
  
  // Basic styles for rendered markdown
  h1, h2, h3 { margin: 1.5rem 0 1rem; }
  p { line-height: 1.7; }
  pre { border-radius: 8px; }
`;

interface Props {
  post: BlogPost;
  comments: Comment[];
}

export default function BlogPostClientPage({ post, comments }: Props) {
  return (
    <>
      <Navbar />
      <PostContainer>
        <header>
          <h1>{post.title}</h1>
          <p>By {post.author.username}</p>
        </header>
        
        <MarkdownRenderer content={post.content} />
        
        <hr style={{ margin: '3rem 0' }} />
        
        <CommentsSection initialComments={comments} postId={post.id} />
      </PostContainer>
    </>
  );
}