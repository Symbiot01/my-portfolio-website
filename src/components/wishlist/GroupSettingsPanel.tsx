'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import {
  AlertTriangle,
  Ban,
  Copy,
  EyeOff,
  Link2,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api';
import { WishlistGroup } from '@/types';
import { wl } from '@/styles/wishlistTheme';
import { MemberAvatar } from './WishlistProductCard';
import {
  WlDangerButton,
  WlGhostButton,
  WlOutlineButton,
  WlPrimaryButton,
} from './WlButtons';

type Props = {
  group: WishlistGroup;
  shareUrl: string | null;
  isLeader: boolean;
  isLinked: boolean;
  reserveName: string;
  onReserveNameChange: (v: string) => void;
  onRefresh: () => Promise<void>;
  onGroupUpdated: (g: WishlistGroup) => void;
  onDeleted: () => void;
  onLeft: () => void;
  onError: (msg: string | null) => void;
};

const PageTitle = styled.h1`
  margin: 0 0 ${wl.space(3)};
  font: ${wl.font.headline};
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: ${wl.primaryDeep};
  letter-spacing: -0.02em;
`;

const Grid = styled.div`
  display: grid;
  gap: ${wl.space(2.5)};

  @media (min-width: 900px) {
    grid-template-columns: 1.1fr 0.9fr;
    align-items: start;
  }
`;

const Card = styled.section<{ $tone?: 'default' | 'spoiler' | 'danger' }>`
  background: ${({ $tone }) =>
    $tone === 'spoiler' ? wl.primarySoft : $tone === 'danger' ? '#FFF5F5' : wl.surface};
  border: 1px solid
    ${({ $tone }) => ($tone === 'danger' ? '#F5C6CB' : $tone === 'spoiler' ? '#E9D5FF' : wl.border)};
  border-radius: ${wl.radiusLg}px;
  padding: ${wl.space(2.5)};
  box-shadow: ${wl.shadow};
`;

const CardTitle = styled.h2`
  margin: 0 0 ${wl.space(1)};
  font: ${wl.font.headlineSm};
  font-size: 1.15rem;
  color: ${wl.primaryDeep};
`;

const CardHint = styled.p`
  margin: 0 0 ${wl.space(2)};
  font: ${wl.font.bodySm};
  color: ${wl.inkMuted};
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
  font: ${wl.font.label};
  color: ${wl.ink};
  margin-bottom: ${wl.space(2)};

  input,
  textarea {
    font: ${wl.font.body};
    padding: ${wl.space(1.5)} ${wl.space(2)};
    border-radius: ${wl.radiusSm}px;
    border: 1px solid ${wl.borderStrong};
    background: ${wl.canvas};
    color: ${wl.ink};
  }
  textarea {
    min-height: 88px;
    resize: vertical;
  }
`;

const LinkRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${wl.space(1)};
  margin-bottom: ${wl.space(2)};
`;

const LinkInput = styled.input`
  font: ${wl.font.bodySm};
  padding: ${wl.space(1.5)} ${wl.space(2)};
  border-radius: ${wl.radiusSm}px;
  border: 1px solid ${wl.border};
  background: ${wl.canvas};
  color: ${wl.inkMuted};
  min-width: 0;
`;

const ActionPair = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${wl.space(1.5)};
`;

const SubPanel = styled.div`
  border: 1px solid ${wl.border};
  border-radius: ${wl.radiusSm}px;
  padding: ${wl.space(1.5)};
  margin-top: ${wl.space(1.5)};
  background: ${wl.surface};
`;

const PrefRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${wl.space(2)};
  padding: ${wl.space(1.5)} 0;

  & + & {
    border-top: 1px solid ${wl.border};
  }
`;

const PrefText = styled.div`
  flex: 1;
  min-width: 0;
  h3 {
    margin: 0 0 4px;
    font: ${wl.font.label};
    color: ${wl.ink};
  }
  p {
    margin: 0;
    font: ${wl.font.bodySm};
    color: ${wl.inkMuted};
  }
`;

const Toggle = styled.button<{ $on: boolean }>`
  width: 48px;
  height: 28px;
  border-radius: ${wl.radiusPill}px;
  border: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  background: ${({ $on }) => ($on ? wl.primaryDeep : wl.borderStrong)};
  transition: background 0.15s ease;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${({ $on }) => ($on ? '23px' : '3px')};
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.15s ease;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const Stepper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid ${wl.border};
  border-radius: ${wl.radiusSm}px;
  padding: 4px;
  background: ${wl.surface};
`;

const StepBtn = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: ${wl.canvas};
  color: ${wl.primaryDeep};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const MemberList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const MemberRow = styled.li<{ $pending?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${wl.space(1.5)};
  padding: ${wl.space(1.5)} 0;
  border-bottom: 1px solid ${wl.border};
  opacity: ${({ $pending }) => ($pending ? 0.72 : 1)};

  &:last-child {
    border-bottom: none;
  }

  &:hover .remove-label {
    opacity: 1;
    max-width: 120px;
  }

  @media (hover: none) {
    .remove-label {
      opacity: 1;
      max-width: 120px;
    }
  }
`;

const MemberMeta = styled.div<{ $pending?: boolean }>`
  flex: 1;
  min-width: 0;
  strong {
    display: block;
    font: ${wl.font.label};
    color: ${({ $pending }) => ($pending ? wl.inkMuted : wl.ink)};
    font-style: ${({ $pending }) => ($pending ? 'italic' : 'normal')};
  }
`;

const Badge = styled.span<{ $tone: 'owner' | 'linked' | 'unlinked' }>`
  display: inline-block;
  margin-top: 4px;
  font: ${wl.font.labelSm};
  padding: 2px 8px;
  border-radius: ${wl.radiusPill}px;
  background: ${({ $tone }) =>
    $tone === 'owner' ? wl.primarySoft : $tone === 'linked' ? wl.secondarySoft : wl.canvas};
  color: ${({ $tone }) =>
    $tone === 'owner' ? wl.primaryDeep : $tone === 'linked' ? wl.secondary : wl.inkMuted};
`;

const RemoveWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const RemoveLabel = styled.span`
  font: ${wl.font.labelSm};
  color: ${wl.danger};
  opacity: 0;
  max-width: 0;
  overflow: hidden;
  white-space: nowrap;
  transition: opacity 0.15s ease, max-width 0.15s ease;
`;

const IconBtn = styled.button`
  border: none;
  background: transparent;
  color: ${wl.inkFaint};
  cursor: pointer;
  padding: ${wl.space(1)};
  border-radius: ${wl.radiusSm}px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: ${wl.danger};
    background: ${wl.dangerSoft};
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const CapPill = styled.span`
  margin-left: auto;
  font: ${wl.font.labelSm};
  color: #fff;
  background: ${wl.primaryDeep};
  padding: 4px 10px;
  border-radius: ${wl.radiusPill}px;
`;

const CardTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${wl.space(1)};
  margin-bottom: ${wl.space(1.5)};
`;

const DashedAdd = styled.button`
  width: 100%;
  margin-top: ${wl.space(2)};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${wl.space(1)};
  padding: ${wl.space(1.5)} ${wl.space(2)};
  border: 1.5px dashed ${wl.primary};
  border-radius: ${wl.radiusSm}px;
  background: ${wl.primarySoft};
  color: ${wl.primaryDeep};
  font: ${wl.font.label};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: #ebe0f7;
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const AddSlotForm = styled.form`
  margin-top: ${wl.space(1.5)};
  display: grid;
  gap: ${wl.space(1)};
`;

const DangerTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${wl.space(1)};
  color: ${wl.danger};
  font: ${wl.font.headlineSm};
  font-size: 1.05rem;
  margin-bottom: ${wl.space(1)};
`;

export function GroupSettingsPanel({
  group,
  shareUrl,
  isLeader,
  isLinked,
  reserveName,
  onReserveNameChange,
  onRefresh,
  onGroupUpdated,
  onDeleted,
  onLeft,
  onError,
}: Props) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [spoiler, setSpoiler] = useState(group.settings.owners_can_see_fulfillment);
  const [cap, setCap] = useState(group.settings.max_active_reservations);
  const [busy, setBusy] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [showAddSlot, setShowAddSlot] = useState(false);

  useEffect(() => {
    setName(group.name);
    setDescription(group.description || '');
    setSpoiler(group.settings.owners_can_see_fulfillment);
    setCap(group.settings.max_active_reservations);
  }, [group]);

  const memberCap = group.member_cap ?? 20;
  const displayShare = useMemo(() => {
    if (!shareUrl) return group.link_revoked ? 'Link revoked' : 'Sign in as a member to view link';
    try {
      const u = new URL(shareUrl);
      const parts = u.pathname.split('/').filter(Boolean);
      const token = parts[parts.length - 1] || '';
      const short = token.length > 10 ? `${token.slice(0, 8)}…` : token;
      return `${u.host}/wishlist/access/${short}`;
    } catch {
      return shareUrl;
    }
  }, [shareUrl, group.link_revoked]);

  const saveGeneral = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLeader) {
      onError('Only the group leader can edit general info');
      return;
    }
    setBusy(true);
    onError(null);
    try {
      const updated = await api.updateWishlistGroup(group.id, {
        name: name.trim(),
        description: description.trim() || null,
      });
      onGroupUpdated(updated);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  const persistPrefs = async (next: { spoiler?: boolean; cap?: number }) => {
    if (!isLeader) {
      onError('Only the group leader can change preferences');
      return;
    }
    const nextSpoiler = next.spoiler ?? spoiler;
    const nextCap = next.cap ?? cap;
    setBusy(true);
    onError(null);
    try {
      const updated = await api.updateWishlistGroup(group.id, {
        owners_can_see_fulfillment: nextSpoiler,
        max_active_reservations: nextCap,
      });
      setSpoiler(updated.settings.owners_can_see_fulfillment);
      setCap(updated.settings.max_active_reservations);
      onGroupUpdated(updated);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to update preferences');
      setSpoiler(group.settings.owners_can_see_fulfillment);
      setCap(group.settings.max_active_reservations);
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
  };

  const onRotate = async () => {
    if (!isLinked) return;
    if (
      !window.confirm(
        'Rotate the share link? Old links stop working and all guest reservations will be released.'
      )
    ) {
      return;
    }
    setBusy(true);
    onError(null);
    try {
      await api.rotateWishlistLink(group.id);
      await onRefresh();
    } catch {
      onError('Failed to rotate link');
    } finally {
      setBusy(false);
    }
  };

  const onRevoke = async () => {
    if (!isLinked) return;
    if (!window.confirm('Revoke the share link? Guests will lose access until a new rotate.')) {
      return;
    }
    setBusy(true);
    onError(null);
    try {
      await api.revokeWishlistLink(group.id);
      await onRefresh();
    } catch {
      onError('Failed to revoke link');
    } finally {
      setBusy(false);
    }
  };

  const onAddMember = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    onError(null);
    try {
      const updated = await api.addWishlistMember(group.id, memberName);
      setMemberName('');
      setShowAddSlot(false);
      onGroupUpdated(updated);
      await onRefresh();
    } catch {
      onError('Failed to add member slot');
    } finally {
      setBusy(false);
    }
  };

  const onRemoveMember = async (memberId: string, label: string, pending: boolean) => {
    if (!isLeader) return;
    const msg = pending
      ? `Cancel invite for “${label}”? This frees a member slot.`
      : `Remove “${label}” and their list from this group? Their products will be deleted.`;
    if (!window.confirm(msg)) return;
    setBusy(true);
    onError(null);
    try {
      const updated = await api.removeWishlistMember(group.id, memberId);
      onGroupUpdated(updated);
      await onRefresh();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setBusy(false);
    }
  };

  const onLeave = async () => {
    if (!window.confirm('Leave this group? Your slot will become unlinked.')) return;
    setBusy(true);
    onError(null);
    try {
      await api.leaveWishlistGroup(group.id);
      onLeft();
    } catch {
      onError('Failed to leave group');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!isLeader) return;
    if (
      !window.confirm(
        'Delete this group permanently? All products, reservations, and purchases will be removed.'
      )
    ) {
      return;
    }
    setBusy(true);
    onError(null);
    try {
      await api.deleteWishlistGroup(group.id);
      onDeleted();
    } catch {
      onError('Failed to delete group');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageTitle>Group Settings</PageTitle>
      <Grid>
        <div>
          <Card>
            <CardTitleRow>
              <Pencil size={18} color={wl.primaryDeep} />
              <CardTitle style={{ margin: 0 }}>General Info</CardTitle>
            </CardTitleRow>
            <form onSubmit={saveGeneral}>
              <Field>
                Group Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isLeader || busy}
                  maxLength={100}
                  required
                />
              </Field>
              <Field>
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!isLeader || busy}
                  maxLength={2000}
                />
              </Field>
              {isLeader && (
                <WlPrimaryButton type="submit" disabled={busy} style={{ width: 'auto', minWidth: 140 }}>
                  Save Changes
                </WlPrimaryButton>
              )}
            </form>
          </Card>

          <Card style={{ marginTop: wl.space(2.5) }}>
            <CardTitleRow>
              <Link2 size={18} color={wl.primaryDeep} />
              <CardTitle style={{ margin: 0 }}>Share Link</CardTitle>
            </CardTitleRow>
            <CardHint>Invite friends and family to join this wishlist group.</CardHint>
            <LinkRow>
              <LinkInput readOnly value={displayShare} aria-label="Share link" />
              <WlPrimaryButton
                type="button"
                onClick={onCopy}
                disabled={!shareUrl || busy}
                style={{ width: 'auto', paddingInline: 16 }}
                aria-label="Copy link"
              >
                <Copy size={16} />
              </WlPrimaryButton>
            </LinkRow>

            <SubPanel>
              <CardHint style={{ marginBottom: wl.space(1) }}>
                Rotating generates a new URL and releases guest reservations (member reservations stay).
              </CardHint>
              <WlOutlineButton type="button" onClick={onRotate} disabled={!isLinked || busy}>
                <RefreshCw size={16} /> Rotate Link
              </WlOutlineButton>
            </SubPanel>
            <SubPanel>
              <CardHint style={{ marginBottom: wl.space(1), color: wl.danger }}>
                Revoking disables sharing entirely until you rotate a new link.
              </CardHint>
              <WlDangerButton
                type="button"
                onClick={onRevoke}
                disabled={!isLinked || busy}
                style={{
                  background: wl.surface,
                  color: wl.danger,
                  border: `1px solid ${wl.danger}`,
                  width: 'auto',
                }}
              >
                <Ban size={16} /> Revoke Link
              </WlDangerButton>
              {group.link_revoked && (
                <CardHint style={{ marginTop: wl.space(1), color: wl.danger }}>
                  Link is currently revoked. Rotate to issue a new one.
                </CardHint>
              )}
            </SubPanel>
          </Card>

          <Card style={{ marginTop: wl.space(2.5) }} className="mobile-prefs">
            <CardTitle>Group Preferences</CardTitle>
            <PrefRow>
              <PrefText>
                <h3>Show fulfillment to owners</h3>
                <p>
                  Allow list owners to see if items have been reserved or bought. Turning this off
                  maintains the surprise.
                </p>
              </PrefText>
              <Toggle
                type="button"
                $on={spoiler}
                aria-pressed={spoiler}
                aria-label="Owners can see fulfillment"
                disabled={!isLeader || busy}
                onClick={() => {
                  const next = !spoiler;
                  setSpoiler(next);
                  void persistPrefs({ spoiler: next });
                }}
              />
            </PrefRow>
            <PrefRow>
              <PrefText>
                <h3>Reservation Cap</h3>
                <p>Max active reservations per person.</p>
              </PrefText>
              <Stepper>
                <StepBtn
                  type="button"
                  aria-label="Decrease cap"
                  disabled={!isLeader || busy || cap <= 1}
                  onClick={() => {
                    const next = Math.max(1, cap - 1);
                    setCap(next);
                    void persistPrefs({ cap: next });
                  }}
                >
                  <Minus size={14} />
                </StepBtn>
                <strong style={{ minWidth: 16, textAlign: 'center' }}>{cap}</strong>
                <StepBtn
                  type="button"
                  aria-label="Increase cap"
                  disabled={!isLeader || busy || cap >= 5}
                  onClick={() => {
                    const next = Math.min(5, cap + 1);
                    setCap(next);
                    void persistPrefs({ cap: next });
                  }}
                >
                  <Plus size={14} />
                </StepBtn>
              </Stepper>
            </PrefRow>
            <PrefRow>
              <PrefText>
                <h3>Reserve as</h3>
                <p>Name shown when you reserve as a guest or member.</p>
              </PrefText>
              <input
                value={reserveName}
                onChange={(e) => onReserveNameChange(e.target.value)}
                placeholder="Your name"
                style={{
                  font: wl.font.bodySm,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: `1px solid ${wl.border}`,
                  maxWidth: 160,
                }}
              />
            </PrefRow>
          </Card>
        </div>

        <div>
          <Card $tone="spoiler" className="desktop-spoiler">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <EyeOff size={20} color={wl.primaryDeep} />
              <CardTitle style={{ margin: 0 }}>Spoiler Mode</CardTitle>
              <div style={{ marginLeft: 'auto' }}>
                <Toggle
                  type="button"
                  $on={spoiler}
                  aria-pressed={spoiler}
                  disabled={!isLeader || busy}
                  onClick={() => {
                    const next = !spoiler;
                    setSpoiler(next);
                    void persistPrefs({ spoiler: next });
                  }}
                />
              </div>
            </div>
            <CardHint style={{ marginBottom: 0 }}>
              {spoiler
                ? 'Owners can see fulfillment.'
                : 'Owners cannot see reserved/bought details — surprise preserved.'}
            </CardHint>
          </Card>

          <Card style={{ marginTop: wl.space(2.5) }}>
            <CardTitleRow>
              <Users size={18} color={wl.primaryDeep} />
              <CardTitle style={{ margin: 0 }}>Members</CardTitle>
              <CapPill>
                {group.members.length} / {memberCap} Slots
              </CapPill>
            </CardTitleRow>
            <MemberList>
              {group.members.map((m, idx) => {
                const pending = !m.linked;
                const canRemove = isLeader && !m.is_you;
                return (
                  <MemberRow key={m.member_id} $pending={pending}>
                    <MemberAvatar name={m.display_name} tone={idx} size={40} />
                    <MemberMeta $pending={pending}>
                      <strong>
                        {m.display_name}
                        {m.is_you ? ' (You)' : ''}
                      </strong>
                      <Badge $tone={m.is_leader ? 'owner' : m.linked ? 'linked' : 'unlinked'}>
                        {m.is_leader ? 'Owner' : m.linked ? 'Linked' : 'Pending Invite'}
                      </Badge>
                    </MemberMeta>
                    {canRemove && (
                      <RemoveWrap>
                        <RemoveLabel className="remove-label">
                          {pending ? 'Cancel Invite' : 'Remove'}
                        </RemoveLabel>
                        <IconBtn
                          type="button"
                          aria-label={pending ? `Cancel invite for ${m.display_name}` : `Remove ${m.display_name}`}
                          disabled={busy}
                          onClick={() => onRemoveMember(m.member_id, m.display_name, pending)}
                        >
                          <Trash2 size={18} />
                        </IconBtn>
                      </RemoveWrap>
                    )}
                  </MemberRow>
                );
              })}
            </MemberList>

            {group.members.length < memberCap && isLeader && (
              <>
                {!showAddSlot ? (
                  <DashedAdd type="button" disabled={busy} onClick={() => setShowAddSlot(true)}>
                    <Plus size={16} /> Add Member Slot
                  </DashedAdd>
                ) : (
                  <AddSlotForm onSubmit={onAddMember}>
                    <Field style={{ marginBottom: 0 }}>
                      Display name
                      <input
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        placeholder="e.g. Pending Invite"
                        required
                        maxLength={100}
                        disabled={busy}
                        autoFocus
                      />
                    </Field>
                    <ActionPair>
                      <WlOutlineButton type="button" onClick={() => setShowAddSlot(false)} disabled={busy}>
                        Cancel
                      </WlOutlineButton>
                      <WlPrimaryButton type="submit" disabled={busy}>
                        Add Slot
                      </WlPrimaryButton>
                    </ActionPair>
                  </AddSlotForm>
                )}
              </>
            )}
          </Card>

          {isLeader && (
            <Card $tone="danger" style={{ marginTop: wl.space(2.5) }}>
              <DangerTitle>
                <AlertTriangle size={20} /> Danger Zone
              </DangerTitle>
              <CardHint>Deleting a group is permanent and cannot be undone.</CardHint>
              <WlDangerButton
                type="button"
                onClick={onDelete}
                disabled={busy}
                style={{
                  background: wl.surface,
                  color: wl.danger,
                  border: `1px solid ${wl.danger}`,
                  width: 'auto',
                }}
              >
                Delete Group
              </WlDangerButton>
            </Card>
          )}

          {isLinked && (
            <div style={{ marginTop: wl.space(2.5) }}>
              <WlDangerButton
                type="button"
                onClick={onLeave}
                disabled={busy}
                style={{
                  background: wl.surface,
                  color: wl.danger,
                  border: `1px solid ${wl.danger}`,
                }}
              >
                Leave Group
              </WlDangerButton>
            </div>
          )}
        </div>
      </Grid>

      <style>{`
        @media (max-width: 899px) {
          .desktop-spoiler { display: none !important; }
        }
        @media (min-width: 900px) {
          .mobile-prefs { display: none !important; }
        }
      `}</style>
    </div>
  );
}
