import { ReactNode } from 'react';

/**
 * Wishlist route group — visually independent from portfolio chrome.
 * Pages opt into WishlistAppShell themselves (client search state).
 */
export default function WishlistLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
