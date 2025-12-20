'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import Navbar from '@/sections/home/Navbar';
import { api } from '@/lib/api';
import { BalanceEntry, ItineraryItemCreate, TripRead } from '@/types';
import MembersSection from '@/components/tripsync/MembersSection';
import ExpensesSection from '@/components/tripsync/ExpensesSection';
import { MockExpense } from '@/lib/mockData';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
`;

const ContentWrapper = styled.div`
  display: flex;
  min-height: calc(100vh - 70px);

  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.aside`
  width: 280px;
  background: ${({ theme }) => theme.cardBg};
  border-right: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 70px;
  bottom: 0;
  z-index: 30;
  overflow-y: auto;

  @media (max-width: 968px) {
    position: relative;
    width: 100%;
    top: 0;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
`;

const SidebarContent = styled.div`
  padding: 2rem 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 0.9rem 1rem;
  }
`;

const TripInfo = styled.div`
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid ${({ theme }) => theme.border};

  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom-width: 1px;
  }
`;

const TripTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const TripTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.titleGradient};
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  margin-top: 0;

  @media (max-width: 768px) {
    margin-bottom: 0;
    font-size: 1.25rem;
  }
`;

const TripDescription = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.mutedText};
  line-height: 1.5;
  margin-bottom: 0.75rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const TripMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.mutedText};
  padding: 0.5rem 0.75rem;
  background: ${({ theme }) => theme.background};
  border-radius: 6px;
  margin-top: 0.75rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavSection = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  /* On phones we move section navigation into a hamburger menu */
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavButton = styled.button<{ active: boolean }>`
  padding: 1rem 1.25rem;
  border-radius: 10px;
  border: none;
  background: ${({ active, theme }) => (active ? theme.primary : 'transparent')};
  color: ${({ active, theme }) => (active ? '#fff' : theme.text)};
  font-size: 0.95rem;
  font-weight: ${({ active }) => (active ? 700 : 500)};
  text-align: left;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: ${({ active }) => (active ? '60%' : '0')};
    background: ${({ theme }) => theme.accent};
    border-radius: 0 4px 4px 0;
    transition: height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    background: ${({ active, theme }) => (active ? theme.primary : theme.toggleBg)};
    transform: translateX(4px);

    &::before {
      height: 60%;
    }
  }

  &:active {
    transform: translateX(2px) scale(0.98);
  }
`;

const TripMenuButton = styled.button`
  display: none;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  padding: 0.45rem 0.55rem;
  border-radius: 9px;
  cursor: pointer;
  line-height: 1;
  font-size: 1.05rem;
  min-width: 40px;
  min-height: 40px;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.primary};
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

const MobileOverlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 90;
  display: ${({ open }) => (open ? 'block' : 'none')};
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 70px; /* navbar height */
  right: 12px;
  left: 12px;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  z-index: 91;
  padding: 0.5rem;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileMenuItem = styled.button<{ active: boolean }>`
  width: 100%;
  text-align: left;
  padding: 0.85rem 0.8rem;
  border-radius: 10px;
  border: 1px solid transparent;
  background: ${({ active, theme }) => (active ? theme.primary : 'transparent')};
  color: ${({ active, theme }) => (active ? '#fff' : theme.text)};
  font-weight: ${({ active }) => (active ? 800 : 650)};
  letter-spacing: 0.02em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    border-color: ${({ active, theme }) => (active ? 'transparent' : theme.border)};
    background: ${({ active, theme }) => (active ? theme.primary : theme.toggleBg)};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.primary};
    outline-offset: 2px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;

  @media (max-width: 968px) {
    margin-left: 0;
  }
`;

const MainPanel = styled.main`
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PanelHeader = styled.div`
  margin-bottom: 1.25rem;
`;

const PanelTitle = styled.h1`
  font-size: 2rem;
  font-weight: 900;
  color: ${({ theme }) => theme.text};
  text-transform: capitalize;
  position: relative;
  padding-bottom: 0.5rem;
  margin-top: 0;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 60px;
    height: 3px;
    background: ${({ theme }) => theme.primary};
    border-radius: 0;
  }
`;

const Notice = styled.div`
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  border-radius: 8px;
  color: ${({ theme }) => theme.mutedText};
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const SESSION_LAST_TOKEN_KEY = 'tripsync:last_access_token';
const SESSION_TRIP_TOKEN_PREFIX = 'tripsync:access_token:';

const isValidUuid = (value: string): boolean => {
  // Accepts v1-v5 UUIDs (lower/upper)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
};

const parseAccessTokenFromHash = (hash: string): string | null => {
  const raw = (hash || '').replace(/^#/, '').trim();
  if (!raw) return null;

  // Support either "#<uuid>" or "#access_token=<uuid>"
  if (raw.includes('=') || raw.includes('&')) {
    const params = new URLSearchParams(raw);
    const tok = params.get('access_token') ?? params.get('token');
    return tok ? tok.trim() : null;
  }

  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw;
  }
};

export default function TripSyncAccessPage() {
  const [trip, setTrip] = useState<TripRead | null>(null);
  const [activeSection, setActiveSection] = useState<
    'members' | 'itinerary' | 'expenses'
  >('members');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryItemCreate[]>([]);
  const [expenses, setExpenses] = useState<MockExpense[]>([]);
  const [balances, setBalances] = useState<BalanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripAccessToken, setTripAccessToken] = useState<string | null>(null);

  const sections = useMemo(() => (['members', 'itinerary', 'expenses'] as const), []);

  const tripSyncOpts = useMemo(
    () => (tripAccessToken ? { tripAccessToken } : undefined),
    [tripAccessToken]
  );

  // Close menu on Escape and lock scroll while open (mobile).
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const fromHash = parseAccessTokenFromHash(window.location.hash);
        const fromSession = sessionStorage.getItem(SESSION_LAST_TOKEN_KEY);
        const tokenCandidate = (fromHash || fromSession || '').trim();

        if (!tokenCandidate || !isValidUuid(tokenCandidate)) {
          throw new Error('Invalid or missing access token.');
        }

        // Strip fragment ASAP to reduce accidental leakage (clipboard/referrer/screen recordings)
        if (window.location.hash) {
          window.history.replaceState(
            null,
            document.title,
            window.location.pathname + window.location.search
          );
        }

        setTripAccessToken(tokenCandidate);
        sessionStorage.setItem(SESSION_LAST_TOKEN_KEY, tokenCandidate);

        const preview = await api.previewTripByAccess(tokenCandidate);
        const tripId = preview.id;

        sessionStorage.setItem(`${SESSION_TRIP_TOKEN_PREFIX}${tripId}`, tokenCandidate);

        // Load full data via standard endpoints + X-Trip-Access
        const t = await api.getTrip(tripId, { tripAccessToken: tokenCandidate });
        setTrip(t);

        const items = await api.listItinerary(tripId, { tripAccessToken: tokenCandidate });
        setItinerary(items);

        const expensesList = await api.listExpenses(tripId, { tripAccessToken: tokenCandidate });
        const mappedExpenses: MockExpense[] = expensesList.map((exp) => {
          const expAny = exp as unknown as { created_at?: string; date?: string; category?: string };
          return {
            ...exp,
            date: expAny.date || expAny.created_at || new Date().toISOString(),
            category: expAny.category || 'Other',
          };
        });
        setExpenses(mappedExpenses);

        const b = await api.getBalances(tripId, { tripAccessToken: tokenCandidate });
        setBalances(b);
      } catch (e) {
        console.error(e);
        const message = e instanceof Error ? e.message : 'Failed to load trip.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const handleTripUpdate = (updatedTrip: TripRead) => {
    setTrip(updatedTrip);
  };

  const handleExpensesUpdate = async () => {
    if (!trip?.id || !tripAccessToken) return;
    try {
      const expensesList = await api.listExpenses(trip.id, tripSyncOpts);
      const mappedExpenses: MockExpense[] = expensesList.map((exp) => {
        const expAny = exp as unknown as { created_at?: string; date?: string; category?: string };
        return {
          ...exp,
          date: expAny.date || expAny.created_at || new Date().toISOString(),
          category: expAny.category || 'Other',
        };
      });
      setExpenses(mappedExpenses);
      const b = await api.getBalances(trip.id, tripSyncOpts);
      setBalances(b);
    } catch (e) {
      console.error('Failed to refresh expenses:', e);
    }
  };

  return (
    <PageWrapper>
      <Navbar />
      <ContentWrapper>
        <Sidebar>
          <SidebarContent>
            <TripInfo>
              <TripTitleRow>
                <TripTitle>{trip?.name || 'Trip'}</TripTitle>
                <TripMenuButton
                  type="button"
                  aria-label={mobileMenuOpen ? 'Close trip menu' : 'Open trip menu'}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="trip-mobile-menu"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                >
                  {mobileMenuOpen ? '✕' : '☰'}
                </TripMenuButton>
              </TripTitleRow>
              {trip?.description && <TripDescription>{trip.description}</TripDescription>}
              <TripMeta>
                <span>👥</span>
                <span>
                  {trip?.members.length || 0} member{trip?.members.length !== 1 ? 's' : ''}
                </span>
              </TripMeta>
            </TripInfo>

            <NavSection>
              {sections.map((section) => (
                <NavButton
                  key={section}
                  active={activeSection === section}
                  onClick={() => setActiveSection(section)}
                >
                  {section}
                </NavButton>
              ))}
            </NavSection>
          </SidebarContent>
        </Sidebar>

        <MobileOverlay open={mobileMenuOpen} aria-hidden={!mobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
        {mobileMenuOpen && (
          <MobileMenu id="trip-mobile-menu" role="dialog" aria-modal="true" aria-label="Trip sections">
            {sections.map((section) => (
              <MobileMenuItem
                key={section}
                type="button"
                active={activeSection === section}
                onClick={() => {
                  setActiveSection(section);
                  setMobileMenuOpen(false);
                }}
              >
                {section}
              </MobileMenuItem>
            ))}
          </MobileMenu>
        )}

        <MainContent>
          <MainPanel>
            <PanelHeader>
              <PanelTitle>{activeSection}</PanelTitle>
            </PanelHeader>

            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <Notice>{error}</Notice>
            ) : (
              <>
                <Notice>
                  You’re viewing this trip via a share link. Anyone with this link can edit this
                  trip.
                </Notice>

                {activeSection === 'members' && trip && (
                  <MembersSection
                    tripId={trip.id}
                    members={trip.members}
                    onUpdate={handleTripUpdate}
                    tripAccessToken={tripAccessToken ?? undefined}
                  />
                )}

                {activeSection === 'itinerary' && (
                  <div>
                    <ul>
                      {itinerary.map((i, idx) => (
                        <li key={idx}>
                          <strong>{i.title}</strong> — {i.item_type} —{' '}
                          {new Date(i.start_time).toLocaleString()}
                          {i.end_time ? ` → ${new Date(i.end_time).toLocaleString()}` : ''}
                          {i.location ? ` @ ${i.location}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeSection === 'expenses' && trip && (
                  <ExpensesSection
                    tripId={trip.id}
                    members={trip.members}
                    expenses={expenses}
                    balances={balances}
                    onUpdate={handleExpensesUpdate}
                    tripAccessToken={tripAccessToken ?? undefined}
                  />
                )}
              </>
            )}
          </MainPanel>
        </MainContent>
      </ContentWrapper>
    </PageWrapper>
  );
}


