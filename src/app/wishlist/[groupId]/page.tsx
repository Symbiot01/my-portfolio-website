'use client';

import { Suspense } from 'react';
import WishlistGroupPage from './WishlistGroupClient';
import { WishlistAppShell } from '@/components/wishlist/WishlistAppShell';
import { wl } from '@/styles/wishlistTheme';

function Fallback() {
  return (
    <WishlistAppShell>
      <p style={{ fontFamily: wl.font.family, color: wl.inkMuted }}>Loading registry…</p>
    </WishlistAppShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Fallback />}>
      <WishlistGroupPage />
    </Suspense>
  );
}
