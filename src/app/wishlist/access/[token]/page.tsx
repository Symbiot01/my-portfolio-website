'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import Link from 'next/link';
import { api } from '@/lib/api';
import { setStoredWishlistAccess } from '@/lib/wishlistGuest';
import { WishlistGroup } from '@/types';
import { wl } from '@/styles/wishlistTheme';
import { WishlistAppShell } from '@/components/wishlist/WishlistAppShell';
import { WlPrimaryButton } from '@/components/wishlist/WlButtons';

const Card = styled.div`
  background: ${wl.surface};
  border: 1px solid ${wl.border};
  border-radius: ${wl.radiusLg}px;
  padding: ${wl.space(4)};
  box-shadow: ${wl.shadow};
  max-width: 480px;
  margin: ${wl.space(4)} auto;
  text-align: center;
`;

const Eyebrow = styled.p`
  margin: 0 0 ${wl.space(1)};
  font: ${wl.font.label};
  color: ${wl.primary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const Title = styled.h1`
  margin: 0 0 ${wl.space(1)};
  font: ${wl.font.headline};
  color: ${wl.primaryDeep};
`;

const Body = styled.p`
  margin: 0 0 ${wl.space(3)};
  font: ${wl.font.body};
  color: ${wl.inkMuted};
`;

const Members = styled.p`
  margin: 0 0 ${wl.space(3)};
  font: ${wl.font.bodySm};
  color: ${wl.ink};
`;

export default function WishlistAccessPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token ?? '';
  const [group, setGroup] = useState<WishlistGroup | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or revoked share link');
      return;
    }
    (async () => {
      try {
        const g = await api.previewWishlistByAccess(token);
        setGroup(g);
        setStoredWishlistAccess(g.id, token);
      } catch {
        setError('Invalid or revoked share link');
      }
    })();
  }, [token]);

  const openGroup = () => {
    if (!group || !token) return;
    router.push(`/wishlist/${group.id}?access_token=${encodeURIComponent(token)}`);
  };

  return (
    <WishlistAppShell hideChrome>
      <Card>
        <Eyebrow>You&apos;re invited</Eyebrow>
        {error && <Body style={{ color: wl.danger }}>{error}</Body>}
        {group && (
          <>
            <Title>{group.name}</Title>
            <Body>{group.description || 'Browse lists, add ideas, and reserve gifts.'}</Body>
            <Members>
              {group.members.map((m) => m.display_name).join(' · ') || 'No members yet'}
            </Members>
            <WlPrimaryButton type="button" onClick={openGroup}>
              Open combined view
            </WlPrimaryButton>
          </>
        )}
        {!group && !error && <Body>Loading invite…</Body>}
        <Body style={{ marginTop: wl.space(3), marginBottom: 0 }}>
          <Link href="/wishlist" style={{ color: wl.primary, fontWeight: 600 }}>
            Wishlist home
          </Link>
        </Body>
      </Card>
    </WishlistAppShell>
  );
}
