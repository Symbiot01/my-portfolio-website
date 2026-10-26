'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import styled from '@emotion/styled';
import { api } from '@/lib/api';
import {
  TripRead,
  ExpenseRead,
  BalanceEntry,
  ItineraryItemRead,
  SettlementRead,
  TripDoc,
  TripLinkInfo,
} from '@/types';
import Navbar from '@/sections/home/Navbar';
import MembersSection from '@/components/tripsync/MembersSection';
import ExpensesSection from '@/components/tripsync/ExpensesSection';
import ItinerarySection from '@/components/tripsync/ItinerarySection';
import TripDetailsSection from '@/components/tripsync/TripDetailsSection';
import {
  calculateOptimalSettlements,
  computeExpenseAnalytics,
  formatCurrency,
  getCategoryMeta,
} from '@/lib/expenseUtils';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const WorkspaceShell = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 5.25rem 1.25rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

/* Sticky Command Bar */
const CommandBar = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 0.9rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 2px 12px ${({ theme }) => theme.shadow};
`;

const CommandTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  flex-wrap: wrap;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const BackBtn = styled.button`
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
  }
`;

const TripTitle = styled.h1`
  margin: 0;
  font-size: clamp(1.25rem, 2.2vw, 1.6rem);
  font-weight: 900;
  color: ${({ theme }) => theme.text};
  letter-spacing: -0.02em;
`;

const MetaPill = styled.span<{ tone?: 'primary' | 'success' | 'warning' }>`
  padding: 0.22rem 0.6rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 800;
  background: ${({ tone, theme }) =>
    tone === 'primary'
      ? `${theme.primary}20`
      : tone === 'success'
      ? '#10B98120'
      : tone === 'warning'
      ? '#F59E0B20'
      : `${theme.mutedText}18`};
  color: ${({ tone, theme }) =>
    tone === 'primary'
      ? theme.primary
      : tone === 'success'
      ? '#10B981'
      : tone === 'warning'
      ? '#F59E0B'
      : theme.mutedText};
`;

const QuickActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button<{ variant?: 'primary' | 'ghost' | 'success' }>`
  padding: 0.45rem 0.8rem;
  border-radius: 9px;
  border: 1px solid
    ${({ variant, theme }) =>
      variant === 'primary'
        ? theme.primary
        : variant === 'success'
        ? '#10B981'
        : theme.border};
  background: ${({ variant, theme }) =>
    variant === 'primary'
      ? theme.primary
      : variant === 'success'
      ? '#10B981'
      : theme.background};
  color: ${({ variant, theme }) =>
    variant === 'primary' || variant === 'success' ? '#fff' : theme.text};
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.92;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* Section Tabs Bar (1-click least-click navigation) */
const TabsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  overflow-x: auto;
  padding-top: 0.55rem;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 0.48rem 0.85rem;
  border-radius: 10px;
  border: 1px solid ${({ active, theme }) => (active ? theme.primary : 'transparent')};
  background: ${({ active, theme }) =>
    active ? `${theme.primary}18` : 'transparent'};
  color: ${({ active, theme }) => (active ? theme.primary : theme.text)};
  font-size: 0.83rem;
  font-weight: ${({ active }) => (active ? 800 : 600)};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ active, theme }) =>
      active ? `${theme.primary}22` : `${theme.primary}10`};
  }
`;

const TabCount = styled.span<{ active: boolean }>`
  padding: 0.08rem 0.42rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  background: ${({ active, theme }) =>
    active ? theme.primary : `${theme.mutedText}22`};
  color: ${({ active, theme }) => (active ? '#fff' : theme.mutedText)};
`;

/* Overview Dashboard Layout */
const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 1rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const PanelCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 1.05rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 2px 8px ${({ theme }) => theme.shadow};
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 0.96rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 0.45rem;
`;

const KpiStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const KpiBox = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 13px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const KpiLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.mutedText};
`;

const KpiValue = styled.span`
  font-size: 1.3rem;
  font-weight: 900;
  color: ${({ theme }) => theme.text};
  font-variant-numeric: tabular-nums;
`;

const KpiSub = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.mutedText};
`;

const CompactRowItem = styled.div`
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
`;

const ShareInput = styled.input`
  flex: 1;
  min-width: 240px;
  padding: 0.65rem 0.85rem;
  border-radius: 9px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.84rem;
`;

type Section =
  | 'overview'
  | 'expenses'
  | 'settlements'
  | 'itinerary'
  | 'details'
  | 'members'
  | 'share';

const DEMO_TRIP: TripRead = {
  id: 'demo',
  name: '🌴 Goa Beach Getaway (Demo)',
  description: 'Interactive sandbox with sample spend, settlements, and itinerary.',
  members: [
    { member_id: 'm1', display_name: 'Aarav', linked: true },
    { member_id: 'm2', display_name: 'Priya', linked: true },
    { member_id: 'm3', display_name: 'Rohan', linked: false },
    { member_id: 'm4', display_name: 'Meera', linked: false },
  ],
  secret_access_url: null,
};

const DEMO_EXPENSES: ExpenseRead[] = [
  {
    id: 'e1',
    description: 'Beachfront Villa Booking (3 Nights)',
    amount: 24000,
    category: 'Lodging',
    date: '2026-10-24',
    paid_by_member_id: 'm1',
    split_with_member_ids: ['m1', 'm2', 'm3', 'm4'],
    custom_splits: null,
  },
  {
    id: 'e2',
    description: 'Seafood Dinner at Thalassa',
    amount: 6400,
    category: 'Food & Drinks',
    date: '2026-10-24',
    paid_by_member_id: 'm2',
    split_with_member_ids: ['m1', 'm2', 'm3', 'm4'],
    custom_splits: null,
  },
  {
    id: 'e3',
    description: 'Scooter Rentals & Fuel',
    amount: 3200,
    category: 'Transport',
    date: '2026-10-25',
    paid_by_member_id: 'm3',
    split_with_member_ids: ['m1', 'm2', 'm3', 'm4'],
    custom_splits: null,
  },
  {
    id: 'e4',
    description: 'Scuba Diving & Water Sports Package',
    amount: 8800,
    category: 'Activities',
    date: '2026-10-25',
    paid_by_member_id: 'm1',
    split_with_member_ids: ['m1', 'm2', 'm3', 'm4'],
    custom_splits: null,
  },
  {
    id: 'e5',
    description: 'Snacks, Drinks & Beach Supplies',
    amount: 1600,
    category: 'Groceries',
    date: '2026-10-25',
    paid_by_member_id: 'm4',
    split_with_member_ids: ['m1', 'm2', 'm3', 'm4'],
    custom_splits: null,
  },
];

const DEMO_SETTLEMENTS: SettlementRead[] = [
  {
    id: 's1',
    payer_member_id: 'm4',
    payee_member_id: 'm1',
    amount: 4000,
    mode: 'upi',
    created_at: '2026-10-25T15:30:00Z',
  },
];

const DEMO_ITINERARY: ItineraryItemRead[] = [
  {
    id: 'i1',
    title: 'Arrive at Mopa Airport & Rent Scooters',
    item_type: 'transport',
    start_time: '2026-10-24T11:00:00Z',
    end_time: '2026-10-24T12:30:00Z',
    location: 'Manohar International Airport, Goa',
    notes: 'Pickup 2 Activas + 2 Fascinos near Exit Gate 2',
    day_index: 1,
    all_day: false,
  },
  {
    id: 'i2',
    title: 'Check-in at Anjuna Beach Villa',
    item_type: 'lodging',
    start_time: '2026-10-24T14:00:00Z',
    end_time: '2026-10-24T15:00:00Z',
    location: 'Anjuna, North Goa',
    notes: 'Door passcode: 4829#',
    day_index: 1,
    all_day: false,
  },
  {
    id: 'i3',
    title: 'Sunset Dinner at Thalassa',
    item_type: 'food',
    start_time: '2026-10-24T18:30:00Z',
    end_time: '2026-10-24T21:30:00Z',
    location: 'Siolim, Goa',
    notes: 'Table reserved under Priya (4 guests)',
    day_index: 1,
    all_day: false,
  },
  {
    id: 'i4',
    title: 'Grand Island Scuba & Dolphin Cruise',
    item_type: 'activity',
    start_time: '2026-10-25T08:30:00Z',
    end_time: '2026-10-25T14:30:00Z',
    location: 'Sinquerim Boat Jetty',
    notes: 'Carry swimwear, sunscreen & GoPro',
    day_index: 2,
    all_day: false,
  },
];

function computeDemoBalances(
  members: TripRead['members'],
  expenses: ExpenseRead[],
  settlements: SettlementRead[]
): BalanceEntry[] {
  const net = new Map<string, number>();
  members.forEach((m) => net.set(m.member_id, 0));

  for (const exp of expenses) {
    const amount = Number(exp.amount || 0);
    const payer = exp.paid_by_member_id;
    if (!payer || !Number.isFinite(amount)) continue;
    net.set(payer, (net.get(payer) ?? 0) + amount);
    if (exp.custom_splits && exp.custom_splits.length > 0) {
      for (const cs of exp.custom_splits) {
        net.set(cs.member_id, (net.get(cs.member_id) ?? 0) - Number(cs.amount || 0));
      }
    } else {
      const ids = exp.split_with_member_ids ?? [];
      const splitCount = ids.length || 1;
      const share = amount / splitCount;
      for (const mid of ids) {
        net.set(mid, (net.get(mid) ?? 0) - share);
      }
    }
  }

  for (const s of settlements) {
    net.set(s.payer_member_id, (net.get(s.payer_member_id) ?? 0) + s.amount);
    net.set(s.payee_member_id, (net.get(s.payee_member_id) ?? 0) - s.amount);
  }

  return members.map((m) => ({
    member_id: m.member_id,
    display_name: m.display_name,
    balance: Math.round((net.get(m.member_id) ?? 0) * 100) / 100,
  }));
}

function frontendShareUrl(secret?: string | null): string {
  if (!secret || typeof window === 'undefined') return '';
  const token = secret.split('/').filter(Boolean).pop()?.split('?')[0] || '';
  if (!token) return '';
  if (token === 'demo-share') return `${window.location.origin}/tripsync/demo`;
  return `${window.location.origin}/tripsync/access?t=${encodeURIComponent(token)}`;
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = String(params?.tripId ?? '');
  const isDemo = tripId === 'demo';

  const initialTab = (searchParams?.get('tab') as Section) || 'overview';
  const [activeSection, setActiveSection] = useState<Section>(
    [
      'overview',
      'expenses',
      'settlements',
      'itinerary',
      'details',
      'members',
      'share',
    ].includes(initialTab)
      ? initialTab
      : 'overview'
  );

  const [trip, setTrip] = useState<TripRead | null>(null);
  const [expenses, setExpenses] = useState<ExpenseRead[]>([]);
  const [balances, setBalances] = useState<BalanceEntry[] | null>(null);
  const [settlements, setSettlements] = useState<SettlementRead[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItemRead[]>([]);
  const [tripDoc, setTripDoc] = useState<TripDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Share link UI state
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareStatus, setShareStatus] = useState<{
    text: string;
    tone: 'success' | 'error';
  } | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [expiryInput, setExpiryInput] = useState('');
  const [linkInfo, setLinkInfo] = useState<TripLinkInfo | null>(null);
  const seededTripId = useRef<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams?.get('tab') as Section | null;
    if (
      tabParam &&
      [
        'overview',
        'expenses',
        'settlements',
        'itinerary',
        'details',
        'members',
        'share',
      ].includes(tabParam)
    ) {
      setActiveSection(tabParam);
    }
  }, [searchParams]);

  const loadTripData = useCallback(async () => {
    if (isDemo) {
      if (seededTripId.current !== tripId) {
        seededTripId.current = tripId;
        setTrip(DEMO_TRIP);
        setExpenses(DEMO_EXPENSES);
        setSettlements(DEMO_SETTLEMENTS);
        setItinerary(DEMO_ITINERARY);
        setBalances(
          computeDemoBalances(DEMO_TRIP.members, DEMO_EXPENSES, DEMO_SETTLEMENTS)
        );
        setLinkInfo({
          secret_access_url: '/api/tripsync/access/demo-share',
          link_revoked: false,
          link_expires_at: null,
          access_token_version: 1,
        });
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const [
        tripData,
        expensesData,
        balancesData,
        itineraryData,
        settlementsData,
        docData,
      ] = await Promise.all([
        api.getTrip(tripId),
        api.listExpenses(tripId),
        api.getBalances(tripId),
        api.listItinerary(tripId),
        api.listSettlements(tripId),
        api.getTripDoc(tripId).catch(() => null),
      ]);
      setTrip(tripData);
      setExpenses(expensesData);
      setBalances(
        balancesData.map((entry) => ({
          ...entry,
          display_name:
            tripData.members.find((m) => m.member_id === entry.member_id)
              ?.display_name || entry.display_name,
        }))
      );
      setItinerary(itineraryData);
      setSettlements(settlementsData);
      if (docData) setTripDoc(docData);
      const link = await api.getLink(tripId).catch(() => null);
      if (link) {
        setLinkInfo(link);
      } else if (tripData.secret_access_url) {
        setLinkInfo({
          secret_access_url: tripData.secret_access_url,
          link_revoked: false,
          link_expires_at: null,
          access_token_version: 1,
        });
      }
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : 'Failed to load trip data.'
      );
    } finally {
      setLoading(false);
    }
  }, [tripId, isDemo]);

  useEffect(() => {
    if (tripId) {
      void loadTripData();
    }
  }, [tripId, loadTripData]);

  const analytics = useMemo(
    () => computeExpenseAnalytics(expenses, trip?.members ?? [], balances),
    [expenses, trip?.members, balances]
  );

  const pendingSettlements = useMemo(
    () => calculateOptimalSettlements(balances ?? []),
    [balances]
  );

  const shareUrl = useMemo(
    () => frontendShareUrl(linkInfo?.secret_access_url),
    [linkInfo?.secret_access_url]
  );
  const linkActive = Boolean(linkInfo && !linkInfo.link_revoked && shareUrl);

  const handleCopyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      setShareStatus({ text: 'Could not copy link automatically.', tone: 'error' });
    }
  };

  const handleRotateLink = async () => {
    if (!trip || isDemo) {
      setShareStatus({
        text: 'Demo links stay on this sandbox. Sign in to rotate a real trip link.',
        tone: 'success',
      });
      return;
    }
    try {
      const rotated = await api.rotateLink(trip.id);
      setLinkInfo((prev) => ({
        secret_access_url: rotated.secret_access_url,
        link_revoked: false,
        link_expires_at: prev?.link_expires_at ?? null,
        access_token_version: (prev?.access_token_version ?? 0) + 1,
      }));
      setTrip((prev) =>
        prev ? { ...prev, secret_access_url: rotated.secret_access_url } : prev
      );
      setShareStatus({
        text: 'Share link rotated. The previous link no longer works.',
        tone: 'success',
      });
    } catch (e) {
      setShareStatus({
        text: e instanceof Error ? e.message : 'Failed to rotate link.',
        tone: 'error',
      });
    }
  };

  const handleRevokeLink = async () => {
    if (!trip || isDemo) return;
    try {
      await api.revokeLink(trip.id);
      setLinkInfo((prev) =>
        prev
          ? { ...prev, link_revoked: true, secret_access_url: '' }
          : {
              secret_access_url: '',
              link_revoked: true,
              link_expires_at: null,
              access_token_version: 1,
            }
      );
      setTrip((prev) => (prev ? { ...prev, secret_access_url: null } : prev));
      setConfirmRevoke(false);
      setShareStatus({ text: 'Share link revoked.', tone: 'success' });
    } catch (e) {
      setShareStatus({
        text: e instanceof Error ? e.message : 'Failed to revoke link.',
        tone: 'error',
      });
    }
  };

  const handleSetExpiry = async (expiresAtIso: string | null) => {
    if (!trip || isDemo) return;
    try {
      await api.updateLinkExpiry(trip.id, { link_expires_at: expiresAtIso });
      setLinkInfo((prev) =>
        prev
          ? { ...prev, link_expires_at: expiresAtIso }
          : {
              secret_access_url: trip.secret_access_url || '',
              link_revoked: false,
              link_expires_at: expiresAtIso,
              access_token_version: 1,
            }
      );
      setShareStatus({
        text: expiresAtIso
          ? `Link expiry set to ${new Date(expiresAtIso).toLocaleString()}`
          : 'Link set to never expire.',
        tone: 'success',
      });
    } catch (e) {
      setShareStatus({
        text: e instanceof Error ? e.message : 'Failed to update link expiry.',
        tone: 'error',
      });
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Navbar />
        <WorkspaceShell>
          <PanelCard>Loading TripSync workspace…</PanelCard>
        </WorkspaceShell>
      </PageWrapper>
    );
  }

  if (!trip) {
    return (
      <PageWrapper>
        <Navbar />
        <WorkspaceShell>
          <PanelCard>
            <h2 style={{ margin: 0 }}>Could not open trip</h2>
            <p style={{ margin: 0, opacity: 0.8 }}>
              {errorMsg || 'Trip not found or you need to sign in.'}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <ActionBtn
                type="button"
                variant="primary"
                onClick={() => router.push(`/login?next=/tripsync/${tripId}`)}
              >
                Sign In
              </ActionBtn>
              <ActionBtn type="button" onClick={() => void loadTripData()}>
                Retry
              </ActionBtn>
              <ActionBtn
                type="button"
                onClick={() => router.push('/tripsync/demo')}
              >
                Open Demo Trip Instead
              </ActionBtn>
            </div>
          </PanelCard>
        </WorkspaceShell>
      </PageWrapper>
    );
  }

  const memberNameMap = new Map(
    trip.members.map((m) => [m.member_id, m.display_name])
  );

  return (
    <PageWrapper>
      <Navbar />
      <WorkspaceShell>
        {/* Top Command Header */}
        <CommandBar>
          <CommandTopRow>
            <TitleArea>
              <BackBtn type="button" onClick={() => router.push('/tripsync')}>
                ← All Trips
              </BackBtn>
              <TripTitle>{trip.name}</TripTitle>
              {isDemo && <MetaPill tone="primary">Interactive Sandbox</MetaPill>}
              <MetaPill>{trip.members.length} Travelers</MetaPill>
              <MetaPill tone="primary">
                Total: {formatCurrency(analytics.totalAmount)}
              </MetaPill>
              <MetaPill
                tone={pendingSettlements.length === 0 ? 'success' : 'warning'}
              >
                {pendingSettlements.length === 0
                  ? '✓ All Settled'
                  : `${pendingSettlements.length} Settlement${
                      pendingSettlements.length === 1 ? '' : 's'
                    } Due`}
              </MetaPill>
            </TitleArea>

            <QuickActionsRow>
              <ActionBtn
                type="button"
                variant="primary"
                onClick={() => setActiveSection('expenses')}
              >
                + Add Expense
              </ActionBtn>
              <ActionBtn
                type="button"
                onClick={() => setActiveSection('settlements')}
              >
                🤝 Settle Up
              </ActionBtn>
              <ActionBtn
                type="button"
                onClick={() => setActiveSection('itinerary')}
              >
                + Activity
              </ActionBtn>
              {shareUrl && (
                <ActionBtn
                  type="button"
                  variant={copiedLink ? 'success' : 'ghost'}
                  onClick={() => void handleCopyShareLink()}
                >
                  {copiedLink ? '✓ Link Copied!' : '🔗 Copy Share Link'}
                </ActionBtn>
              )}
            </QuickActionsRow>
          </CommandTopRow>

          {/* 1-Click Navigation Bar */}
          <TabsRow>
            <TabButton
              type="button"
              active={activeSection === 'overview'}
              onClick={() => setActiveSection('overview')}
            >
              📊 Overview
            </TabButton>
            <TabButton
              type="button"
              active={activeSection === 'expenses'}
              onClick={() => setActiveSection('expenses')}
            >
              💸 Expenses
              <TabCount active={activeSection === 'expenses'}>
                {expenses.length}
              </TabCount>
            </TabButton>
            <TabButton
              type="button"
              active={activeSection === 'settlements'}
              onClick={() => setActiveSection('settlements')}
            >
              🤝 Settlements
              <TabCount active={activeSection === 'settlements'}>
                {pendingSettlements.length}
              </TabCount>
            </TabButton>
            <TabButton
              type="button"
              active={activeSection === 'itinerary'}
              onClick={() => setActiveSection('itinerary')}
            >
              🗓️ Itinerary
              <TabCount active={activeSection === 'itinerary'}>
                {itinerary.length}
              </TabCount>
            </TabButton>
            <TabButton
              type="button"
              active={activeSection === 'details'}
              onClick={() => setActiveSection('details')}
            >
              🗺️ Brief & Stays
            </TabButton>
            <TabButton
              type="button"
              active={activeSection === 'members'}
              onClick={() => setActiveSection('members')}
            >
              👥 Travelers
              <TabCount active={activeSection === 'members'}>
                {trip.members.length}
              </TabCount>
            </TabButton>
            <TabButton
              type="button"
              active={activeSection === 'share'}
              onClick={() => setActiveSection('share')}
            >
              🔗 Share & Access
            </TabButton>
          </TabsRow>
        </CommandBar>

        {/* SECTION: OVERVIEW COCKPIT */}
        {activeSection === 'overview' && (
          <>
            <KpiStrip>
              <KpiBox onClick={() => setActiveSection('expenses')}>
                <KpiLabel>Total Trip Spend</KpiLabel>
                <KpiValue>{formatCurrency(analytics.totalAmount)}</KpiValue>
                <KpiSub>
                  {expenses.length} expense{expenses.length === 1 ? '' : 's'} • Avg{' '}
                  {formatCurrency(analytics.averagePerPerson)}/person
                </KpiSub>
              </KpiBox>

              <KpiBox onClick={() => setActiveSection('settlements')}>
                <KpiLabel>Settlement Status</KpiLabel>
                <KpiValue
                  style={{
                    color:
                      pendingSettlements.length === 0 ? '#10B981' : '#F59E0B',
                  }}
                >
                  {pendingSettlements.length === 0
                    ? '✓ All Clear'
                    : `${pendingSettlements.length} Pending`}
                </KpiValue>
                <KpiSub>
                  {settlements.length} payment
                  {settlements.length === 1 ? '' : 's'} recorded
                </KpiSub>
              </KpiBox>

              <KpiBox onClick={() => setActiveSection('itinerary')}>
                <KpiLabel>Itinerary Schedule</KpiLabel>
                <KpiValue>{itinerary.length} Items</KpiValue>
                <KpiSub>
                  {itinerary[0]
                    ? `Next: ${itinerary[0].title}`
                    : 'Click to add activities'}
                </KpiSub>
              </KpiBox>

              <KpiBox onClick={() => setActiveSection('members')}>
                <KpiLabel>Travelers</KpiLabel>
                <KpiValue>{trip.members.length} Members</KpiValue>
                <KpiSub>
                  {trip.members.map((m) => m.display_name).join(', ')}
                </KpiSub>
              </KpiBox>
            </KpiStrip>

            <OverviewGrid>
              {/* Left Column: Recent Expenses + Upcoming Itinerary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <PanelCard>
                  <PanelHeader>
                    <PanelTitle>💸 Recent Expenses</PanelTitle>
                    <ActionBtn
                      type="button"
                      variant="primary"
                      onClick={() => setActiveSection('expenses')}
                    >
                      Open Expense Manager →
                    </ActionBtn>
                  </PanelHeader>

                  {expenses.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                      No expenses logged yet.
                    </div>
                  ) : (
                    expenses.slice(0, 5).map((e) => {
                      const cat = getCategoryMeta(e.category);
                      return (
                        <CompactRowItem key={e.id}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                              {cat.emoji} {e.description}
                            </div>
                            <div style={{ fontSize: '0.76rem', opacity: 0.75 }}>
                              Paid by{' '}
                              <strong>
                                {memberNameMap.get(e.paid_by_member_id || '') || 'Unknown'}
                              </strong>{' '}
                              • Split {(e.split_with_member_ids ?? []).length} ways
                            </div>
                          </div>
                          <strong style={{ fontSize: '0.95rem' }}>
                            {formatCurrency(Number(e.amount || 0))}
                          </strong>
                        </CompactRowItem>
                      );
                    })
                  )}
                </PanelCard>

                <PanelCard>
                  <PanelHeader>
                    <PanelTitle>🗓️ Upcoming Itinerary</PanelTitle>
                    <ActionBtn
                      type="button"
                      onClick={() => setActiveSection('itinerary')}
                    >
                      Manage Schedule →
                    </ActionBtn>
                  </PanelHeader>

                  {itinerary.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                      No itinerary items scheduled yet.
                    </div>
                  ) : (
                    itinerary.slice(0, 4).map((item) => (
                      <CompactRowItem key={item.id}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.76rem', opacity: 0.75 }}>
                            {item.location ? `📍 ${item.location} • ` : ''}
                            {item.day_index ? `Day ${item.day_index}` : item.item_type}
                          </div>
                        </div>
                        <MetaPill>{item.item_type}</MetaPill>
                      </CompactRowItem>
                    ))
                  )}
                </PanelCard>
              </div>

              {/* Right Column: Who Owes Whom + Member Balances */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <PanelCard>
                  <PanelHeader>
                    <PanelTitle>🤝 Who Owes Whom (Smart Settle)</PanelTitle>
                    <ActionBtn
                      type="button"
                      variant="primary"
                      onClick={() => setActiveSection('settlements')}
                    >
                      Settle Balances →
                    </ActionBtn>
                  </PanelHeader>

                  {pendingSettlements.length === 0 ? (
                    <div
                      style={{
                        padding: '0.85rem',
                        borderRadius: '10px',
                        background: '#10B98115',
                        color: '#10B981',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        textAlign: 'center',
                      }}
                    >
                      🎉 Everyone is settled up!
                    </div>
                  ) : (
                    pendingSettlements.map((s, idx) => (
                      <CompactRowItem key={idx}>
                        <div style={{ fontSize: '0.88rem' }}>
                          <strong style={{ color: '#EF4444' }}>{s.fromName}</strong>{' '}
                          pays{' '}
                          <strong style={{ color: '#10B981' }}>{s.toName}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.95rem' }}>
                            {formatCurrency(s.amount)}
                          </strong>
                          <ActionBtn
                            type="button"
                            variant="primary"
                            onClick={() => setActiveSection('settlements')}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            Settle
                          </ActionBtn>
                        </div>
                      </CompactRowItem>
                    ))
                  )}
                </PanelCard>

                <PanelCard>
                  <PanelHeader>
                    <PanelTitle>⚖️ Traveler Spending & Net Balances</PanelTitle>
                    <ActionBtn
                      type="button"
                      onClick={() => setActiveSection('members')}
                    >
                      + Add Traveler
                    </ActionBtn>
                  </PanelHeader>

                  {analytics.memberStats.map((m) => (
                    <CompactRowItem key={m.memberId}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {m.displayName}
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>
                          Paid {formatCurrency(m.totalPaid)} • Share{' '}
                          {formatCurrency(m.totalShare)}
                        </div>
                      </div>
                      <MetaPill
                        tone={
                          m.netBalance > 0.01
                            ? 'success'
                            : m.netBalance < -0.01
                            ? 'warning'
                            : undefined
                        }
                      >
                        {Math.abs(m.netBalance) <= 0.01
                          ? 'Settled'
                          : m.netBalance > 0
                          ? `Gets +${formatCurrency(m.netBalance)}`
                          : `Owes -${formatCurrency(Math.abs(m.netBalance))}`}
                      </MetaPill>
                    </CompactRowItem>
                  ))}
                </PanelCard>
              </div>
            </OverviewGrid>
          </>
        )}

        {/* SECTION: EXPENSES OR SETTLEMENTS */}
        {(activeSection === 'expenses' || activeSection === 'settlements') && (
          <ExpensesSection
            tripId={trip.id}
            members={trip.members}
            expenses={expenses}
            balances={balances}
            settlements={settlements}
            focusSettlements={activeSection === 'settlements'}
            onExpensesChange={(nextExpenses) => {
              setExpenses(nextExpenses);
              if (isDemo) {
                setBalances(
                  computeDemoBalances(trip.members, nextExpenses, settlements)
                );
              }
            }}
            onSettlementsChange={(nextSettlements) => {
              setSettlements(nextSettlements);
              if (isDemo) {
                setBalances(
                  computeDemoBalances(trip.members, expenses, nextSettlements)
                );
              }
            }}
            onUpdate={loadTripData}
          />
        )}

        {/* SECTION: ITINERARY */}
        {activeSection === 'itinerary' && (
          <ItinerarySection
            tripId={trip.id}
            items={itinerary}
            onItemsChange={setItinerary}
            onRefresh={loadTripData}
            docRevision={tripDoc?.revision ?? null}
          />
        )}

        {/* SECTION: DETAILS & STAYS */}
        {activeSection === 'details' &&
          (isDemo ? (
            <PanelCard>
              <PanelHeader>
                <PanelTitle>🗺️ Demo Trip Brief & Stays</PanelTitle>
              </PanelHeader>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.55 }}>
                <strong>Brief:</strong> 4-day North & South Goa getaway with beach
                villa stay, scooter exploration, and Grand Island scuba diving.
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.55 }}>
                <strong>Stay:</strong> Anjuna Beachfront Villa (Check-in Oct 24 →
                Check-out Oct 27 • 3 nights).
              </p>
            </PanelCard>
          ) : (
            <TripDetailsSection
              tripId={trip.id}
              canEdit={true}
              onDocLoaded={(d) => setTripDoc(d)}
              onDocUpdated={(d) => {
                setTripDoc(d);
                if (d.title && d.title !== trip.name) {
                  setTrip((prev) => (prev ? { ...prev, name: d.title } : prev));
                }
              }}
              onNeedRefresh={loadTripData}
            />
          ))}

        {/* SECTION: MEMBERS */}
        {activeSection === 'members' && (
          <MembersSection
            tripId={trip.id}
            members={trip.members}
            balances={balances ?? []}
            onUpdate={(updatedTrip) => {
              if (isDemo) {
                setTrip((prev) =>
                  prev ? { ...prev, members: updatedTrip.members } : updatedTrip
                );
                return;
              }
              setTrip(updatedTrip);
              void loadTripData();
            }}
          />
        )}

        {/* SECTION: SHARE & SECURITY */}
        {activeSection === 'share' && (
          <PanelCard>
            <PanelHeader>
              <PanelTitle>🔗 Quick Share Link & Access Security</PanelTitle>
              <MetaPill tone={linkActive ? 'success' : 'warning'}>
                {linkActive ? '✓ Active Link' : 'Revoked'}
              </MetaPill>
            </PanelHeader>

            <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.8 }}>
              Share this link with fellow travelers so they can view balances, log
              expenses, and check the itinerary without needing an account.
            </p>

            {shareStatus && (
              <div
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '9px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  background:
                    shareStatus.tone === 'success' ? '#10B98118' : '#EF444418',
                  color: shareStatus.tone === 'success' ? '#10B981' : '#EF4444',
                  border: `1px solid ${
                    shareStatus.tone === 'success' ? '#10B98155' : '#EF444455'
                  }`,
                }}
              >
                {shareStatus.text}
              </div>
            )}

            {linkActive ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.55rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <ShareInput type="text" readOnly value={shareUrl} />
                  <ActionBtn
                    type="button"
                    variant={copiedLink ? 'success' : 'primary'}
                    onClick={() => void handleCopyShareLink()}
                  >
                    {copiedLink ? '✓ Copied!' : '📋 Copy Share Link'}
                  </ActionBtn>
                </div>

                {/* Expiry Management */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    paddingTop: '0.65rem',
                    borderTop: '1px solid rgba(148,163,184,0.2)',
                  }}
                >
                  <div style={{ fontSize: '0.84rem' }}>
                    <strong>Link Expiration:</strong>{' '}
                    {linkInfo?.link_expires_at
                      ? new Date(linkInfo.link_expires_at).toLocaleString()
                      : 'Never expires'}
                  </div>

                  {!isDemo && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.4rem',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <ActionBtn
                        type="button"
                        onClick={() => void handleSetExpiry(null)}
                      >
                        Never Expire
                      </ActionBtn>
                      <ActionBtn
                        type="button"
                        onClick={() => {
                          const d = new Date(Date.now() + 24 * 3600 * 1000);
                          void handleSetExpiry(d.toISOString());
                        }}
                      >
                        24h
                      </ActionBtn>
                      <ActionBtn
                        type="button"
                        onClick={() => {
                          const d = new Date(Date.now() + 7 * 24 * 3600 * 1000);
                          void handleSetExpiry(d.toISOString());
                        }}
                      >
                        7 Days
                      </ActionBtn>
                      <input
                        type="datetime-local"
                        value={expiryInput}
                        onChange={(e) => setExpiryInput(e.target.value)}
                        style={{
                          padding: '0.38rem 0.6rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(148,163,184,0.35)',
                          background: 'transparent',
                          color: 'inherit',
                          fontSize: '0.8rem',
                        }}
                      />
                      {expiryInput && (
                        <ActionBtn
                          type="button"
                          variant="primary"
                          onClick={() => {
                            const d = new Date(expiryInput);
                            if (!Number.isNaN(d.getTime())) {
                              void handleSetExpiry(d.toISOString());
                            }
                          }}
                        >
                          Set Expiry
                        </ActionBtn>
                      )}
                    </div>
                  )}
                </div>

                {/* Security Controls: Rotate & Revoke */}
                {!isDemo && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.55rem',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid rgba(148,163,184,0.2)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <ActionBtn
                      type="button"
                      onClick={() => void handleRotateLink()}
                    >
                      🔄 Rotate Token (Invalidate Old Link)
                    </ActionBtn>
                    {confirmRevoke ? (
                      <>
                        <ActionBtn
                          type="button"
                          onClick={() => void handleRevokeLink()}
                          style={{
                            borderColor: '#EF4444',
                            color: '#EF4444',
                          }}
                        >
                          Confirm Revoke Link
                        </ActionBtn>
                        <ActionBtn
                          type="button"
                          onClick={() => setConfirmRevoke(false)}
                        >
                          Cancel
                        </ActionBtn>
                      </>
                    ) : (
                      <ActionBtn
                        type="button"
                        onClick={() => setConfirmRevoke(true)}
                        style={{ color: '#EF4444' }}
                      >
                        🚫 Disable Share Link
                      </ActionBtn>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div>
                <p style={{ margin: '0 0 0.75rem', opacity: 0.75 }}>
                  Public link sharing is currently disabled for this trip.
                </p>
                <ActionBtn
                  type="button"
                  variant="primary"
                  onClick={() => void handleRotateLink()}
                >
                  ✨ Generate New Share Link
                </ActionBtn>
              </div>
            )}
          </PanelCard>
        )}
      </WorkspaceShell>
    </PageWrapper>
  );
}
