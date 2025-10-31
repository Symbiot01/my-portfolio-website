'use client';

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Navbar from '@/sections/home/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { BalanceEntry, ItineraryItemCreate, TripRead, TripLinkInfo } from '@/types';
import MembersSection from '@/components/tripsync/MembersSection';
import ExpensesSection from '@/components/tripsync/ExpensesSection';
import { mockTrip, mockExpenses, mockBalances, MockExpense } from '@/lib/mockData';

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
`;

const TripInfo = styled.div`
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid ${({ theme }) => theme.border};
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
`;

const TripDescription = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.mutedText};
  line-height: 1.5;
  margin-bottom: 0.75rem;
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
`;

const NavSection = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

type Props = { params: { tripId: string } };

export default function TripDetailPage({ params }: Props) {
  const { user, isLoading } = useAuth();
  const [trip, setTrip] = useState<TripRead | null>(null);
  const [activeSection, setActiveSection] = useState<'members' | 'itinerary' | 'expenses' | 'settlements' | 'share'>('members');
  const [itinerary, setItinerary] = useState<ItineraryItemCreate[]>([]);
  const [expenses, setExpenses] = useState<MockExpense[]>([]);
  const [balances, setBalances] = useState<BalanceEntry[]>([]);
  const [linkInfo, setLinkInfo] = useState<TripLinkInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    const run = async () => {
      try {
        const t = await api.getTrip(params.tripId);
        setTrip(t);
        const items = await api.listItinerary(params.tripId);
        setItinerary(items);
        const expensesList = await api.listExpenses(params.tripId);
        // Map ExpenseRead to MockExpense by adding missing UI fields
        const mappedExpenses: MockExpense[] = expensesList.map((exp) => ({
          ...exp,
          date: new Date().toISOString(), // Backend should provide this, fallback to now
          category: 'Other', // Backend should provide this, fallback to Other
        }));
        setExpenses(mappedExpenses);
        const b = await api.getBalances(params.tripId);
        setBalances(b);
        
        // Fetch link info
        try {
          const link = await api.getLink(params.tripId);
          setLinkInfo(link);
        } catch (e) {
          console.error('Failed to fetch link info:', e);
          // Link info might not be available if user is not a linked member
        }
      } catch (e) {
        console.error('API Error, falling back to mock data:', e);
        // Fallback to mock data if API fails
        setTrip(mockTrip);
        setItinerary([]);
        setExpenses(mockExpenses);
        setBalances(mockBalances);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params.tripId, user, isLoading]);

  const handleTripUpdate = (updatedTrip: TripRead) => {
    setTrip(updatedTrip);
  };

  const handleExpensesUpdate = async () => {
    try {
      const expensesList = await api.listExpenses(params.tripId);
      // Map ExpenseRead to MockExpense by adding missing UI fields
      const mappedExpenses: MockExpense[] = expensesList.map((exp) => ({
        ...exp,
        date: new Date().toISOString(), // Backend should provide this, fallback to now
        category: 'Other', // Backend should provide this, fallback to Other
      }));
      setExpenses(mappedExpenses);
      const b = await api.getBalances(params.tripId);
      setBalances(b);
    } catch (e) {
      console.error('Failed to refresh expenses:', e);
      // Keep using current data on error
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Unauthorized</div>;

  return (
    <PageWrapper>
      {/* Navbar spans full width */}
      <Navbar />

      {/* Content wrapper with sidebar and main content */}
      <ContentWrapper>
        {/* Sidebar starts below navbar */}
        <Sidebar>
          <SidebarContent>
            <TripInfo>
              <TripTitle>{trip?.name || 'Trip'}</TripTitle>
              {trip?.description && <TripDescription>{trip.description}</TripDescription>}
              <TripMeta>
                <span>👥</span>
                <span>{trip?.members.length || 0} member{trip?.members.length !== 1 ? 's' : ''}</span>
              </TripMeta>
            </TripInfo>

            <NavSection>
              {(['members', 'itinerary', 'expenses', 'settlements', 'share'] as const).map((section) => (
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

        {/* Main Content Area */}
        <MainContent>
          <MainPanel>
          <PanelHeader>
            <PanelTitle>{activeSection}</PanelTitle>
          </PanelHeader>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {activeSection === 'members' && trip && (
                <MembersSection
                  tripId={params.tripId}
                  members={trip.members}
                  onUpdate={handleTripUpdate}
                />
              )}

              {activeSection === 'itinerary' && (
                <div>
                  <ul>
                    {itinerary.map((i, idx) => (
                      <li key={idx}>
                        <strong>{i.title}</strong> — {i.item_type} — {new Date(i.start_time).toLocaleString()}
                        {i.end_time ? ` → ${new Date(i.end_time).toLocaleString()}` : ''}
                        {i.location ? ` @ ${i.location}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeSection === 'expenses' && trip && (
                <ExpensesSection
                  tripId={params.tripId}
                  members={trip.members}
                  expenses={expenses}
                  balances={balances}
                  onUpdate={handleExpensesUpdate}
                />
              )}

              {activeSection === 'settlements' && (
                <div>
                  <p>Coming next: list/add/edit/delete settlements.</p>
                </div>
              )}

              {activeSection === 'share' && (
                <div>
                  {linkInfo ? (
                    <>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>Access Link</h3>
                        <div
                          style={{
                            padding: '1rem',
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border)',
                            borderRadius: '3px',
                            wordBreak: 'break-all',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            marginBottom: '0.75rem',
                          }}
                        >
                          {linkInfo.secret_access_url}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginBottom: '1rem' }}>
                          <div>Status: {linkInfo.link_revoked ? <span style={{ color: '#E74C3C' }}>Revoked</span> : <span style={{ color: '#27AE60' }}>Active</span>}</div>
                          {linkInfo.link_expires_at && (
                            <div>
                              Expires: {new Date(linkInfo.link_expires_at).toLocaleString()}
                            </div>
                          )}
                          <div>Version: {linkInfo.access_token_version}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={async () => {
                            try {
                              const result = await api.rotateLink(params.tripId);
                              // Refresh link info
                              const link = await api.getLink(params.tripId);
                              setLinkInfo(link);
                              const t = await api.getTrip(params.tripId);
                              setTrip(t);
                              alert('Link rotated successfully!');
                            } catch (error) {
                              console.error('Failed to rotate link:', error);
                              alert('Failed to rotate link. Please try again.');
                            }
                          }}
                          disabled={linkInfo.link_revoked}
                          style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '3px',
                            border: 'none',
                            background: 'var(--primary)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                          }}
                        >
                          Rotate Link
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to revoke this link? It will no longer be accessible.')) {
                              try {
                                await api.revokeLink(params.tripId);
                                // Refresh link info
                                const link = await api.getLink(params.tripId);
                                setLinkInfo(link);
                                const t = await api.getTrip(params.tripId);
                                setTrip(t);
                                alert('Link revoked successfully!');
                              } catch (error) {
                                console.error('Failed to revoke link:', error);
                                alert('Failed to revoke link. Please try again.');
                              }
                            }
                          }}
                          style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '3px',
                            border: '1px solid var(--border)',
                            background: linkInfo.link_revoked ? 'transparent' : '#E74C3C',
                            color: linkInfo.link_revoked ? 'var(--text)' : 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            opacity: linkInfo.link_revoked ? 0.6 : 1,
                          }}
                        >
                          {linkInfo.link_revoked ? 'Link Revoked' : 'Revoke Link'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div>
                      <p>Link information not available. You may need to be a linked member to manage access links.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          </MainPanel>
        </MainContent>
      </ContentWrapper>
    </PageWrapper>
  );
}


