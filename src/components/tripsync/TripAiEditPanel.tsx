'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { api } from '@/lib/api';
import { AiApplyEditsResponse, AiProposeEditsResponse, ItineraryOp, JsonPatchOp } from '@/types';

const Wrapper = styled.div`
  /* Keep it light like a blog section: no heavy outer borders */
  padding: 0;
`;

const Title = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 900;
  color: ${({ theme }) => theme.text};
`;

const Muted = styled.div`
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.85rem;
`;

const Row = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 12px;
  padding: 0.7rem 0.75rem;
  font-size: 0.92rem;
  line-height: 1.5;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'ghost' }>`
  border: 1px solid ${({ theme, variant }) => (variant === 'primary' ? theme.primary : theme.border)};
  background: ${({ theme, variant }) => (variant === 'primary' ? theme.primary : 'transparent')};
  color: ${({ variant, theme }) => (variant === 'primary' ? '#fff' : theme.text)};
  border-radius: 10px;
  padding: 0.55rem 0.8rem;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const Section = styled.div`
  margin-top: 0.75rem;
`;

const List = styled.ul`
  margin: 0.5rem 0 0 1.1rem;
  padding: 0;
  color: ${({ theme }) => theme.text};
  font-size: 0.88rem;
`;

const Code = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.85rem;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 0.15rem 0.35rem;
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.border};
  opacity: 0.7;
  margin: 0.75rem 0;
`;

const ProposalCard = styled.div`
  margin-top: 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  border-radius: 14px;
  padding: 0.9rem;
`;

const ProposalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  white-space: nowrap;
`;

const ProposalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProposalPane = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 0.75rem;
`;

const ProposalList = styled.ul`
  margin: 0.5rem 0 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const ProposalItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: ${({ theme }) => theme.text};
  font-size: 0.88rem;
  line-height: 1.35;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    margin-top: 0.4rem;
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
  /** Current TripDoc revision for optimistic concurrency. */
  docRevision: number | null;
  editDoc?: boolean;
  editItinerary?: boolean;
  onApplied?: (result: AiApplyEditsResponse) => void;
  onNeedRefresh?: () => Promise<void> | void;
};

function summarizePatch(op: JsonPatchOp): string {
  if ('from' in op) return `${op.op} ${op.from} → ${op.path}`;
  if ('value' in op) return `${op.op} ${op.path}`;
  return `${op.op} ${op.path}`;
}

function summarizeItineraryOp(op: ItineraryOp): string {
  if (op.op === 'create') return `create: ${op.item.title} (${op.item.item_type}) @ ${op.item.start_time}`;
  if (op.op === 'update') return `update: ${op.id}`;
  return `delete: ${op.id}`;
}

export default function TripAiEditPanel({
  title = 'AI Edit by Chat',
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
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<AiProposeEditsResponse | null>(null);
  const [localDocRevision, setLocalDocRevision] = useState<number | null>(null);

  useEffect(() => {
    // Clear any stale proposal when switching trips.
    setProposal(null);
    setError(null);
    setRequest('');
    setLocalDocRevision(null);
  }, [tripId]);

  const effectiveDocRevision = docRevision ?? localDocRevision;

  const handlePropose = async () => {
    if (!request.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.aiProposeEdits(
        tripId,
        { user_request: request.trim(), edit_doc: editDoc, edit_itinerary: editItinerary },
        opts
      );
      setProposal(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to propose edits.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!proposal) return;
    if (!canEdit) {
      alert('Editing is disabled for this view.');
      return;
    }
    // If we weren't given a revision, fetch it once so we can apply safely.
    if (effectiveDocRevision == null) {
      try {
        const d = await api.getTripDoc(tripId, opts);
        setLocalDocRevision(d.revision);
      } catch (e) {
        setError('Trip details not loaded yet. Please try again.');
        return;
      }
    }

    try {
      setApplying(true);
      setError(null);
      const rev = effectiveDocRevision ?? localDocRevision;
      if (rev == null) {
        setError('TripDoc revision not available. Please retry.');
        return;
      }
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

      await onNeedRefresh?.();
      onApplied?.(res);
      setProposal(null);
      setRequest('');
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err?.status === 409) {
        setError('Conflict: TripDoc changed. Reload Details and re-run the AI proposal.');
        return;
      }
      const msg = e instanceof Error ? e.message : 'Failed to apply edits.';
      setError(msg);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Wrapper>
      <Row>
        <Title>{title}</Title>
        <Muted>
          {effectiveDocRevision != null ? (
            <>
              Doc revision: <Code>{effectiveDocRevision}</Code>
            </>
          ) : (
            'Doc revision: —'
          )}
        </Muted>
      </Row>

      {tripAccessToken && !canEdit && (
        <Muted style={{ marginTop: '0.5rem' }}>
          Quicklink view: enable editing to apply changes.
        </Muted>
      )}

      {error && <Muted style={{ marginTop: '0.5rem' }}>{error}</Muted>}

      <Section>
        <Textarea
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="Ask the AI to edit the trip brief/notes and/or add itinerary items…"
          disabled={loading || applying}
        />
      </Section>

      <Row style={{ marginTop: '0.6rem' }}>
        <Button type="button" variant="ghost" onClick={() => setProposal(null)} disabled={!proposal || loading || applying}>
          Clear proposal
        </Button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button type="button" onClick={handlePropose} disabled={loading || applying || !request.trim()}>
            {loading ? 'Proposing…' : 'Propose edits'}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleApply}
            disabled={!proposal || applying || loading || !canEdit}
            title={!canEdit ? 'Enable editing to apply changes' : undefined}
          >
            {applying ? 'Applying…' : 'Apply changes'}
          </Button>
        </div>
      </Row>

      {proposal && (
        <ProposalCard>
          <ProposalHeader>
            <div>
              <Title style={{ margin: 0 }}>Proposed changes</Title>
              <Muted style={{ marginTop: '0.25rem' }}>
                Nonce expires: <Code>{proposal.nonce_expires_at}</Code>
              </Muted>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Badge>Doc: {proposal.trip_doc_patch.length}</Badge>
              <Badge>Itinerary: {proposal.itinerary_ops.length}</Badge>
            </div>
          </ProposalHeader>

          <ProposalGrid>
            {(editDoc || proposal.trip_doc_patch.length > 0) && (
              <ProposalPane>
                <Muted style={{ fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  TripDoc patch
                </Muted>
                {proposal.trip_doc_patch.length === 0 ? (
                  <Muted style={{ marginTop: '0.5rem' }}>—</Muted>
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
                <Muted style={{ fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Itinerary ops
                </Muted>
                {proposal.itinerary_ops.length === 0 ? (
                  <Muted style={{ marginTop: '0.5rem' }}>—</Muted>
                ) : (
                  <ProposalList>
                    {proposal.itinerary_ops.map((op, idx) => (
                      <ProposalItem key={idx}>
                        <span style={{ wordBreak: 'break-word' }}>{summarizeItineraryOp(op)}</span>
                      </ProposalItem>
                    ))}
                  </ProposalList>
                )}
              </ProposalPane>
            )}
          </ProposalGrid>

          {(editDoc || proposal.trip_doc_patch.length > 0) && (editItinerary || proposal.itinerary_ops.length > 0) ? (
            <Divider />
          ) : null}
        </ProposalCard>
      )}
    </Wrapper>
  );
}


