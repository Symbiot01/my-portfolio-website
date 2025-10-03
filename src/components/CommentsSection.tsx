// src/components/CommentsSection.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Comment } from '@/types';
import { format } from 'date-fns';

export default function CommentsSection({ initialComments, postId }: { initialComments: Comment[], postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const postedComment = await api.postComment(postId, newComment);
      // Add the new comment to the top of the list for instant UI update
      setComments([postedComment, ...comments]);
      setNewComment('');
    } catch (error) {
      alert('Failed to post comment.');
    }
  };

  return (
    <section>
      <h3>Comments</h3>
      {user ? (
        <form onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={4}
            required
          />
          <button type="submit">Post Comment</button>
        </form>
      ) : (
        <p>Please <a href="/login">log in</a> to post a comment.</p>
      )}
      <div>
        {comments.map((comment) => (
          <div key={comment.id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
            <p>{comment.content}</p>
            <small>
              <strong>{comment.author.username}</strong> on {format(new Date(comment.createdAt), 'PPpp')}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}