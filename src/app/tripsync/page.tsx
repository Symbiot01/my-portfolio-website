'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { api } from '@/lib/api';
import { TripRead } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/sections/home/Navbar';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 6.25rem 1.5rem 3rem;
`;

const HeroHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Title = styled.h1`
  font-size: clamp(1.85rem, 3.5vw, 2.5rem);
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.02em;
  background: ${({ theme }) => theme.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.95rem;
`;

const ActionBarGrid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 0.85rem;
  margin-bottom: 1.5rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const QuickBox = styled.form`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 0.95rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  box-shadow: 0 2px 10px ${({ theme }) => theme.shadow};
`;

const BoxLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.mutedText};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Row = styled.div`
  display: flex;
  gap: 0.55rem;
  align-items: center;

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 0.62rem 0.85rem;
  border-radius: 9px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'ghost' }>`
  padding: 0.62rem 1.05rem;
  border-radius: 9px;
  border: 1px solid
    ${({ variant, theme }) =>
      variant === 'ghost' || variant === 'secondary' ? theme.border : 'transparent'};
  background: ${({ variant, theme }) =>
    variant === 'ghost'
      ? 'transparent'
      : variant === 'secondary'
      ? theme.cardBg
      : theme.primary};
  color: ${({ variant, theme }) =>
    variant === 'ghost' || variant === 'secondary' ? theme.text : '#fff'};
  font-size: 0.86rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  width: 280px;
  max-width: 100%;
  padding: 0.5rem 0.8rem;
  border-radius: 9px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  font-size: 0.86rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const TripsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 1rem;
`;

const TripCard = styled(motion.div)<{ featured?: boolean }>`
  background: ${({ theme }) => theme.cardBg};
  border: 1.5px solid
    ${({ featured, theme }) => (featured ? `${theme.primary}88` : theme.border)};
  border-radius: 16px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px ${({ theme }) => theme.shadow};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.9rem;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px ${({ theme }) => theme.shadow};
    border-color: ${({ theme }) => theme.primary};
  }
`;

const TripHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.65rem;
`;

const TripName = styled.h2`
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.text};
  line-height: 1.3;
`;

const Badge = styled.span<{ tone?: 'primary' | 'success' | 'neutral' }>`
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
  background: ${({ tone, theme }) =>
    tone === 'primary'
      ? `${theme.primary}22`
      : tone === 'success'
      ? '#10B98122'
      : `${theme.mutedText}20`};
  color: ${({ tone, theme }) =>
    tone === 'primary'
      ? theme.primary
      : tone === 'success'
      ? '#10B981'
      : theme.mutedText};
`;

const MemberAvatars = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
`;

const MemberPill = styled.span`
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const QuickJumpRow = styled.div`
  display: flex;
  gap: 0.4rem;
  padding-top: 0.65rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  flex-wrap: wrap;
`;

const QuickJumpBtn = styled.button`
  padding: 0.3rem 0.6rem;
  border-radius: 7px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
  }
`;

const StatusBanner = styled.div<{ tone: 'error' | 'info' }>`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-size: 0.86rem;
  font-weight: 600;
  background: ${({ tone }) => (tone === 'error' ? '#EF444418' : '#6366F115')};
  color: ${({ tone, theme }) => (tone === 'error' ? '#EF4444' : theme.text)};
  border: 1px solid ${({ tone }) => (tone === 'error' ? '#EF444455' : '#6366F144')};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export default function TripSyncPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<'authenticated' | 'guest'>('authenticated');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Instant create trip state
  const [newTripName, setNewTripName] = useState('');
  const [creating, setCreating] = useState(false);

  // Open shared link/token state
  const [sharedInput, setSharedInput] = useState('');

  // Filter
  const [search, setSearch] = useState('');

  useEffect(() => {
    void loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      if (!api.hasSession()) {
        setAuthStatus('guest');
        setTrips([]);
        return;
      }
      const data = await api.getMyTrips();
      setAuthStatus('authenticated');
      setTrips(data);
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err?.status === 401) {
        setAuthStatus('guest');
        setTrips([]);
      } else {
        setErrorMsg(
          err instanceof Error ? err.message : 'Could not reach TripSync server.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripName.trim()) return;

    if (authStatus === 'guest') {
      router.push('/login?next=/tripsync');
      return;
    }

    setCreating(true);
    setErrorMsg(null);
    try {
      const newTrip = await api.createTrip({ name: newTripName.trim() });
      setTrips([newTrip, ...trips]);
      setNewTripName('');
      router.push(`/tripsync/${newTrip.id}`);
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : 'Failed to create trip.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleOpenShared = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = sharedInput.trim();
    if (!raw) return;

    try {
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        const u = new URL(raw);
        const token = u.searchParams.get('t');
        if (token) {
          router.push(`/tripsync/access?t=${encodeURIComponent(token)}`);
          return;
        }
      }
    } catch {
      // fall through
    }

    if (raw.includes('t=')) {
      const tokenPart = raw.split('t=')[1]?.split('&')[0];
      if (tokenPart) {
        router.push(`/tripsync/access?t=${encodeURIComponent(tokenPart)}`);
        return;
      }
    }

    router.push(`/tripsync/access?t=${encodeURIComponent(raw)}`);
  };

  const filteredTrips = useMemo(() => {
    if (!search.trim()) return trips;
    const q = search.toLowerCase();
    return trips.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.members.some((m) => m.display_name.toLowerCase().includes(q))
    );
  }, [trips, search]);

  return (
    <PageWrapper>
      <Navbar />
      <Container>
        <HeroHeader>
          <TitleBlock>
            <Title>TripSync Workspace</Title>
            <Subtitle>
              Fast group expense splitting, smart debt settlement, live itinerary & AI
              trip planning in fewest clicks.
            </Subtitle>
          </TitleBlock>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/tripsync/demo')}
            >
              ⚡ Try Interactive Demo Trip
            </Button>
            {authStatus === 'guest' && (
              <Button
                type="button"
                variant="primary"
                onClick={() => router.push('/login?next=/tripsync')}
              >
                Sign In / Register
              </Button>
            )}
          </div>
        </HeroHeader>

        {errorMsg && (
          <StatusBanner tone="error">
            <span>{errorMsg}</span>
            <Button type="button" variant="ghost" onClick={() => void loadTrips()}>
              Retry
            </Button>
          </StatusBanner>
        )}

        {/* 1-Click Create & Open Shared Link Bar */}
        <ActionBarGrid>
          <QuickBox onSubmit={handleCreateTrip}>
            <BoxLabel>
              <span>➕ Start a New Trip (1-Click)</span>
              <span>{authStatus === 'guest' ? 'Requires Sign In' : 'Instant setup'}</span>
            </BoxLabel>
            <Row>
              <Input
                type="text"
                placeholder="e.g. Goa Beach Getaway, Manali Trek 2026…"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                required
              />
              <Button type="submit" disabled={creating || !newTripName.trim()}>
                {creating
                  ? 'Creating…'
                  : authStatus === 'guest'
                  ? 'Sign In to Create'
                  : 'Create Trip →'}
              </Button>
            </Row>
          </QuickBox>

          <QuickBox onSubmit={handleOpenShared}>
            <BoxLabel>
              <span>🔗 Open Shared Trip Link or Token</span>
              <span>No login required</span>
            </BoxLabel>
            <Row>
              <Input
                type="text"
                placeholder="Paste share link or access token…"
                value={sharedInput}
                onChange={(e) => setSharedInput(e.target.value)}
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={!sharedInput.trim()}
              >
                Open Link →
              </Button>
            </Row>
          </QuickBox>
        </ActionBarGrid>

        <ToolbarRow>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <strong style={{ fontSize: '1.05rem' }}>
              Your Trips ({filteredTrips.length})
            </strong>
          </div>
          {trips.length > 0 && (
            <SearchInput
              placeholder="🔍 Search trips or travelers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
        </ToolbarRow>

        {loading ? (
          <div style={{ padding: '2rem 0', opacity: 0.7 }}>Loading trips…</div>
        ) : (
          <TripsGrid>
            {/* Interactive Live Demo Card always accessible in 1 click */}
            <TripCard
              featured
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => router.push('/tripsync/demo')}
            >
              <div>
                <TripHeaderRow>
                  <TripName>🌴 Goa Beach Getaway (Interactive Demo)</TripName>
                  <Badge tone="primary">Live Sandbox</Badge>
                </TripHeaderRow>
                <p
                  style={{
                    fontSize: '0.84rem',
                    margin: '0.45rem 0 0.75rem',
                    opacity: 0.8,
                    lineHeight: 1.45,
                  }}
                >
                  Explore the full expense tracker, category analytics, 1-click debt
                  settlement, itinerary timeline, and lodging planner with sample data.
                </p>
                <MemberAvatars>
                  {['Aarav', 'Priya', 'Rohan', 'Meera'].map((name) => (
                    <MemberPill key={name}>👤 {name}</MemberPill>
                  ))}
                </MemberAvatars>
              </div>

              <QuickJumpRow onClick={(e) => e.stopPropagation()}>
                <QuickJumpBtn
                  type="button"
                  onClick={() => router.push('/tripsync/demo?tab=overview')}
                >
                  📊 Overview
                </QuickJumpBtn>
                <QuickJumpBtn
                  type="button"
                  onClick={() => router.push('/tripsync/demo?tab=expenses')}
                >
                  💸 Expenses
                </QuickJumpBtn>
                <QuickJumpBtn
                  type="button"
                  onClick={() => router.push('/tripsync/demo?tab=settlements')}
                >
                  🤝 Settle Up
                </QuickJumpBtn>
                <QuickJumpBtn
                  type="button"
                  onClick={() => router.push('/tripsync/demo?tab=itinerary')}
                >
                  🗓️ Itinerary
                </QuickJumpBtn>
              </QuickJumpRow>
            </TripCard>

            <AnimatePresence>
              {filteredTrips.map((trip, index) => (
                <TripCard
                  key={trip.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  onClick={() => router.push(`/tripsync/${trip.id}`)}
                >
                  <div>
                    <TripHeaderRow>
                      <TripName>{trip.name}</TripName>
                      <Badge tone="success">
                        {trip.members.length} Traveler
                        {trip.members.length === 1 ? '' : 's'}
                      </Badge>
                    </TripHeaderRow>

                    <div
                      style={{
                        fontSize: '0.78rem',
                        opacity: 0.7,
                        margin: '0.35rem 0 0.75rem',
                      }}
                    >
                      {trip.members.filter((m) => m.linked).length} linked •{' '}
                      {trip.members.filter((m) => !m.linked).length} guest slots
                    </div>

                    <MemberAvatars>
                      {trip.members.slice(0, 6).map((m) => (
                        <MemberPill key={m.member_id}>
                          {m.linked ? '✓' : '👤'} {m.display_name}
                        </MemberPill>
                      ))}
                      {trip.members.length > 6 && (
                        <MemberPill>+{trip.members.length - 6} more</MemberPill>
                      )}
                    </MemberAvatars>
                  </div>

                  <QuickJumpRow onClick={(e) => e.stopPropagation()}>
                    <QuickJumpBtn
                      type="button"
                      onClick={() =>
                        router.push(`/tripsync/${trip.id}?tab=overview`)
                      }
                    >
                      📊 Overview
                    </QuickJumpBtn>
                    <QuickJumpBtn
                      type="button"
                      onClick={() =>
                        router.push(`/tripsync/${trip.id}?tab=expenses`)
                      }
                    >
                      💸 Expenses
                    </QuickJumpBtn>
                    <QuickJumpBtn
                      type="button"
                      onClick={() =>
                        router.push(`/tripsync/${trip.id}?tab=settlements`)
                      }
                    >
                      🤝 Settle Up
                    </QuickJumpBtn>
                    <QuickJumpBtn
                      type="button"
                      onClick={() =>
                        router.push(`/tripsync/${trip.id}?tab=itinerary`)
                      }
                    >
                      🗓️ Itinerary
                    </QuickJumpBtn>
                  </QuickJumpRow>
                </TripCard>
              ))}
            </AnimatePresence>
          </TripsGrid>
        )}
      </Container>
    </PageWrapper>
  );
}
