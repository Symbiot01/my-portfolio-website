'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { api } from '@/lib/api';
import {
  AiApplyEditsResponse,
  AiProposeEditsResponse,
  ItineraryOp,
  JsonPatchOp,
} from '@/types';

const Wrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  border-radius: 14px;
  padding: 1rem;
`;

const HeaderRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 0.98rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 0.45rem;
`;

const Muted = styled.div`
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.82rem;
`;

const PromptPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.65rem;
`;

const PromptPill = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.65rem;
  align-items: stretch;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const Textarea = styled.textarea`
  flex: 1;
  min-height: 64px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  font-size: 0.88rem;
  line-height: 1.45;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'ghost' }>`
  border: 1px solid
    ${({ theme, variant }) =>
      variant === 'primary' ? theme.primary : theme.border};
  background: ${({ theme, variant }) =>
    variant === 'primary' ? theme.primary : 'transparent'};
  color: ${({ variant, theme }) =>
    variant === 'primary' ? '#fff' : theme.text};
  border-radius: 9px;
  padding: 0.5rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Code = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.78rem;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 0.1rem 0.35rem;
`;

const StatusNotice = styled.div<{ tone: 'error' | 'success' | 'info' }>`
  margin-top: 0.6rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  border: 1px solid
    ${({ tone }) =>
      tone === 'error'
        ? '#EF444455'
        : tone === 'success'
        ? '#10B98155'
        : '#6366F155'};
  background: ${({ tone }) =>
    tone === 'error'
      ? '#EF444415'
      : tone === 'success'
      ? '#10B98115'
      : '#6366F115'};
  color: ${({ tone, theme }) =>
    tone === 'error'
      ? '#EF4444'
      : tone === 'success'
      ? '#10B981'
      : theme.text};
`;

const ProposalCard = styled.div`
  margin-top: 0.75rem;
  border: 1px solid ${({ theme }) => theme.primary}66;
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 0.85rem;
`;

const ProposalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  font-size: 0.72rem;
  font-weight: 800;
`;

const ProposalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  margin-top: 0.65rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProposalPane = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  border-radius: 10px;
  padding: 0.65rem;
`;

const ProposalList = styled.ul`
  margin: 0.4rem 0 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const ProposalItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  color: ${({ theme }) => theme.text};
  font-size: 0.82rem;
  line-height: 1.35;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    margin-top: 0.38rem;
    border-radius: 999px;
    background: ${({ theme }) => theme.primary};
    flex: 0 0 auto;
  }
`;

type Props = {
  title?: string;
  tripId: string;
  tripAccessToken?: string;
  canEdit?: boolean;
  docRevision: number | null;
  editDoc?: boolean;
  editItinerary?: boolean;
  onApplied?: (result: AiApplyEditsResponse) => void;
  onNeedRefresh?: () => Promise<void> | void;
};

function summarizePatch(op: JsonPatchOp): string {
  if ('from' in op) return `${op.op} ${op.from} → ${op.path}`;
  if ('value' in op) {
    const valPreview =
      typeof op.value === 'string'
        ? op.value.length > 60
          ? `${op.value.slice(0, 60)}…`
          : op.value
        : JSON.stringify(op.value);
    return `${op.op} ${op.path}: ${valPreview}`;
  }
  return `${op.op} ${op.path}`;
}

function summarizeItineraryOp(op: ItineraryOp): string {
  if (op.op === 'create') {
    return `+ Create "${op.item.title}" (${op.item.item_type}) @ ${op.item.start_time}`;
  }
  if (op.op === 'update') {
    const fields = Object.keys(op.set || op.patch || {}).join(', ');
    return `✎ Update item ${op.id}${fields ? ` (${fields})` : ''}`;
  }
  return `🗑 Delete item ${op.id}`;
}

export default function TripAiEditPanel({
  title = '✨ AI Trip Co-Pilot',
  tripId,
  tripAccessToken,
  canEdit = false,
  docRevision,
  editDoc = true,
  editItinerary = true,
  onApplied,
  onNeedRefresh,
}: Props) {
  const opts = useMemo(
    () => (tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined),
    [tripAccessToken, canEdit]
  );

  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [status, setStatus] = useState<{
    text: string;
    tone: 'error' | 'success' | 'info';
  } | null>(null);
  const [proposal, setProposal] = useState<AiProposeEditsResponse | null>(null);
  const [localDocRevision, setLocalDocRevision] = useState<number | null>(null);

  useEffect(() => {
    setProposal(null);
    setStatus(null);
    setRequest('');
    setLocalDocRevision(null);
  }, [tripId]);

  const effectiveDocRevision = docRevision ?? localDocRevision;

  const quickPrompts = useMemo(() => {
    if (editItinerary && !editDoc) {
      return [
        'Add morning coffee & sightseeing on Day 1 at 09:30',
        'Create a dinner reservation activity at 20:00',
        'Add airport transfer on the final day',
      ];
    }
    return [
      'Write a concise trip brief and packing checklist in shared notes',
      'Structure shared notes with emergency contacts, Wi-Fi, and house rules',
      'Add a full Day 1 arrival, check-in, and dinner itinerary',
    ];
  }, [editDoc, editItinerary]);

  const handlePropose = async (customText?: string) => {
    const promptText = (customText ?? request).trim();
    if (!promptText) return;
    if (customText) setRequest(customText);

    try {
      setLoading(true);
      setStatus(null);
      const res = await api.aiProposeEdits(
        tripId,
        {
          user_request: promptText,
          edit_doc: editDoc,
          edit_itinerary: editItinerary,
        },
        opts
      );
      setProposal(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to propose edits.';
      setStatus({ text: msg, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!proposal) return;
    if (!canEdit) {
      setStatus({
        text: 'Editing is disabled for this view. Enable editing first.',
        tone: 'error',
      });
      return;
    }

    let rev = effectiveDocRevision;
    if (rev == null) {
      try {
        const d = await api.getTripDoc(tripId, opts);
        rev = d.revision;
        setLocalDocRevision(d.revision);
      } catch {
        setStatus({
          text: 'Could not load current TripDoc revision. Please try again.',
          tone: 'error',
        });
        return;
      }
    }

    try {
      setApplying(true);
      setStatus(null);
      const res = await api.aiApplyEdits(
        tripId,
        {
          client_revision: rev,
          nonce: proposal.nonce,
          trip_doc_patch: proposal.trip_doc_patch,
          itinerary_ops: proposal.itinerary_ops,
        },
        opts
      );

      if (res.trip_doc?.revision) {
        setLocalDocRevision(res.trip_doc.revision);
      }
      await onNeedRefresh?.();
      onApplied?.(res);
      setProposal(null);
      setRequest('');
      setStatus({ text: 'AI changes applied to trip!', tone: 'success' });
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err?.status === 409) {
        setStatus({
          text: 'Conflict: Trip details changed elsewhere. Reload and re-propose.',
          tone: 'error',
        });
        return;
      }
      const msg = e instanceof Error ? e.message : 'Failed to apply edits.';
      setStatus({ text: msg, tone: 'error' });
    } finally {
      setApplying(false);
    }
  };

  return (
    <Wrapper>
      <HeaderRow>
        <Title>{title}</Title>
        <Muted>
          {effectiveDocRevision != null ? (
            <>
              Rev <Code>#{effectiveDocRevision}</Code>
            </>
          ) : (
            'AI-assisted structured updates'
          )}
        </Muted>
      </HeaderRow>

      <PromptPills>
        {quickPrompts.map((p) => (
          <PromptPill
            key={p}
            type="button"
            disabled={loading || applying}
            onClick={() => void handlePropose(p)}
          >
            ⚡ {p}
          </PromptPill>
        ))}
      </PromptPills>

      <InputRow>
        <Textarea
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="Describe changes in plain English (e.g., 'Add a 2-night hotel stay in Reykjavik and morning whale watching')…"
          disabled={loading || applying}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="button"
            variant="primary"
            onClick={() => void handlePropose()}
            disabled={loading || applying || !request.trim()}
          >
            {loading ? 'Thinking…' : '✨ Propose'}
          </Button>
          {proposal && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setProposal(null)}
              disabled={loading || applying}
            >
              Clear
            </Button>
          )}
        </div>
      </InputRow>

      {status && <StatusNotice tone={status.tone}>{status.text}</StatusNotice>}

      {proposal && (
        <ProposalCard>
          <ProposalHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '0.9rem' }}>Proposed Edits Ready</strong>
              <Badge>Doc patches: {proposal.trip_doc_patch.length}</Badge>
              <Badge>Itinerary ops: {proposal.itinerary_ops.length}</Badge>
            </div>
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <Button
                type="button"
                variant="primary"
                onClick={() => void handleApply()}
                disabled={applying || loading || !canEdit}
              >
                {applying ? 'Applying…' : '✓ Apply Now'}
              </Button>
            </div>
          </ProposalHeader>

          <ProposalGrid>
            {(editDoc || proposal.trip_doc_patch.length > 0) && (
              <ProposalPane>
                <Muted style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem' }}>
                  Trip Details Patch
                </Muted>
                {proposal.trip_doc_patch.length === 0 ? (
                  <Muted style={{ marginTop: '0.35rem' }}>No document changes</Muted>
                ) : (
                  <ProposalList>
                    {proposal.trip_doc_patch.map((op, idx) => (
                      <ProposalItem key={idx}>
                        <span style={{ wordBreak: 'break-word' }}>{summarizePatch(op)}</span>
                      </ProposalItem>
                    ))}
                  </ProposalList>
                )}
              </ProposalPane>
            )}

            {(editItinerary || proposal.itinerary_ops.length > 0) && (
              <ProposalPane>
                <Muted style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem' }}>
                  Itinerary Operations
                </Muted>
                {proposal.itinerary_ops.length === 0 ? (
                  <Muted style={{ marginTop: '0.35rem' }}>No itinerary changes</Muted>
                ) : (
                  <ProposalList>
                    {proposal.itinerary_ops.map((op, idx) => (
                      <ProposalItem key={idx}>
                        <span style={{ wordBreak: 'break-word' }}>
                          {summarizeItineraryOp(op)}
                        </span>
                      </ProposalItem>
                    ))}
                  </ProposalList>
                )}
              </ProposalPane>
            )}
          </ProposalGrid>
        </ProposalCard>
      )}
    </Wrapper>
  );
}
