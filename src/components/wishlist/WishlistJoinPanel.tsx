'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { UserPlus } from 'lucide-react';
import { wl } from '@/styles/wishlistTheme';
import { WishlistMemberInfo } from '@/types';
import { MemberAvatar } from '@/components/wishlist/WishlistProductCard';
import { WlOutlineButton, WlPrimaryButton } from '@/components/wishlist/WlButtons';

type Props = {
  members: WishlistMemberInfo[];
  username?: string | null;
  isLoggedIn: boolean;
  busy?: boolean;
  onSignIn: () => void;
  onClaimSlot: (memberId: string) => Promise<void>;
  onJoinAsSelf: () => Promise<void>;
};

const Banner = styled.section`
  background: ${wl.primarySoft};
  border: 1px solid ${wl.border};
  border-radius: ${wl.radiusLg}px;
  padding: ${wl.space(3)};
  margin-bottom: ${wl.space(3)};
  box-shadow: ${wl.shadow};
`;

const Title = styled.h2`
  margin: 0 0 ${wl.space(0.5)};
  font: ${wl.font.headlineSm};
  color: ${wl.primaryDeep};
  display: flex;
  align-items: center;
  gap: ${wl.space(1)};
`;

const Hint = styled.p`
  margin: 0 0 ${wl.space(2)};
  font: ${wl.font.bodySm};
  color: ${wl.inkMuted};
`;

const SlotList = styled.ul`
  list-style: none;
  margin: 0 0 ${wl.space(2)};
  padding: 0;
  display: grid;
  gap: ${wl.space(1)};
`;

const SlotRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${wl.space(1.5)};
  background: ${wl.surface};
  border: 1px solid ${wl.border};
  border-radius: ${wl.radiusSm}px;
  padding: ${wl.space(1.25)} ${wl.space(1.5)};
`;

const SlotMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${wl.space(1.25)};
  min-width: 0;

  span {
    font: ${wl.font.body};
    font-weight: 600;
    color: ${wl.ink};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Actions = styled.div`
  display: grid;
  gap: ${wl.space(1)};
`;

/**
 * Shown to share-link visitors who are not yet a linked member.
 * Lets them claim a pending slot the leader created, or join as themselves.
 */
export function WishlistJoinPanel({
  members,
  username,
  isLoggedIn,
  busy,
  onSignIn,
  onClaimSlot,
  onJoinAsSelf,
}: Props) {
  const [actingId, setActingId] = useState<string | null>(null);
  const pending = members.filter((m) => !m.linked);

  const run = async (key: string, fn: () => Promise<void>) => {
    setActingId(key);
    try {
      await fn();
    } finally {
      setActingId(null);
    }
  };

  return (
    <Banner aria-label="Join this wishlist">
      <Title>
        <UserPlus size={20} />
        Join this wishlist
      </Title>
      {!isLoggedIn ? (
        <>
          <Hint>
            You can browse as a guest. Sign in to claim your name and keep your list tied to your
            account.
          </Hint>
          <WlPrimaryButton type="button" onClick={onSignIn} disabled={busy} style={{ width: 'auto' }}>
            Sign in to claim a slot
          </WlPrimaryButton>
        </>
      ) : (
        <>
          <Hint>
            {pending.length
              ? 'Pick the name the host set aside for you, or join with a new slot.'
              : 'No pending invites yet — join with your account to get your own list.'}
          </Hint>
          {pending.length > 0 && (
            <SlotList>
              {pending.map((m, idx) => (
                <SlotRow key={m.member_id}>
                  <SlotMeta>
                    <MemberAvatar name={m.display_name} tone={idx} />
                    <span>{m.display_name}</span>
                  </SlotMeta>
                  <WlOutlineButton
                    type="button"
                    disabled={busy || actingId !== null}
                    onClick={() => void run(m.member_id, () => onClaimSlot(m.member_id))}
                    style={{ width: 'auto', padding: '0.5rem 0.85rem' }}
                  >
                    {actingId === m.member_id ? 'Linking…' : `I'm ${m.display_name}`}
                  </WlOutlineButton>
                </SlotRow>
              ))}
            </SlotList>
          )}
          <Actions>
            <WlPrimaryButton
              type="button"
              disabled={busy || actingId !== null}
              onClick={() => void run('new', onJoinAsSelf)}
              style={{ width: 'auto' }}
            >
              {actingId === 'new'
                ? 'Joining…'
                : `Join as ${username?.trim() || 'my account'}`}
            </WlPrimaryButton>
          </Actions>
        </>
      )}
    </Banner>
  );
}
