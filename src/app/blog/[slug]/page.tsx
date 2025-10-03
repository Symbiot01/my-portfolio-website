// src/app/blog/[slug]/page.tsx
import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import BlogPostClientPage from '@/components/BlogPostClientPage';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // --- THIS IS THE FIX ---
  // Await the params promise before using its properties
  const awaitedParams = await params;
  // --- END OF FIX ---

  try {
    // Use the awaited value to fetch the post
    const post = await api.getPostBySlug(awaitedParams.slug);
    const comments = await api.getComments(post.id);

    return <BlogPostClientPage post={post} comments={comments} />;
  } catch (error) {
    // This will catch the error if the API returns a 404
    notFound();
  }
}