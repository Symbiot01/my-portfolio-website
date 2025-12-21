'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { api } from '@/lib/api';
import { JsonPatchOp, TripDoc } from '@/types';
import TripAiEditPanel from '@/components/tripsync/TripAiEditPanel';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  max-width: 1100px;
`;

const Surface = styled.div`
  /* Blog-like: avoid “box within box” chrome, but keep readable spacing */
  padding: 0;
`;

const Title = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.15rem;
  font-weight: 900;
  color: ${({ theme }) => theme.text};
`;

const Label = styled.label`
  display: block;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.mutedText};
  font-weight: 800;
  margin: 0.2rem 0 0.3rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
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

const Row = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
`;

const Muted = styled.div`
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.85rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' }>`
  border: 1px solid ${({ theme, variant }) => (variant === 'primary' ? theme.primary : theme.border)};
  background: ${({ theme, variant }) => (variant === 'primary' ? theme.primary : 'transparent')};
  color: ${({ variant, theme }) => (variant === 'primary' ? '#fff' : theme.text)};
  border-radius: 10px;
  padding: 0.55rem 0.8rem;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

type Props = {
  tripId: string;
  tripAccessToken?: string;
  canEdit?: boolean;
  onDocLoaded?: (doc: TripDoc) => void;
  onDocUpdated?: (doc: TripDoc) => void;
  onNeedRefresh?: () => Promise<void> | void;
};

export default function TripDetailsSection({
  tripId,
  tripAccessToken,
  canEdit = false,
  onDocLoaded,
  onDocUpdated,
  onNeedRefresh,
}: Props) {
  const opts = useMemo(
    () => (tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined),
    [tripAccessToken, canEdit]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doc, setDoc] = useState<TripDoc | null>(null);

  const [brief, setBrief] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const d = await api.getTripDoc(tripId, opts);
        setDoc(d);
        setBrief(d.natural_language_trip_brief ?? '');
        setNotes(d.shared_notes ?? '');
        onDocLoaded?.(d);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load trip details.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, tripAccessToken]);

  const hasChanges = useMemo(() => {
    if (!doc) return false;
    return (
      (brief ?? '') !== (doc.natural_language_trip_brief ?? '') ||
      (notes ?? '') !== (doc.shared_notes ?? '')
    );
  }, [doc, brief, notes]);

  const buildPatch = (): JsonPatchOp[] => {
    if (!doc) return [];
    const ops: JsonPatchOp[] = [];
    if ((brief ?? '') !== (doc.natural_language_trip_brief ?? '')) {
      ops.push({ op: 'replace', path: '/natural_language_trip_brief', value: brief ?? '' });
    }
    if ((notes ?? '') !== (doc.shared_notes ?? '')) {
      ops.push({ op: 'replace', path: '/shared_notes', value: notes ?? '' });
    }
    return ops;
  };

  const reloadLatest = async () => {
    const d = await api.getTripDoc(tripId, opts);
    setDoc(d);
    setBrief(d.natural_language_trip_brief ?? '');
    setNotes(d.shared_notes ?? '');
    onDocLoaded?.(d);
  };

  const handleSave = async () => {
    if (!doc) return;
    if (!canEdit) {
      alert('Editing is disabled for this view.');
      return;
    }

    const patch = buildPatch();
    if (patch.length === 0) return;

    try {
      setSaving(true);
      setError(null);
      await api.patchTripDoc(
        tripId,
        {
          client_revision: doc.revision,
          patch,
        },
        opts
      );

      // Always reload to get bumped revision + updated_at.
      const next = await api.getTripDoc(tripId, opts);
      setDoc(next);
      setBrief(next.natural_language_trip_brief ?? '');
      setNotes(next.shared_notes ?? '');
      onDocUpdated?.(next);
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err?.status === 409) {
        // Optimistic concurrency conflict: pull latest to keep UI consistent.
        await reloadLatest();
        setError('Trip details changed elsewhere. Loaded latest; please re-apply your edits.');
        return;
      }
      const msg = e instanceof Error ? e.message : 'Failed to save trip details.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading trip details…</div>;

  return (
    <Wrapper>
      {error && (
        <div style={{ padding: '0.25rem 0' }}>
          <Muted>{error}</Muted>
        </div>
      )}

      <Surface>
        <Title>Trip Details</Title>

        <Label htmlFor="trip-brief">Trip brief</Label>
        <Textarea
          id="trip-brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Write a short trip brief…"
          disabled={!canEdit || saving}
        />

        <Label htmlFor="trip-notes">Shared notes</Label>
        <Textarea
          id="trip-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Shared notes for everyone…"
          disabled={!canEdit || saving}
        />

        <Row style={{ marginTop: '0.75rem' }}>
          <Muted>
            {doc ? (
              <>
                Revision {doc.revision} • Updated {new Date(doc.updated_at).toLocaleString()}
              </>
            ) : (
              '—'
            )}
          </Muted>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="button" onClick={() => reloadLatest()} disabled={saving}>
              Reload
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSave}
              disabled={!canEdit || saving || !hasChanges}
              title={!canEdit ? 'Enable editing to save changes' : undefined}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </Row>
      </Surface>

      <TripAiEditPanel
        tripId={tripId}
        tripAccessToken={tripAccessToken}
        canEdit={canEdit}
        docRevision={doc?.revision ?? null}
        onNeedRefresh={async () => {
          await reloadLatest();
          await onNeedRefresh?.();
        }}
      />
    </Wrapper>
  );
}


