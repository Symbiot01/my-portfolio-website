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
  notes?: string | null;
  day_index?: number | null;
  all_day?: boolean | null;
  place_id?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface ItineraryItemUpdate {
  title?: string | null;
  item_type?: string | null;
  start_time?: string | null; // ISO datetime
  end_time?: string | null; // ISO datetime
  location?: string | null;
  notes?: string | null;
  day_index?: number | null;
  all_day?: boolean | null;
  place_id?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface ItineraryItemRead extends ItineraryItemCreate {
  id: string;
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
  /**
   * Optional timestamp from backend (ISO datetime).
   * Not all backends include this yet; UI will fallback safely.
   */
  created_at?: string;
}

export interface SettlementCreate {
  payer_member_id: string;
  payee_member_id: string;
  amount: number;
  mode?: 'cash' | 'upi' | 'card';
}

export interface SettlementUpdate {
  payer_member_id?: string | null;
  payee_member_id?: string | null;
  amount?: number | null;
  mode?: 'cash' | 'upi' | 'card' | null;
}

export interface SettlementRead {
  id: string;
  payer_member_id: string;
  payee_member_id: string;
  amount: number;
  mode: 'cash' | 'upi' | 'card';
  created_at?: string; // ISO datetime
}

export interface BalanceEntry {
  member_id: string;
  balance: number;
}

export interface LinkExpiryUpdate {
  link_expires_at?: string | null; // ISO datetime
}

export interface TripLinkInfo {
  secret_access_url: string;
  link_revoked: boolean;
  link_expires_at?: string | null; // ISO datetime
  access_token_version: number;
}

// --- TripDoc + AI edit types ---
export type JsonPatchOp =
  | { op: 'add' | 'replace' | 'test'; path: string; value: unknown }
  | { op: 'remove'; path: string }
  | { op: 'move' | 'copy'; from: string; path: string }
  | { op: 'add' | 'replace'; path: string; value: unknown };

export interface TripDocDateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

export interface TripDoc {
  schema_version: number;
  timezone: string;
  title: string;
  date_range?: TripDocDateRange | null;
  members: unknown[]; // travel segments (v2); render later
  lodgings: unknown[]; // hotels (v2); render later
  natural_language_trip_brief: string;
  shared_notes: string;
  revision: number;
  updated_at: string; // ISO datetime
}

export interface TripDocPatchRequest {
  client_revision: number;
  patch: JsonPatchOp[];
}

export interface TripDocPatchResponse {
  revision: number;
  updated_at: string;
}

export type ItineraryOp =
  | { op: 'create'; temp_id: string; item: ItineraryItemCreate }
  | { op: 'update'; id: string; patch: Partial<ItineraryItemUpdate> }
  | { op: 'delete'; id: string };

export interface AiProposeEditsRequest {
  user_request: string;
  edit_doc: boolean;
  edit_itinerary: boolean;
}

export interface AiProposeEditsResponse {
  trip_doc_patch: JsonPatchOp[];
  itinerary_ops: ItineraryOp[];
  nonce: string;
  nonce_expires_at: string; // ISO datetime
}

export interface AiApplyEditsRequest {
  client_revision: number;
  nonce: string;
  trip_doc_patch: JsonPatchOp[];
  itinerary_ops: ItineraryOp[];
}

export interface AiApplyEditsResponse {
  new_revision: number;
  updated_at: string;
  created_item_ids?: string[];
  updated_item_ids?: string[];
  deleted_item_ids?: string[];
}