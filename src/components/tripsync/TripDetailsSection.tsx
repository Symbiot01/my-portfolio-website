'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { api } from '@/lib/api';
import {
  JsonPatchOp,
  TripDoc,
  TripLodgingDoc,
} from '@/types';
import TripAiEditPanel from '@/components/tripsync/TripAiEditPanel';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatusBanner = styled.div<{ tone: 'error' | 'success' | 'info' }>`
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  font-size: 0.86rem;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const TopBarCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const TopMetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr auto;
  gap: 0.65rem;
  align-items: end;

  @media (max-width: 960px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 0.98rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 0.45rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.mutedText};
  font-weight: 800;
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 9px;
  padding: 0.55rem 0.75rem;
  font-size: 0.88rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 135px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'ghost' }>`
  border: 1px solid
    ${({ theme, variant }) =>
      variant === 'primary'
        ? theme.primary
        : variant === 'danger'
        ? '#EF444466'
        : theme.border};
  background: ${({ theme, variant }) =>
    variant === 'primary'
      ? theme.primary
      : variant === 'danger'
      ? '#EF444415'
      : 'transparent'};
  color: ${({ variant, theme }) =>
    variant === 'primary'
      ? '#fff'
      : variant === 'danger'
      ? '#EF4444'
      : theme.text};
  border-radius: 9px;
  padding: 0.52rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Muted = styled.div`
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.8rem;
`;

const LodgingItemCard = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  font-size: 0.73rem;
  font-weight: 700;
  background: ${({ theme }) => `${theme.primary}18`};
  color: ${({ theme }) => theme.primary};
`;

type Props = {
  tripId: string;
  tripAccessToken?: string;
  canEdit?: boolean;
  onDocLoaded?: (doc: TripDoc) => void;
  onDocUpdated?: (doc: TripDoc) => void;
  onNeedRefresh?: () => Promise<void> | void;
};

function computeNightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const d1 = new Date(`${checkIn}T00:00:00Z`).getTime();
  const d2 = new Date(`${checkOut}T00:00:00Z`).getTime();
  if (Number.isNaN(d1) || Number.isNaN(d2)) return 0;
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

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
  const [status, setStatus] = useState<{
    text: string;
    tone: 'error' | 'success' | 'info';
  } | null>(null);
  const [doc, setDoc] = useState<TripDoc | null>(null);

  const [title, setTitle] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [brief, setBrief] = useState('');
  const [notes, setNotes] = useState('');
  const [lodgings, setLodgings] = useState<TripLodgingDoc[]>([]);

  // Quick Add Lodging state
  const [showAddLodging, setShowAddLodging] = useState(false);
  const [lodgName, setLodgName] = useState('');
  const [lodgCity, setLodgCity] = useState('');
  const [lodgCheckIn, setLodgCheckIn] = useState('');
  const [lodgCheckOut, setLodgCheckOut] = useState('');
  const [lodgConf, setLodgConf] = useState('');
  const [lodgAddress, setLodgAddress] = useState('');

  const syncFromDoc = (d: TripDoc) => {
    setDoc(d);
    setTitle(d.title ?? '');
    setTimezone(d.timezone ?? 'UTC');
    setStartDate(d.date_range?.start ? String(d.date_range.start).slice(0, 10) : '');
    setEndDate(d.date_range?.end ? String(d.date_range.end).slice(0, 10) : '');
    setBrief(d.natural_language_trip_brief ?? '');
    setNotes(d.shared_notes ?? '');
    setLodgings(Array.isArray(d.lodgings) ? d.lodgings : []);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setStatus(null);
        const d = await api.getTripDoc(tripId, opts);
        syncFromDoc(d);
        onDocLoaded?.(d);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load trip details.';
        setStatus({ text: msg, tone: 'error' });
      } finally {
        setLoading(false);
      }
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, tripAccessToken]);

  const tripDurationDays = useMemo(() => {
    const nights = computeNightsBetween(startDate, endDate);
    return nights >= 0 && startDate && endDate ? nights + 1 : null;
  }, [startDate, endDate]);

  const hasChanges = useMemo(() => {
    if (!doc) return false;
    const origStart = doc.date_range?.start ? String(doc.date_range.start).slice(0, 10) : '';
    const origEnd = doc.date_range?.end ? String(doc.date_range.end).slice(0, 10) : '';
    return (
      title !== (doc.title ?? '') ||
      timezone !== (doc.timezone ?? 'UTC') ||
      startDate !== origStart ||
      endDate !== origEnd ||
      brief !== (doc.natural_language_trip_brief ?? '') ||
      notes !== (doc.shared_notes ?? '') ||
      JSON.stringify(lodgings) !== JSON.stringify(doc.lodgings ?? [])
    );
  }, [doc, title, timezone, startDate, endDate, brief, notes, lodgings]);

  const reloadLatest = async () => {
    try {
      const d = await api.getTripDoc(tripId, opts);
      syncFromDoc(d);
      onDocLoaded?.(d);
    } catch (e) {
      setStatus({
        text: e instanceof Error ? e.message : 'Failed to reload trip details.',
        tone: 'error',
      });
    }
  };

  const applyPatches = async (ops: JsonPatchOp[], successMessage = 'Trip details saved!') => {
    if (!doc) return;
    if (!canEdit) {
      setStatus({ text: 'Enable editing to save changes.', tone: 'error' });
      return;
    }
    if (ops.length === 0) return;

    try {
      setSaving(true);
      setStatus(null);
      const updated = await api.patchTripDoc(
        tripId,
        {
          client_revision: doc.revision,
          patch: ops,
        },
        opts
      );
      syncFromDoc(updated);
      onDocUpdated?.(updated);
      setStatus({ text: successMessage, tone: 'success' });
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err?.status === 409) {
        await reloadLatest();
        setStatus({
          text: 'Trip details changed elsewhere. Reloaded latest version.',
          tone: 'error',
        });
        return;
      }
      setStatus({
        text: e instanceof Error ? e.message : 'Failed to save trip details.',
        tone: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!doc) return;
    if (startDate && endDate && endDate < startDate) {
      setStatus({ text: 'Trip end date cannot be before start date.', tone: 'error' });
      return;
    }

    const ops: JsonPatchOp[] = [
      { op: 'replace', path: '/title', value: title.trim() || doc.title },
      { op: 'replace', path: '/timezone', value: timezone.trim() || 'UTC' },
      {
        op: 'replace',
        path: '/date_range',
        value: {
          start: startDate || null,
          end: endDate || null,
        },
      },
      { op: 'replace', path: '/natural_language_trip_brief', value: brief },
      { op: 'replace', path: '/shared_notes', value: notes },
      { op: 'replace', path: '/lodgings', value: lodgings },
    ];

    await applyPatches(ops);
  };

  const handleAddLodging = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lodgName.trim()) return;
    const nights = computeNightsBetween(lodgCheckIn, lodgCheckOut);
    if (nights < 1) {
      setStatus({
        text: 'Check-out date must be at least 1 night after check-in date.',
        tone: 'error',
      });
      return;
    }

    const newLodging: TripLodgingDoc = {
      lodging_id: `lodg-${Date.now().toString(36)}`,
      name: lodgName.trim(),
      city: lodgCity.trim() || null,
      address: lodgAddress.trim() || null,
      confirmation_code: lodgConf.trim() || null,
      booking_nights: {
        check_in_date: lodgCheckIn,
        check_out_date: lodgCheckOut,
        nights,
      },
    };

    const nextLodgings = [...lodgings, newLodging];
    setLodgings(nextLodgings);
    setLodgName('');
    setLodgCity('');
    setLodgCheckIn('');
    setLodgCheckOut('');
    setLodgConf('');
    setLodgAddress('');
    setShowAddLodging(false);

    await applyPatches(
      [{ op: 'replace', path: '/lodgings', value: nextLodgings }],
      `Added stay "${newLodging.name}" (${nights} night${nights === 1 ? '' : 's'})`
    );
  };

  const handleRemoveLodging = async (lodgingId: string) => {
    const nextLodgings = lodgings.filter((l) => l.lodging_id !== lodgingId);
    setLodgings(nextLodgings);
    await applyPatches(
      [{ op: 'replace', path: '/lodgings', value: nextLodgings }],
      'Removed lodging stay.'
    );
  };

  if (loading) return <Muted>Loading trip details…</Muted>;

  return (
    <Wrapper>
      {status && (
        <StatusBanner tone={status.tone}>
          <span>{status.text}</span>
          <Button type="button" variant="ghost" onClick={() => setStatus(null)}>
            ✕
          </Button>
        </StatusBanner>
      )}

      {/* Top Meta Bar: Title, Dates, Timezone, Save */}
      <TopBarCard>
        <CardHeader>
          <CardTitle>
            <span>🗺️ Trip Overview & Schedule</span>
            {tripDurationDays != null && (
              <Badge>
                {tripDurationDays} Day{tripDurationDays === 1 ? '' : 's'} •{' '}
                {Math.max(0, tripDurationDays - 1)} Night
                {tripDurationDays - 1 === 1 ? '' : 's'}
              </Badge>
            )}
          </CardTitle>
          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
            <Muted>
              {doc
                ? `Rev #${doc.revision} • Updated ${new Date(
                    doc.updated_at
                  ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : ''}
            </Muted>
            <Button type="button" variant="ghost" onClick={reloadLatest} disabled={saving}>
              ↻ Reload
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveAll}
              disabled={!canEdit || saving || !hasChanges}
            >
              {saving ? 'Saving…' : hasChanges ? '✓ Save Changes' : 'Saved'}
            </Button>
          </div>
        </CardHeader>

        <TopMetaGrid>
          <div>
            <Label htmlFor="td-title">Trip Title</Label>
            <Input
              id="td-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!canEdit || saving}
              placeholder="Trip title"
            />
          </div>
          <div>
            <Label htmlFor="td-start">Start Date</Label>
            <Input
              id="td-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!canEdit || saving}
            />
          </div>
          <div>
            <Label htmlFor="td-end">End Date</Label>
            <Input
              id="td-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!canEdit || saving}
            />
          </div>
          <div>
            <Label htmlFor="td-tz">Timezone</Label>
            <Input
              id="td-tz"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={!canEdit || saving}
              placeholder="Asia/Kolkata, UTC…"
            />
          </div>
        </TopMetaGrid>
      </TopBarCard>

      {/* Side-by-Side Brief & Shared Notes */}
      <TwoColGrid>
        <Card>
          <CardHeader>
            <CardTitle>📋 Trip Brief & Goals</CardTitle>
            <Muted>High-level summary & plan</Muted>
          </CardHeader>
          <Textarea
            id="trip-brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Summarize destinations, goals, budget targets, or key highlights…"
            disabled={!canEdit || saving}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📌 Shared Notes & Checklist</CardTitle>
            <Muted>Wi-Fi, packing list, emergency info</Muted>
          </CardHeader>
          <Textarea
            id="trip-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Shared notes for everyone (flight numbers, packing checklist, local tips)…"
            disabled={!canEdit || saving}
          />
        </Card>
      </TwoColGrid>

      {/* Lodgings / Hotel Stays Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span>🏨 Lodgings & Bookings ({lodgings.length})</span>
          </CardTitle>
          {canEdit && (
            <Button
              type="button"
              variant={showAddLodging ? 'ghost' : 'primary'}
              onClick={() => setShowAddLodging((v) => !v)}
            >
              {showAddLodging ? 'Cancel' : '+ Add Stay'}
            </Button>
          )}
        </CardHeader>

        {showAddLodging && (
          <form
            onSubmit={handleAddLodging}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.6rem',
              padding: '0.85rem',
              borderRadius: '10px',
              border: '1px dashed rgba(148, 163, 184, 0.4)',
              alignItems: 'end',
            }}
          >
            <div>
              <Label>Hotel / Stay Name *</Label>
              <Input
                value={lodgName}
                onChange={(e) => setLodgName(e.target.value)}
                placeholder="e.g. Grand Hyatt Goa"
                required
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={lodgCity}
                onChange={(e) => setLodgCity(e.target.value)}
                placeholder="e.g. North Goa"
              />
            </div>
            <div>
              <Label>Check-in Date *</Label>
              <Input
                type="date"
                value={lodgCheckIn}
                onChange={(e) => setLodgCheckIn(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Check-out Date *</Label>
              <Input
                type="date"
                value={lodgCheckOut}
                onChange={(e) => setLodgCheckOut(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Confirmation #</Label>
              <Input
                value={lodgConf}
                onChange={(e) => setLodgConf(e.target.value)}
                placeholder="Optional code"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={lodgAddress}
                onChange={(e) => setLodgAddress(e.target.value)}
                placeholder="Optional address"
              />
            </div>
            <Button type="submit" variant="primary">
              Save Stay
            </Button>
          </form>
        )}

        {lodgings.length === 0 ? (
          <Muted>
            No hotel or lodging bookings added yet. Click &ldquo;+ Add Stay&rdquo; or ask the AI
            Co-Pilot below.
          </Muted>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0.65rem',
            }}
          >
            {lodgings.map((l) => (
              <LodgingItemCard key={l.lodging_id}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.94rem' }}>{l.name}</strong>
                    {l.city && <Badge>{l.city}</Badge>}
                  </div>
                  <Muted>
                    📅 {String(l.booking_nights.check_in_date).slice(0, 10)} →{' '}
                    {String(l.booking_nights.check_out_date).slice(0, 10)} (
                    {l.booking_nights.nights} night{l.booking_nights.nights === 1 ? '' : 's'})
                  </Muted>
                  {l.confirmation_code && (
                    <Muted>🔑 Confirmation: {l.confirmation_code}</Muted>
                  )}
                  {l.address && <Muted>📍 {l.address}</Muted>}
                </div>
                {canEdit && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => void handleRemoveLodging(l.lodging_id)}
                    style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                  >
                    ✕
                  </Button>
                )}
              </LodgingItemCard>
            ))}
          </div>
        )}
      </Card>

      {/* AI Co-Pilot */}
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
