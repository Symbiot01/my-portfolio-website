// src/lib/api.ts
import { parseCookies, setCookie, destroyCookie } from 'nookies';
import { User, BlogPost, Comment } from '@/types'; 

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_TOKEN_KEY = 'auth_token';


// Helper to get auth headers
// Add the return type Record<string, string>
const getAuthHeaders = (): Record<string, string> => {
// --- END OF FIX ---
  const cookies = parseCookies();
  const token = cookies[AUTH_TOKEN_KEY];
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

// We'll add functions for login, getMe, etc. here later.

export const api = {
  // --- Authentication ---
  login: async (email: string, pass: string): Promise<{ access_token: string }> => {
    const res = await fetch(`${API_URL}/api/auth/jwt/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password: pass }),
    });

    if (!res.ok) {
      throw new Error('Authentication failed');
    }
    const data = await res.json();
    
    // Set the token in a cookie
    setCookie(null, AUTH_TOKEN_KEY, data.access_token, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
    
    return data;
  },

  logout: () => {
    destroyCookie(null, AUTH_TOKEN_KEY);
  },

  getMe: async (): Promise<User> => {
    const cookies = parseCookies();
    const token = cookies[AUTH_TOKEN_KEY];
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/api/auth/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      destroyCookie(null, AUTH_TOKEN_KEY); // Clean up invalid token
      throw new Error('Failed to fetch user');
    }
    return res.json();
  },


  getBlogPosts: async (skip = 0, limit = 10): Promise<BlogPost[]> => {
    const res = await fetch(`${API_URL}/api/blog/posts?skip=${skip}&limit=${limit}`, {
      next: { revalidate: 60 } // Revalidate cache every 60 seconds
    });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },

  getPostBySlug: async (slug: string): Promise<BlogPost> => {
    const res = await fetch(`${API_URL}/api/blog/posts/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error('Failed to fetch post');
    return res.json();
  },

  // --- NEW COMMENT FUNCTIONS ---
  getComments: async (postId: string): Promise<Comment[]> => {
    const res = await fetch(`${API_URL}/api/blog/posts/${postId}/comments`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  },

  postComment: async (postId: string, content: string): Promise<Comment> => {
    const res = await fetch(`${API_URL}/api/blog/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to post comment');
    return res.json();
  },

  createPost: async (postData: { title: string; content: string; excerpt?: string, tags?: string[], cover_image_url?: string }): Promise<BlogPost> => {
    const res = await fetch(`${API_URL}/api/blog/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },

  getMyPosts: async (): Promise<BlogPost[]> => {
    const res = await fetch(`${API_URL}/api/blog/posts/me`, {
      headers: getAuthHeaders(),
      cache: 'no-store', // Don't cache user-specific data
    });
    if (!res.ok) throw new Error('Failed to fetch user posts');
    return res.json();
  },
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/api/uploads/image`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(), // Your existing function to get the auth token
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Image upload failed');
    }
    return res.json();
  },
  // We will add getProjects, getSkills, etc. here in the future.
};