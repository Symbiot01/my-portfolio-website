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

// --- TripSync Types ---
export interface TripMemberInfo {
  member_id: string;
  display_name: string;
  linked: boolean;
}

export interface TripRead {
  id: string; // PydanticObjectId
  name: string;
  description?: string | null;
  members: TripMemberInfo[];
  secret_access_url?: string | null;
}

export interface TripCreate {
  name: string;
  description?: string | null;
}

export interface TripMemberCreate {
  display_name: string;
}

export interface LinkSelfRequest {
  member_id?: string | null;
}

export interface ItineraryItemCreate {
  title: string;
  item_type: string;
  start_time: string; // ISO datetime
  end_time?: string | null; // ISO datetime
  location?: string | null;
}

export interface ItineraryItemUpdate {
  title?: string | null;
  item_type?: string | null;
  start_time?: string | null; // ISO datetime
  end_time?: string | null; // ISO datetime
  location?: string | null;
  notes?: string | null;
}

export interface ExpenseCreate {
  description: string;
  amount: number;
  paid_by_member_id: string;
  split_with_member_ids: string[];
}

export interface ExpenseUpdate {
  description?: string | null;
  amount?: number | null;
  paid_by_member_id?: string | null;
  split_with_member_ids?: string[] | null;
}

export interface ExpenseRead extends ExpenseUpdate {
  id: string;
}

export interface SettlementCreate {
  payer_member_id: string;
  payee_member_id: string;
  amount: number;
}

export interface SettlementUpdate {
  payer_member_id?: string | null;
  payee_member_id?: string | null;
  amount?: number | null;
}

export interface BalanceEntry {
  member_id: string;
  balance: number;
}

export interface LinkExpiryUpdate {
  link_expires_at?: string | null; // ISO datetime
}