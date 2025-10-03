// src/types/index.ts
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'author';
  avatar?: string;
  bio?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: { id: string; username: string; };
  likes_count: number;
  cover_image_url?: string;
  excerpt?: string;
  tags?: string[];
  createdAt: string;
}
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User; // The author object contains the full user details
}
// Add other types for Project, Skill, etc. later