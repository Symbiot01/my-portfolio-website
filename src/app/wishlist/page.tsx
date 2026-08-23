'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { WishlistGroup } from '@/types';
import { wl } from '@/styles/wishlistTheme';
import { WishlistAppShell } from '@/components/wishlist/WishlistAppShell';
import { WlPrimaryButton } from '@/components/wishlist/WlButtons';

const Hero = styled.header`
  margin-bottom: ${wl.space(4)};
`;

const Title = styled.h1`
  margin: 0 0 ${wl.space(1)};
  font: ${wl.font.headline};
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  color: ${wl.primaryDeep};
  letter-spacing: -0.03em;
`;

const Subtitle = styled.p`
  margin: 0;
  font: ${wl.font.body};
  color: ${wl.inkMuted};
  max-width: 36rem;
`;

const Panel = styled(motion.section)`
  background: ${wl.surface};
  border: 1px solid ${wl.border};
  border-radius: ${wl.radiusLg}px;
  padding: ${wl.space(3)};
  margin-bottom: ${wl.space(3)};
  box-shadow: ${wl.shadow};
`;

const PanelTitle = styled.h2`
  margin: 0 0 ${wl.space(2)};
  font: ${wl.font.headlineSm};
  color: ${wl.ink};
`;

const Form = styled.form`
  display: grid;
  gap: ${wl.space(2)};
`;

const Label = styled.label`
  display: grid;
  gap: ${wl.space(1)};
  font: ${wl.font.label};
  color: ${wl.ink};
`;

const Input = styled.input`
  font: ${wl.font.body};
  padding: ${wl.space(1.5)} ${wl.space(2)};
  border-radius: ${wl.radiusSm}px;
  border: 1px solid ${wl.borderStrong};
  background: ${wl.canvas};
  color: ${wl.ink};

  &:focus {
    outline: 2px solid ${wl.primary};
    outline-offset: 1px;
  }
`;

const TextArea = styled.textarea`
  font: ${wl.font.body};
  padding: ${wl.space(1.5)} ${wl.space(2)};
  border-radius: ${wl.radiusSm}px;
  border: 1px solid ${wl.borderStrong};
  background: ${wl.canvas};
  color: ${wl.ink};
  min-height: 72px;
  resize: vertical;
`;

const CheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: ${wl.space(1)};
  font: ${wl.font.bodySm};
  color: ${wl.inkMuted};
  cursor: pointer;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: ${wl.space(2)};
`;

const GroupCard = styled(motion.div)`
  background: ${wl.surface};
  border: 1px solid ${wl.border};
  border-radius: ${wl.radiusMd}px;
  padding: ${wl.space(2.5)};
  box-shadow: ${wl.shadow};
  a {
    text-decoration: none;
    color: inherit;
  }
  h3 {
    margin: 0 0 ${wl.space(1)};
    font: ${wl.font.headlineSm};
    font-size: 1.1rem;
    color: ${wl.primaryDeep};
  }
  p {
    margin: 0;
    font: ${wl.font.bodySm};
    color: ${wl.inkMuted};
  }
`;

const ErrorText = styled.p`
  color: ${wl.danger};
  font: ${wl.font.bodySm};
`;

const GuestHint = styled.div`
  font: ${wl.font.body};
  color: ${wl.inkMuted};
  a {
    color: ${wl.primary};
    font-weight: 600;
  }
`;

export default function WishlistHomePage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<WishlistGroup[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [spoiler, setSpoiler] = useState(false);
  const [cap, setCap] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (!user) return;
    try {
      setGroups(await api.getMyWishlistGroups());
    } catch {
      setError('Could not load wishlists. Is the API running on :8000?');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const created = await api.createWishlistGroup({
        name,
        description: description || null,
        owners_can_see_fulfillment: spoiler,
        max_active_reservations: cap,
      });
      setName('');
      setDescription('');
      setGroups((prev) => [created, ...prev]);
    } catch {
      setError('Failed to create group');
    } finally {
      setBusy(false);
    }
  };

  const filtered = groups.filter((g) =>
    !search.trim()
      ? true
      : g.name.toLowerCase().includes(search.toLowerCase()) ||
        (g.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <WishlistAppShell searchValue={search} onSearchChange={setSearch}>
      <Hero>
        <Title>Wishlist</Title>
        <Subtitle>
          Celebrate together. Personal lists in one shared group — friends reserve gifts without
          spoiling the surprise.
        </Subtitle>
      </Hero>

      {!user ? (
        <Panel>
          <GuestHint>
            <Link href="/login">Sign in or register</Link> to create a registry, or open a share
            link you were sent.
          </GuestHint>
        </Panel>
      ) : (
        <Panel initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <PanelTitle>Create a group</PanelTitle>
          <Form onSubmit={onCreate}>
            <Label>
              Name
              <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
            </Label>
            <Label>
              Description
              <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
            </Label>
            <CheckRow>
              <input
                type="checkbox"
                checked={spoiler}
                onChange={(e) => setSpoiler(e.target.checked)}
              />
              Owners can see reserved / bought (spoilers on)
            </CheckRow>
            <Label style={{ maxWidth: 160 }}>
              Max reservations
              <Input
                type="number"
                min={1}
                max={5}
                value={cap}
                onChange={(e) => setCap(Number(e.target.value))}
              />
            </Label>
            <WlPrimaryButton type="submit" disabled={busy || !name.trim()} style={{ maxWidth: 220 }}>
              {busy ? 'Creating…' : 'Create wishlist'}
            </WlPrimaryButton>
          </Form>
        </Panel>
      )}

      {error && <ErrorText>{error}</ErrorText>}

      {user && (
        <>
          <PanelTitle style={{ marginBottom: wl.space(2) }}>Your groups</PanelTitle>
          {filtered.length === 0 ? (
            <GuestHint>No groups yet — create one above.</GuestHint>
          ) : (
            <Grid>
              {filtered.map((g) => (
                <GroupCard key={g.id} whileHover={{ y: -3 }}>
                  <Link href={`/wishlist/${g.id}`}>
                    <h3>{g.name}</h3>
                    <p>
                      {g.members.length} member{g.members.length === 1 ? '' : 's'}
                      {g.description ? ` · ${g.description}` : ''}
                    </p>
                  </Link>
                </GroupCard>
              ))}
            </Grid>
          )}
        </>
      )}
    </WishlistAppShell>
  );
}
