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

export function getStoredWishlistAccess(groupId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(accessKey(groupId));
}

export function setStoredWishlistAccess(groupId: string, token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(accessKey(groupId), token);
}
