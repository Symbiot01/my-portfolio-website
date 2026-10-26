'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { api } from '@/lib/api';
import { TripRead, TripMemberInfo, BalanceEntry } from '@/types';
import { formatCurrency } from '@/lib/expenseUtils';
import { motion, AnimatePresence } from 'framer-motion';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QuickAddBar = styled.form`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 0.9rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
`;

const Input = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.6rem 0.85rem;
  border-radius: 9px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 0.92rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'ghost' }>`
  padding: 0.6rem 1.1rem;
  border-radius: 9px;
  border: 1px solid
    ${({ variant, theme }) => (variant === 'ghost' ? theme.border : 'transparent')};
  background: ${({ variant, theme }) =>
    variant === 'ghost' ? 'transparent' : theme.primary};
  color: ${({ variant, theme }) => (variant === 'ghost' ? theme.text : '#fff')};
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBanner = styled.div<{ tone: 'success' | 'error' }>`
  padding: 0.6rem 0.9rem;
  border-radius: 9px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${({ tone }) => (tone === 'success' ? '#10B98118' : '#EF444418')};
  color: ${({ tone }) => (tone === 'success' ? '#10B981' : '#EF4444')};
  border: 1px solid ${({ tone }) => (tone === 'success' ? '#10B98155' : '#EF444455')};
`;

const MembersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.85rem;
`;

const MemberCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 13px;
  padding: 1rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary}88;
  }
`;

const MemberAvatar = styled.div<{ linked: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: ${({ linked, theme }) =>
    linked ? `${theme.primary}25` : `${theme.mutedText}20`};
  color: ${({ linked, theme }) => (linked ? theme.primary : theme.mutedText)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 800;
  flex-shrink: 0;
`;

const MemberBadge = styled.span<{ linked: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.16rem 0.5rem;
  font-size: 0.72rem;
  border-radius: 999px;
  background: ${({ linked }) => (linked ? '#10B98120' : '#64748B20')};
  color: ${({ linked }) => (linked ? '#10B981' : '#94A3B8')};
  font-weight: 700;
`;

interface MembersSectionProps {
  tripId: string;
  members: TripMemberInfo[];
  balances?: BalanceEntry[];
  onUpdate: (updatedTrip: TripRead) => void;
  tripAccessToken?: string;
  canEdit?: boolean;
}

export default function MembersSection({
  tripId,
  members,
  balances = [],
  onUpdate,
  tripAccessToken,
  canEdit = true,
}: MembersSectionProps) {
  const [displayName, setDisplayName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ text: string; tone: 'success' | 'error' } | null>(
    null
  );

  const balanceMap = new Map(balances.map((b) => [b.member_id, b.balance]));

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    if (tripAccessToken && !canEdit) {
      setStatus({
        text: 'Enable editing on this share link to add members.',
        tone: 'error',
      });
      return;
    }

    if (tripId === 'demo') {
      const name = displayName.trim();
      onUpdate({
        id: tripId,
        name: 'Demo Trip',
        members: [
          ...members,
          {
            member_id: `demo-${Date.now().toString(36)}`,
            display_name: name,
            linked: false,
          },
        ],
      });
      setDisplayName('');
      setStatus({ text: `Added ${name} to the trip!`, tone: 'success' });
      setIsAdding(false);
      return;
    }

    setIsAdding(true);
    setStatus(null);
    try {
      const updatedTrip = await api.addMember(
        tripId,
        { display_name: displayName.trim() },
        tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined
      );
      onUpdate(updatedTrip);
      setDisplayName('');
      setStatus({ text: `Added ${displayName.trim()} to the trip!`, tone: 'success' });
    } catch (error) {
      setStatus({
        text: error instanceof Error ? error.message : 'Failed to add member.',
        tone: 'error',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleLinkSelf = async (memberId: string) => {
    setLinkingId(memberId);
    setStatus(null);
    if (tripId === 'demo') {
      onUpdate({
        id: tripId,
        name: 'Demo Trip',
        members: members.map((m) =>
          m.member_id === memberId ? { ...m, linked: true } : m
        ),
      });
      setStatus({ text: 'Linked member slot in this demo.', tone: 'success' });
      setLinkingId(null);
      return;
    }
    try {
      const updatedTrip = await api.linkSelfMember(tripId, { member_id: memberId });
      onUpdate(updatedTrip);
      setStatus({ text: 'Linked member slot to your account!', tone: 'success' });
    } catch (error) {
      setStatus({
        text: error instanceof Error ? error.message : 'Failed to link member.',
        tone: 'error',
      });
    } finally {
      setLinkingId(null);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <Container>
      <QuickAddBar onSubmit={handleAddMember}>
        <strong style={{ fontSize: '0.92rem' }}>👥 Add Traveler:</strong>
        <Input
          id="displayName"
          type="text"
          placeholder="Enter friend's name (e.g. Priya, Rahul)…"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          disabled={tripAccessToken ? !canEdit || isAdding : isAdding}
        />
        <Button
          type="submit"
          disabled={
            !displayName.trim() || (tripAccessToken ? !canEdit || isAdding : isAdding)
          }
        >
          {isAdding ? 'Adding…' : '+ Add Member'}
        </Button>
      </QuickAddBar>

      {status && <StatusBanner tone={status.tone}>{status.text}</StatusBanner>}

      <MembersGrid>
        <AnimatePresence>
          {members.map((member, index) => {
            const bal = balanceMap.get(member.member_id) ?? 0;
            return (
              <MemberCard
                key={member.member_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <MemberAvatar linked={member.linked}>
                    {getInitials(member.display_name)}
                  </MemberAvatar>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.96rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {member.display_name}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginTop: '0.2rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <MemberBadge linked={member.linked}>
                        {member.linked ? '✓ Linked Account' : 'Guest Slot'}
                      </MemberBadge>
                      {Math.abs(bal) > 0.01 && (
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: bal > 0 ? '#10B981' : '#EF4444',
                          }}
                        >
                          {bal > 0
                            ? `+${formatCurrency(bal)}`
                            : `-${formatCurrency(Math.abs(bal))}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!tripAccessToken && !member.linked && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={linkingId === member.member_id}
                    onClick={() => void handleLinkSelf(member.member_id)}
                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem' }}
                  >
                    {linkingId === member.member_id ? 'Linking…' : 'Claim Slot'}
                  </Button>
                )}
              </MemberCard>
            );
          })}
        </AnimatePresence>
      </MembersGrid>
    </Container>
  );
}
