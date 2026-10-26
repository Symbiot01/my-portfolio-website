'use client';

import { Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import Navbar from '@/sections/home/Navbar';
import { api } from '@/lib/api';
import {
  BalanceEntry,
  ExpenseRead,
  ItineraryItemRead,
  SettlementRead,
  TripDoc,
  TripRead,
} from '@/types';
import MembersSection from '@/components/tripsync/MembersSection';
import ExpensesSection from '@/components/tripsync/ExpensesSection';
import ItinerarySection from '@/components/tripsync/ItinerarySection';
import TripDetailsSection from '@/components/tripsync/TripDetailsSection';
import {
  calculateOptimalSettlements,
  computeExpenseAnalytics,
  formatCurrency,
} from '@/lib/expenseUtils';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const WorkspaceShell = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 5.25rem 1.25rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CommandBar = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 0.95rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 2px 12px ${({ theme }) => theme.shadow};
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  margin: 0;
  font-family: var(--font-display), sans-serif;
  font-size: clamp(1.25rem, 2.2vw, 1.6rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.text};
`;

const Badge = styled.span<{ tone?: 'primary' | 'success' | 'warning' }>`
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

const ModeToggleBtn = styled.button<{ active: boolean }>`
  padding: 0.45rem 0.85rem;
  border-radius: 9px;
  border: 1px solid ${({ active, theme }) => (active ? '#10B981' : theme.border)};
  background: ${({ active }) => (active ? '#10B98120' : 'transparent')};
  color: ${({ active, theme }) => (active ? '#10B981' : theme.text)};
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
`;

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
  white-space: nowrap;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 1.25rem;
`;

type Section = 'expenses' | 'settlements' | 'itinerary' | 'details' | 'members';

function TripAccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams?.get('t') || '', [searchParams]);

  const [trip, setTrip] = useState<TripRead | null>(null);
  const [expenses, setExpenses] = useState<ExpenseRead[]>([]);
  const [balances, setBalances] = useState<BalanceEntry[] | null>(null);
  const [settlements, setSettlements] = useState<SettlementRead[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItemRead[]>([]);
  const [tripDoc, setTripDoc] = useState<TripDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const VALID_SECTIONS: Section[] = [
    'expenses',
    'settlements',
    'itinerary',
    'details',
    'members',
  ];
  const initialTab = (searchParams?.get('tab') as Section) || 'expenses';
  const [activeSection, setActiveSection] = useState<Section>(
    VALID_SECTIONS.includes(initialTab) ? initialTab : 'expenses'
  );
  const [canEdit, setCanEdit] = useState(true);

  useEffect(() => {
    const tabParam = searchParams?.get('tab') as Section | null;
    if (
      tabParam &&
      ['expenses', 'settlements', 'itinerary', 'details', 'members'].includes(
        tabParam
      )
    ) {
      setActiveSection(tabParam);
    } else if (!tabParam) {
      setActiveSection('expenses');
    }
  }, [searchParams]);

  const handleSelectSection = useCallback(
    (nextSection: Section) => {
      setActiveSection(nextSection);
      const nextParams = new URLSearchParams(searchParams?.toString() ?? '');
      if (nextSection === 'expenses') {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', nextSection);
      }
      const qs = nextParams.toString();
      router.replace(qs ? `/tripsync/access?${qs}` : '/tripsync/access', {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  const loadByToken = useCallback(async () => {
    if (!token) {
      setError('Missing access token in URL (?t=...).');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const t = await api.previewTripByAccess(token);
      setTrip(t);

      const opts = { tripAccessToken: token, tripEdit: canEdit };
      const [e, b, it, s, d] = await Promise.all([
        api.listExpenses(t.id, opts),
        api.getBalances(t.id, opts),
        api.listItinerary(t.id, opts),
        api.listSettlements(t.id, opts),
        api.getTripDoc(t.id, opts).catch(() => null),
      ]);
      setExpenses(e);
      setBalances(
        b.map((entry) => ({
          ...entry,
          display_name:
            t.members.find((m) => m.member_id === entry.member_id)?.display_name ||
            entry.display_name ||
            'Former Member',
        }))
      );
      setItinerary(it);
      setSettlements(s);
      if (d) setTripDoc(d);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Invalid or expired shared trip link.'
      );
    } finally {
      setLoading(false);
    }
  }, [token, canEdit]);

  useEffect(() => {
    void loadByToken();
  }, [loadByToken]);

  const analytics = useMemo(
    () => computeExpenseAnalytics(expenses, trip?.members ?? [], balances),
    [expenses, trip?.members, balances]
  );

  const pendingSettlements = useMemo(
    () => calculateOptimalSettlements(balances ?? []),
    [balances]
  );

  if (loading) {
    return (
      <PageWrapper>
        <Navbar />
        <WorkspaceShell>
          <Card>Loading shared trip…</Card>
        </WorkspaceShell>
      </PageWrapper>
    );
  }

  if (error || !trip) {
    return (
      <PageWrapper>
        <Navbar />
        <WorkspaceShell>
          <Card>
            <h2 style={{ margin: '0 0 0.5rem' }}>Unable to open shared trip</h2>
            <p style={{ margin: '0 0 1rem', opacity: 0.8 }}>
              {error || 'Trip not found.'}
            </p>
            <ModeToggleBtn
              type="button"
              active={false}
              onClick={() => router.push('/tripsync')}
            >
              ← Go to TripSync Hub
            </ModeToggleBtn>
          </Card>
        </WorkspaceShell>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar />
      <WorkspaceShell>
        <CommandBar>
          <TopRow>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <Title>{trip.name}</Title>
              <Badge tone="primary">Shared Link Access</Badge>
              <Badge>Total: {formatCurrency(analytics.totalAmount)}</Badge>
              <Badge
                tone={pendingSettlements.length === 0 ? 'success' : 'warning'}
              >
                {pendingSettlements.length === 0
                  ? '✓ Settled'
                  : `${pendingSettlements.length} Settlement${
                      pendingSettlements.length === 1 ? '' : 's'
                    } Due`}
              </Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ModeToggleBtn
                type="button"
                active={canEdit}
                onClick={() => setCanEdit((v) => !v)}
              >
                {canEdit ? '✏️ Edit Mode Enabled' : '🔒 Read-Only (Click to Edit)'}
              </ModeToggleBtn>
            </div>
          </TopRow>

          <TabsRow>
            <TabButton
              type="button"
              active={activeSection === 'expenses'}
              onClick={() => handleSelectSection('expenses')}
            >
              💸 Expenses ({expenses.length})
            </TabButton>
            <TabButton
              type="button"
              active={activeSection === 'settlements'}
              onClick={() => handleSelectSection('settlements')}
            >
              🤝 Settlements ({pendingSettlements.length})
            </TabButton>
            <TabButton
              type="button"
              active={activeSection === 'itinerary'}
              onClick={() => handleSelectSection('itinerary')}
            >
              🗓️ Itinerary ({itinerary.length})
            </TabButton>
            <TabButton
              type="button"
              active={activeSection === 'details'}
              onClick={() => handleSelectSection('details')}
            >
              🗺️ Brief & Stays
            </TabButton>
            <TabButton
              type="button"
              active={activeSection === 'members'}
              onClick={() => handleSelectSection('members')}
            >
              👥 Travelers ({trip.members.length})
            </TabButton>
          </TabsRow>
        </CommandBar>

        {(activeSection === 'expenses' || activeSection === 'settlements') && (
          <ExpensesSection
            tripId={trip.id}
            members={trip.members}
            expenses={expenses}
            balances={balances}
            settlements={settlements}
            focusSettlements={activeSection === 'settlements'}
            onExpensesChange={setExpenses}
            onUpdate={loadByToken}
            tripAccessToken={token}
            canEdit={canEdit}
          />
        )}

        {activeSection === 'itinerary' && (
          <ItinerarySection
            tripId={trip.id}
            items={itinerary}
            tripAccessToken={token}
            canEdit={canEdit}
            onItemsChange={setItinerary}
            onRefresh={loadByToken}
            docRevision={tripDoc?.revision ?? null}
          />
        )}

        {activeSection === 'details' && (
          <TripDetailsSection
            tripId={trip.id}
            tripAccessToken={token}
            canEdit={canEdit}
            onDocLoaded={(d) => setTripDoc(d)}
            onDocUpdated={(d) => setTripDoc(d)}
            onNeedRefresh={loadByToken}
          />
        )}

        {activeSection === 'members' && (
          <MembersSection
            tripId={trip.id}
            members={trip.members}
            balances={balances ?? []}
            expenses={expenses}
            settlements={settlements}
            onUpdate={(updatedTrip) => {
              setTrip(updatedTrip);
              void loadByToken();
            }}
            tripAccessToken={token}
            canEdit={canEdit}
          />
        )}
      </WorkspaceShell>
    </PageWrapper>
  );
}

export default function TripAccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: '6rem 2rem' }}>Loading…</div>}>
      <TripAccessInner />
    </Suspense>
  );
}
