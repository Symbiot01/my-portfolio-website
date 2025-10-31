'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { api } from '@/lib/api';
import { TripRead, TripMemberInfo } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const MembersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MemberCard = styled(motion.div)`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const MemberAvatar = styled.div<{ linked: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ linked, theme }) => (linked ? theme.accent : theme.mutedText)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.text};
`;

const MemberBadge = styled.span<{ linked: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
  background: ${({ linked, theme }) => (linked ? theme.accent : theme.mutedText)};
  color: white;
  font-weight: 600;
`;

const AddMemberSection = styled.div`
  background: ${({ theme }) => theme.background};
  border: 2px dashed ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text};
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  align-items: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const InputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.primary};
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.mutedText};
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  border: 1px dashed ${({ theme }) => theme.border};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const SecondaryButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background: transparent;
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.toggleBg};
  }
`;

interface MembersSectionProps {
  tripId: string;
  members: TripMemberInfo[];
  onUpdate: (updatedTrip: TripRead) => void;
}

export default function MembersSection({ tripId, members, onUpdate }: MembersSectionProps) {
  const [displayName, setDisplayName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsAdding(true);
    try {
      const updatedTrip = await api.addMember(tripId, { display_name: displayName });
      onUpdate(updatedTrip);
      setDisplayName('');
      alert('Member added successfully!');
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleLinkSelf = async (memberId: string) => {
    try {
      const updatedTrip = await api.linkSelfMember(tripId, { member_id: memberId });
      onUpdate(updatedTrip);
      alert('Successfully linked to your account!');
    } catch (error) {
      console.error('Failed to link member:', error);
      alert('Failed to link member. Please try again.');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <AddMemberSection>
        <SectionTitle>Add New Member</SectionTitle>
        <Form onSubmit={handleAddMember}>
          <InputGroup>
            <Label htmlFor="displayName">Member Name</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Enter member name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </InputGroup>
          <Button type="submit" disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Member'}
          </Button>
        </Form>
      </AddMemberSection>

      <SectionTitle>Trip Members ({members.length})</SectionTitle>

      {members.length === 0 ? (
        <EmptyState>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <p>No members yet. Add your first member above!</p>
        </EmptyState>
      ) : (
        <MembersGrid>
          <AnimatePresence>
            {members.map((member, index) => (
              <MemberCard
                key={member.member_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MemberAvatar linked={member.linked}>
                  {getInitials(member.display_name)}
                </MemberAvatar>
                <MemberInfo>
                  <MemberName>{member.display_name}</MemberName>
                  <MemberBadge linked={member.linked}>
                    {member.linked ? '✓ Linked' : '○ Unlinked'}
                  </MemberBadge>
                  {!member.linked && (
                    <ActionButtons>
                      <SecondaryButton onClick={() => handleLinkSelf(member.member_id)}>
                        Link to Me
                      </SecondaryButton>
                    </ActionButtons>
                  )}
                </MemberInfo>
              </MemberCard>
            ))}
          </AnimatePresence>
        </MembersGrid>
      )}
    </>
  );
}

