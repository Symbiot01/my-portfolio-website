'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditorComponent from '@/components/EditorComponent';
import { api } from '@/lib/api';

export default function WritePostPage() {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSavePost = async (data: { title: string; content: string }) => {
    setIsSaving(true);
    try {
      const newPost = await api.createPost(data);
      alert('Post submitted for review!');
      router.push(`/blog/${newPost.slug}`); // Navigate to the new post
    } catch (error) {
      alert('Failed to save post.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2>Write a New Post</h2>
      <EditorComponent onSave={handleSavePost} isSaving={isSaving} />
    </div>
  );
}