/** Per-group guest id storage for Wishlist share-link flows. */

const key = (groupId: string) => `wishlist_guest:${groupId}`;
const accessKey = (groupId: string) => `wishlist_access:${groupId}`;

export function getWishlistGuestId(groupId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key(groupId));
}

export function setWishlistGuestId(groupId: string, guestId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key(groupId), guestId);
}

/** Create and persist a guest id if this browser has none for the group yet. */
export function ensureWishlistGuestId(groupId: string): string {
  const existing = getWishlistGuestId(groupId);
  if (existing) return existing;
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
  setWishlistGuestId(groupId, id);
  return id;
}

export function getStoredWishlistAccess(groupId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(accessKey(groupId));
}

export function setStoredWishlistAccess(groupId: string, token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(accessKey(groupId), token);
}
