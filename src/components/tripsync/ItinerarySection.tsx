'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { ItineraryItemCreate, ItineraryItemRead } from '@/types';
import { api } from '@/lib/api';
import TripAiEditPanel from '@/components/tripsync/TripAiEditPanel';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FilterStrip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  flex-wrap: wrap;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 0.65rem 0.85rem;
`;

const PillRow = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterPill = styled.button<{ active: boolean }>`
  padding: 0.3rem 0.68rem;
  border-radius: 999px;
  border: 1px solid ${({ active, theme }) => (active ? theme.primary : theme.border)};
  background: ${({ active, theme }) =>
    active ? `${theme.primary}20` : theme.background};
  color: ${({ active, theme }) => (active ? theme.primary : theme.text)};
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'ghost' | 'danger' }>`
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

const FormCard = styled.div`
  border: 1.5px solid ${({ theme }) => theme.primary}66;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 14px;
  padding: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.65rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
`;

const Label = styled.label`
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.mutedText};
  font-weight: 800;
`;

const Input = styled.input`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 9px;
  padding: 0.55rem 0.7rem;
  font-size: 0.88rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Select = styled.select`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 9px;
  padding: 0.55rem 0.7rem;
  font-size: 0.88rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Textarea = styled.textarea`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 9px;
  padding: 0.55rem 0.7rem;
  font-size: 0.88rem;
  min-height: 70px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const StatusBanner = styled.div<{ tone: 'error' | 'success' }>`
  padding: 0.55rem 0.85rem;
  border-radius: 9px;
  font-size: 0.84rem;
  font-weight: 600;
  background: ${({ tone }) => (tone === 'error' ? '#EF444418' : '#10B98118')};
  color: ${({ tone }) => (tone === 'error' ? '#EF4444' : '#10B981')};
  border: 1px solid ${({ tone }) => (tone === 'error' ? '#EF444455' : '#10B98155')};
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const GroupTitle = styled.div`
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.mutedText};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ItemCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  display: grid;
  grid-template-columns: 96px 1fr auto;
  gap: 0.75rem;
  align-items: center;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.45rem;
  }
`;

const TimeCol = styled.div`
  font-family: var(--font-mono), monospace;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.primary};
  font-size: 0.82rem;
  font-weight: 800;
`;

const MainCol = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ItemTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
`;

const ItemTitle = styled.span`
  font-size: 0.96rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
`;

const TypeBadge = styled.span`
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.14rem 0.48rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.mutedText};
`;

const MetaRow = styled.div`
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.8rem;
  align-items: center;
`;

const MapLink = styled.a`
  color: ${({ theme }) => theme.primary};
  font-weight: 700;
  font-size: 0.76rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

function safeDate(d: string | null | undefined): Date | null {
  if (!d) return null;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toDatetimeLocalValue(iso: string | null | undefined): string {
  const d = safeDate(iso);
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function toIsoFromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function toIsoFromDateOnly(value: string): string | null {
  if (!value) return null;
  return `${value}T00:00:00Z`;
}

function formatTimeRange(
  start?: string | null,
  end?: string | null,
  allDay?: boolean | null
): string {
  if (allDay) return 'All day';
  const s = safeDate(start);
  const e = safeDate(end);
  if (!s) return '—';
  const fmt = (x: Date) =>
    x.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (!e) return fmt(s);
  return `${fmt(s)}–${fmt(e)}`;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getDateKey(start?: string | null): string | null {
  if (!start) return null;
  const isoPrefix = start.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoPrefix)) return isoPrefix;
  const d = safeDate(start);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

type GroupKey = `day:${number}` | `date:${string}` | 'unscheduled';

function getGroupKey(item: ItineraryItemRead): GroupKey {
  if (item.day_index != null) return `day:${item.day_index}`;
  const k = getDateKey(item.start_time);
  if (k) return `date:${k}`;
  return 'unscheduled';
}

function formatGroupLabel(key: GroupKey, items: ItineraryItemRead[]): string {
  if (key === 'unscheduled') return 'Unscheduled';
  if (key.startsWith('date:')) {
    const d = safeDate(items[0]?.start_time);
    return d ? formatShortDate(d) : key.slice(5);
  }
  const dayIndex = Number(key.slice(4));
  const firstWithDate = items.find((x) => !!safeDate(x.start_time));
  const d = safeDate(firstWithDate?.start_time ?? null);
  return d ? `Day ${dayIndex} • ${formatShortDate(d)}` : `Day ${dayIndex}`;
}

const TYPE_ICONS: Record<string, string> = {
  activity: '🎯',
  transport: '🚗',
  food: '🍽️',
  lodging: '🏨',
  other: '📌',
};

type Props = {
  tripId: string;
  items: ItineraryItemRead[];
  tripAccessToken?: string;
  canEdit?: boolean;
  onItemsChange?: (next: ItineraryItemRead[]) => void;
  onRefresh?: () => Promise<void> | void;
  docRevision?: number | null;
};

export default function ItinerarySection({
  tripId,
  items,
  tripAccessToken,
  canEdit = true,
  onItemsChange,
  onRefresh,
  docRevision = null,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState('activity');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [dayIndex, setDayIndex] = useState<string>('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ text: string; tone: 'error' | 'success' } | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filters
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [showAiPanel, setShowAiPanel] = useState(false);

  const opts = useMemo(
    () => (tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined),
    [tripAccessToken, canEdit]
  );

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setItemType('activity');
    setAllDay(false);
    setStartDate('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setNotes('');
    setDayIndex('');
    setLat('');
    setLng('');
    setStatus(null);
  };

  const openCreate = () => {
    resetForm();
    const now = new Date();
    now.setMinutes(0, 0, 0);
    setStartTime(toDatetimeLocalValue(now.toISOString()));
    setStartDate(now.toISOString().slice(0, 10));
    setFormOpen(true);
  };

  const openEdit = (it: ItineraryItemRead) => {
    setEditingId(it.id);
    setTitle(it.title ?? '');
    setItemType(it.item_type ?? 'activity');
    setAllDay(!!it.all_day);
    setStartDate(it.all_day ? (it.start_time ? it.start_time.slice(0, 10) : '') : '');
    setStartTime(!it.all_day ? toDatetimeLocalValue(it.start_time) : '');
    setEndTime(!it.all_day ? toDatetimeLocalValue(it.end_time ?? null) : '');
    setLocation(it.location ?? '');
    setNotes(it.notes ?? '');
    setDayIndex(it.day_index != null ? String(it.day_index) : '');
    setLat(it.lat != null ? String(it.lat) : '');
    setLng(it.lng != null ? String(it.lng) : '');
    setStatus(null);
    setFormOpen(true);
  };

  const validate = (): { ok: boolean; payload?: ItineraryItemCreate } => {
    const t = title.trim();
    if (!t) {
      setStatus({ text: 'Title is required.', tone: 'error' });
      return { ok: false };
    }

    const parsedDay = dayIndex.trim() ? Number(dayIndex) : null;
    if (parsedDay != null && (!Number.isFinite(parsedDay) || parsedDay < 1)) {
      setStatus({ text: 'Day index must be 1 or greater.', tone: 'error' });
      return { ok: false };
    }

    const latVal = lat.trim() ? Number(lat) : null;
    const lngVal = lng.trim() ? Number(lng) : null;
    const hasLat = latVal != null && !Number.isNaN(latVal);
    const hasLng = lngVal != null && !Number.isNaN(lngVal);
    if ((lat.trim() || lng.trim()) && !(hasLat && hasLng)) {
      setStatus({
        text: 'Both latitude and longitude must be provided together.',
        tone: 'error',
      });
      return { ok: false };
    }

    let startIso: string | null = null;
    let endIso: string | null = null;
    if (allDay) {
      startIso = toIsoFromDateOnly(startDate);
      if (!startIso) {
        setStatus({ text: 'Date is required for all-day items.', tone: 'error' });
        return { ok: false };
      }
    } else {
      startIso = toIsoFromDatetimeLocal(startTime);
      if (!startIso) {
        setStatus({ text: 'Start time is required.', tone: 'error' });
        return { ok: false };
      }
      endIso = endTime ? toIsoFromDatetimeLocal(endTime) : null;
      if (endIso) {
        const s = safeDate(startIso)?.getTime() ?? 0;
        const e = safeDate(endIso)?.getTime() ?? 0;
        if (e < s) {
          setStatus({ text: 'End time must be after start time.', tone: 'error' });
          return { ok: false };
        }
      }
    }

    setStatus(null);
    return {
      ok: true,
      payload: {
        title: t,
        item_type: itemType.trim() || 'activity',
        start_time: startIso,
        end_time: endIso,
        location: location.trim() || null,
        notes: notes.trim() || null,
        day_index: parsedDay,
        all_day: allDay,
        lat: hasLat ? latVal : null,
        lng: hasLng ? lngVal : null,
      },
    };
  };

  const refreshFromServer = async () => {
    await onRefresh?.();
    if (!onRefresh) {
      try {
        const next = await api.listItinerary(tripId, opts);
        onItemsChange?.(next);
      } catch (e) {
        console.error('Failed to refresh itinerary:', e);
      }
    }
  };

  const handleSave = async () => {
    if (tripAccessToken && !canEdit) {
      setStatus({
        text: 'Enable editing on this share link to modify itinerary.',
        tone: 'error',
      });
      return;
    }
    const v = validate();
    if (!v.ok || !v.payload) return;

    try {
      setSaving(true);
      if (tripId === 'demo' && v.payload?.start_time) {
        const nextItem: ItineraryItemRead = {
          ...v.payload,
          id: editingId || `demo-it-${Date.now()}`,
          start_time: v.payload.start_time,
        };
        const next = editingId
          ? items.map((it) => (it.id === editingId ? nextItem : it))
          : [...items, nextItem];
        onItemsChange?.(next);
        setFormOpen(false);
        resetForm();
        return;
      }
      if (editingId) {
        await api.updateItinerary(tripId, editingId, v.payload, opts);
      } else {
        await api.addItinerary(tripId, v.payload, opts);
      }
      await refreshFromServer();
      setFormOpen(false);
      resetForm();
    } catch (e) {
      setStatus({
        text: e instanceof Error ? e.message : 'Failed to save itinerary item.',
        tone: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (tripAccessToken && !canEdit) return;
    if (tripId === 'demo') {
      onItemsChange?.(items.filter((it) => it.id !== id));
      setConfirmDeleteId(null);
      return;
    }
    try {
      await api.deleteItinerary(tripId, id, opts);
      setConfirmDeleteId(null);
      await refreshFromServer();
    } catch (e) {
      setStatus({
        text: e instanceof Error ? e.message : 'Failed to delete itinerary item.',
        tone: 'error',
      });
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<GroupKey, ItineraryItemRead[]>();
    for (const item of items) {
      if (selectedTypeFilter !== 'ALL' && item.item_type !== selectedTypeFilter) {
        continue;
      }
      const key = getGroupKey(item);
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => {
        const da = safeDate(a.start_time)?.getTime() ?? 0;
        const db = safeDate(b.start_time)?.getTime() ?? 0;
        return da - db;
      });
      map.set(k, arr);
    }
    const entries = Array.from(map.entries());
    entries.sort((a, b) => {
      const ka = a[0];
      const kb = b[0];
      const isDayA = ka.startsWith('day:');
      const isDayB = kb.startsWith('day:');
      if (isDayA && isDayB) return Number(ka.slice(4)) - Number(kb.slice(4));
      if (isDayA) return -1;
      if (isDayB) return 1;
      const isDateA = ka.startsWith('date:');
      const isDateB = kb.startsWith('date:');
      if (isDateA && isDateB) return ka.localeCompare(kb);
      if (isDateA) return -1;
      if (isDateB) return 1;
      return 1;
    });
    return entries;
  }, [items, selectedTypeFilter]);

  const visibleGroups = useMemo(() => {
    if (selectedGroupFilter === 'ALL') return grouped;
    return grouped.filter(([k]) => k === selectedGroupFilter);
  }, [grouped, selectedGroupFilter]);

  return (
    <Wrapper>
      <TopBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <strong style={{ fontSize: '1.05rem' }}>
            🗓️ Schedule ({items.length} item{items.length === 1 ? '' : 's'})
          </strong>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAiPanel((v) => !v)}
          >
            {showAiPanel ? 'Hide AI Co-Pilot' : '✨ AI Plan Itinerary'}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={openCreate}
            disabled={tripAccessToken ? !canEdit : false}
          >
            + Add Activity
          </Button>
        </div>
      </TopBar>

      {status && <StatusBanner tone={status.tone}>{status.text}</StatusBanner>}

      {showAiPanel && (
        <TripAiEditPanel
          title="✨ AI Itinerary Planner"
          tripId={tripId}
          tripAccessToken={tripAccessToken}
          canEdit={canEdit}
          docRevision={docRevision}
          editDoc={false}
          editItinerary={true}
          onNeedRefresh={refreshFromServer}
        />
      )}

      {formOpen && (
        <FormCard>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <strong style={{ fontSize: '0.95rem' }}>
              {editingId ? '✏️ Edit Itinerary Item' : '➕ Add Itinerary Item'}
            </strong>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setFormOpen(false);
                  resetForm();
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Item'}
              </Button>
            </div>
          </div>

          <Grid>
            <Field>
              <Label htmlFor="it-title">Title *</Label>
              <Input
                id="it-title"
                placeholder="e.g. Scuba Diving, Flight to Goa…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>

            <Field>
              <Label htmlFor="it-type">Category</Label>
              <Select
                id="it-type"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
              >
                <option value="activity">🎯 Activity</option>
                <option value="transport">🚗 Transport</option>
                <option value="food">🍽️ Food</option>
                <option value="lodging">🏨 Lodging</option>
                <option value="other">📌 Other</option>
              </Select>
            </Field>

            <Field>
              <Label>
                {allDay ? 'Date *' : 'Start Date & Time *'}{' '}
                <label
                  style={{
                    marginLeft: '0.5rem',
                    textTransform: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                  />{' '}
                  All day
                </label>
              </Label>
              {allDay ? (
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              ) : (
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              )}
            </Field>

            {!allDay && (
              <Field>
                <Label>End Time (optional)</Label>
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </Field>
            )}

            <Field>
              <Label>Location (optional)</Label>
              <Input
                placeholder="Place name or address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Field>

            <Field>
              <Label>Day # (optional)</Label>
              <Input
                type="number"
                min="1"
                placeholder="1, 2, 3…"
                value={dayIndex}
                onChange={(e) => setDayIndex(e.target.value)}
              />
            </Field>
          </Grid>

          <Field style={{ marginTop: '0.65rem' }}>
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Booking reference, ticket links, or meeting point…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </FormCard>
      )}

      {/* 1-Click Day & Type Filters */}
      {items.length > 0 && (
        <FilterStrip>
          <PillRow>
            <FilterPill
              type="button"
              active={selectedGroupFilter === 'ALL'}
              onClick={() => setSelectedGroupFilter('ALL')}
            >
              All Days ({items.length})
            </FilterPill>
            {grouped.map(([gKey, gItems]) => (
              <FilterPill
                key={gKey}
                type="button"
                active={selectedGroupFilter === gKey}
                onClick={() =>
                  setSelectedGroupFilter((cur) => (cur === gKey ? 'ALL' : gKey))
                }
              >
                {formatGroupLabel(gKey, gItems)} ({gItems.length})
              </FilterPill>
            ))}
          </PillRow>

          <PillRow>
            {(['ALL', 'activity', 'transport', 'food', 'lodging'] as const).map((t) => (
              <FilterPill
                key={t}
                type="button"
                active={selectedTypeFilter === t}
                onClick={() =>
                  setSelectedTypeFilter((cur) => (cur === t ? 'ALL' : t))
                }
              >
                {t === 'ALL' ? 'All Types' : `${TYPE_ICONS[t] || '📌'} ${t}`}
              </FilterPill>
            ))}
          </PillRow>
        </FilterStrip>
      )}

      {visibleGroups.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            borderRadius: '12px',
            border: '1px dashed rgba(148, 163, 184, 0.35)',
            opacity: 0.75,
          }}
        >
          {items.length === 0
            ? 'No itinerary items yet. Click "+ Add Activity" or "✨ AI Plan Itinerary" to build your schedule!'
            : 'No itinerary items match your active filters.'}
        </div>
      ) : (
        visibleGroups.map(([groupKey, groupItems]) => (
          <Group key={groupKey}>
            <GroupTitle>
              <span>{formatGroupLabel(groupKey, groupItems)}</span>
              <span>
                {groupItems.length} item{groupItems.length === 1 ? '' : 's'}
              </span>
            </GroupTitle>
            <Timeline>
              {groupItems.map((i, idx) => {
                const icon = TYPE_ICONS[i.item_type] || '📌';
                const mapQuery =
                  typeof i.lat === 'number' && typeof i.lng === 'number'
                    ? `${i.lat},${i.lng}`
                    : i.location
                    ? encodeURIComponent(i.location)
                    : null;

                return (
                  <ItemCard key={i.id || `${i.title}-${idx}`}>
                    <TimeCol>
                      {formatTimeRange(
                        i.start_time,
                        i.end_time ?? null,
                        i.all_day ?? null
                      )}
                    </TimeCol>

                    <MainCol>
                      <ItemTitleRow>
                        <ItemTitle>
                          {icon} {i.title}
                        </ItemTitle>
                        <TypeBadge>{i.item_type}</TypeBadge>
                      </ItemTitleRow>

                      {(i.location || mapQuery || i.notes) && (
                        <MetaRow>
                          {i.location && <span>📍 {i.location}</span>}
                          {mapQuery && (
                            <MapLink
                              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              ↗ Open Map
                            </MapLink>
                          )}
                          {i.notes && <span style={{ opacity: 0.9 }}>• {i.notes}</span>}
                        </MetaRow>
                      )}
                    </MainCol>

                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => openEdit(i)}
                        disabled={tripAccessToken ? !canEdit : false}
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        ✏️
                      </Button>
                      {confirmDeleteId === i.id ? (
                        <>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => void handleDelete(i.id)}
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            Confirm
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(null)}
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            No
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setConfirmDeleteId(i.id)}
                          disabled={tripAccessToken ? !canEdit : false}
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          🗑️
                        </Button>
                      )}
                    </div>
                  </ItemCard>
                );
              })}
            </Timeline>
          </Group>
        ))
      )}
    </Wrapper>
  );
}
