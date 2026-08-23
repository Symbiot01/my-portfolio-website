'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import styled from '@emotion/styled';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  getStoredWishlistAccess,
  getWishlistGuestId,
  setStoredWishlistAccess,
  setWishlistGuestId,
} from '@/lib/wishlistGuest';
import { WishlistGroup, WishlistProduct, WishlistProductCreate } from '@/types';
import { wl } from '@/styles/wishlistTheme';
import { WishlistAppShell } from '@/components/wishlist/WishlistAppShell';
import {
  MemberAvatar,
  WishlistProductCard,
} from '@/components/wishlist/WishlistProductCard';
import { AddProductModal } from '@/components/wishlist/AddProductModal';
import { GroupSettingsPanel } from '@/components/wishlist/GroupSettingsPanel';
import { WlPrimaryButton } from '@/components/wishlist/WlButtons';

const Header = styled.header`
  margin-bottom: ${wl.space(3)};
  text-align: center;

  @media (min-width: 768px) {
    text-align: left;
  }
`;

const Title = styled.h1`
  margin: 0 0 ${wl.space(1)};
  font: ${wl.font.headline};
  font-size: clamp(1.6rem, 3.5vw, 2.25rem);
  color: ${wl.primaryDeep};
  letter-spacing: -0.03em;
`;

const Sub = styled.p`
  margin: 0;
  font: ${wl.font.body};
  color: ${wl.inkMuted};
`;

const Section = styled.section`
  margin-bottom: ${wl.space(4)};
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  gap: ${wl.space(1.5)};
  margin-bottom: ${wl.space(2)};
`;

const SectionTitle = styled.h2`
  margin: 0;
  font: ${wl.font.headlineSm};
  color: ${wl.ink};
`;

const ProductStack = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${wl.space(2.5)};

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1040px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ErrorText = styled.p`
  color: ${wl.danger};
  font: ${wl.font.bodySm};
`;

const Fab = styled.button`
  position: fixed;
  right: ${wl.space(2)};
  bottom: calc(72px + ${wl.space(2)});
  z-index: 35;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: ${wl.primaryDeep};
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${wl.shadowHover};
  cursor: pointer;

  @media (min-width: 901px) {
    bottom: ${wl.space(3)};
    right: ${wl.space(3)};
  }

  &:hover {
    background: ${wl.primary};
  }
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${wl.space(2)};
  margin-bottom: ${wl.space(3)};
  flex-wrap: wrap;
`;

export default function WishlistGroupPage() {
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const groupId = params?.groupId || '';
  const tab = searchParams?.get('tab') ?? null;
  const showSettings = tab === 'settings';
  const showMineOnly = tab === 'mine';

  const [group, setGroup] = useState<WishlistGroup | null>(null);
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WishlistProduct | null>(null);
  const [targetMemberId, setTargetMemberId] = useState('');
  const [reserveName, setReserveName] = useState('');

  const opts = useMemo(
    () => ({
      wishlistAccessToken: accessToken || undefined,
      wishlistGuestId: guestId || undefined,
    }),
    [accessToken, guestId]
  );

  const refresh = useCallback(async () => {
    if (!groupId) return;
    setError(null);
    try {
      const g = await api.getWishlistGroup(groupId, opts);
      setGroup(g);
      if (!targetMemberId && g.members[0]) setTargetMemberId(g.members[0].member_id);
      setProducts(await api.listWishlistProducts(groupId, opts));
      if (user) {
        try {
          const link = await api.getWishlistLink(groupId);
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          setShareUrl(`${origin}/wishlist/access/${link.access_token}`);
          setAccessToken(String(link.access_token));
          setStoredWishlistAccess(groupId, String(link.access_token));
        } catch {
          /* not linked */
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load group');
    }
  }, [groupId, opts, targetMemberId, user]);

  useEffect(() => {
    if (!groupId) return;
    const fromQuery = searchParams?.get('access_token');
    const stored = getStoredWishlistAccess(groupId);
    const token = fromQuery || stored;
    if (token) {
      setAccessToken(token);
      setStoredWishlistAccess(groupId, token);
    }
    setGuestId(getWishlistGuestId(groupId));
  }, [groupId, searchParams]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, accessToken, user]);

  const myMember = useMemo(() => group?.members.find((m) => m.is_you) || null, [group]);
  const isLeader = !!myMember?.is_leader;
  const isLinked = !!myMember;
  const myMemberId = myMember?.member_id || null;

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products;
    if (showMineOnly && myMemberId) {
      list = list.filter((p) => p.owner_member_id === myMemberId);
    }
    if (!q) return list;
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        p.options.some((o) => o.title.toLowerCase().includes(q))
    );
  }, [products, query, showMineOnly, myMemberId]);

  const productsByOwner = useMemo(() => {
    const map = new Map<string, WishlistProduct[]>();
    for (const p of filteredProducts) {
      const arr = map.get(p.owner_member_id) || [];
      arr.push(p);
      map.set(p.owner_member_id, arr);
    }
    return map;
  }, [filteredProducts]);

  const visibleMembers = useMemo(() => {
    if (!group) return [];
    if (showMineOnly && myMemberId) {
      return group.members.filter((m) => m.member_id === myMemberId);
    }
    return group.members;
  }, [group, showMineOnly, myMemberId]);

  const onAddProduct = async (payload: WishlistProductCreate & { owner_member_id: string }) => {
    const { owner_member_id, ...body } = payload;
    await api.addWishlistProduct(groupId, owner_member_id, body, opts);
    setTargetMemberId(owner_member_id);
    await refresh();
  };

  const onUpdateProduct = async (productId: string, payload: WishlistProductCreate) => {
    await api.updateWishlistProduct(groupId, productId, payload, opts);
    await refresh();
  };

  const canEditProduct = (p: WishlistProduct) => {
    if (p.status !== 'open') return false;
    if (isLeader) return true;
    if (user?.id && p.created_by_actor_key === `user:${user.id}`) return true;
    if (guestId && p.created_by_actor_key === `guest:${guestId}`) return true;
    return false;
  };

  const onReserve = async (productId: string) => {
    const name = reserveName.trim() || user?.username || '';
    if (!name) {
      setError('Enter a name to reserve as (Settings → Reserve as)');
      return;
    }
    setBusy(true);
    try {
      const res = await api.reserveWishlistProduct(groupId, productId, name, opts);
      if (res.guest_id) {
        setWishlistGuestId(groupId, res.guest_id);
        setGuestId(res.guest_id);
      }
      await refresh();
    } catch (e) {
      const status = (e as { status?: number })?.status;
      setError(status === 409 ? 'Already reserved or cap reached' : 'Failed to reserve');
    } finally {
      setBusy(false);
    }
  };

  const onUnreserve = async (reservationId: string) => {
    setBusy(true);
    try {
      await api.releaseWishlistReservation(groupId, reservationId, opts);
      await refresh();
    } catch {
      setError('Could not unreserve (must be the same guest/user)');
    } finally {
      setBusy(false);
    }
  };

  const onPurchase = async (reservationId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setBusy(true);
    try {
      await api.purchaseWishlistReservation(groupId, reservationId, opts);
      await refresh();
    } catch {
      setError('Mark bought failed — login as the reserver');
    } finally {
      setBusy(false);
    }
  };

  if (!group && !error) {
    return (
      <WishlistAppShell groupId={groupId}>
        <Sub>Loading registry…</Sub>
      </WishlistAppShell>
    );
  }

  return (
    <WishlistAppShell groupId={groupId} searchValue={query} onSearchChange={setQuery}>
      {!showSettings && (
        <Header>
          <Title>{group?.name || 'Wishlist'}</Title>
          <Sub>{group?.description || 'House warming registry'}</Sub>
        </Header>
      )}

      {error && <ErrorText>{error}</ErrorText>}

      {showSettings && group ? (
        <GroupSettingsPanel
          group={group}
          shareUrl={shareUrl}
          isLeader={isLeader}
          isLinked={isLinked}
          reserveName={reserveName}
          onReserveNameChange={setReserveName}
          onRefresh={refresh}
          onGroupUpdated={setGroup}
          onDeleted={() => router.push('/wishlist')}
          onLeft={() => router.push('/wishlist')}
          onError={setError}
        />
      ) : (
        <>
          <Toolbar>
            <Sub style={{ margin: 0 }}>
              {showMineOnly ? 'Your personal list' : 'Combined registry'}
            </Sub>
            <WlPrimaryButton
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setAddOpen(true);
              }}
              style={{ width: 'auto', minWidth: 140 }}
            >
              <Plus size={16} /> Add Product
            </WlPrimaryButton>
          </Toolbar>

          {visibleMembers.map((m, idx) => {
            const list = productsByOwner.get(m.member_id) || [];
            if (query && list.length === 0) return null;
            return (
              <Section key={m.member_id}>
                <SectionHead>
                  <MemberAvatar name={m.display_name} tone={idx} />
                  <SectionTitle>{m.display_name}&apos;s List</SectionTitle>
                </SectionHead>
                {list.length === 0 ? (
                  <Sub>No products yet.</Sub>
                ) : (
                  <ProductStack>
                    {list.map((p) => (
                      <WishlistProductCard
                        key={p.id}
                        product={p}
                        busy={busy}
                        canEdit={canEditProduct(p)}
                        canUnreserve={!!p.reservation?.reservation_id}
                        onEdit={() => {
                          setEditingProduct(p);
                          setAddOpen(true);
                        }}
                        onReserve={() => onReserve(p.id)}
                        onUnreserve={
                          p.reservation?.reservation_id
                            ? () => onUnreserve(p.reservation!.reservation_id!)
                            : undefined
                        }
                        onPurchase={
                          p.reservation?.reservation_id
                            ? () => onPurchase(p.reservation!.reservation_id!)
                            : undefined
                        }
                      />
                    ))}
                  </ProductStack>
                )}
              </Section>
            );
          })}

          <Fab
            type="button"
            aria-label="Add product"
            onClick={() => {
              setEditingProduct(null);
              setAddOpen(true);
            }}
          >
            <Plus size={24} />
          </Fab>
        </>
      )}

      {group && (
        <AddProductModal
          open={addOpen}
          onClose={() => {
            setAddOpen(false);
            setEditingProduct(null);
          }}
          groupId={groupId}
          members={group.members}
          defaultMemberId={targetMemberId || myMemberId || undefined}
          wishlistAccessToken={accessToken || undefined}
          wishlistGuestId={guestId || undefined}
          editing={editingProduct}
          onSubmit={onAddProduct}
          onUpdate={onUpdateProduct}
        />
      )}
    </WishlistAppShell>
  );
}
