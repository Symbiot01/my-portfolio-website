'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { ItineraryItemCreate, ItineraryItemRead } from '@/types';
import { api } from '@/lib/api';
import TripAiEditPanel from '@/components/tripsync/TripAiEditPanel';

const Wrapper = styled.div`
  max-width: 1100px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 900;
  color: ${({ theme }) => theme.text};
`;

const Subtle = styled.div`
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.9rem;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'primary' | 'ghost' | 'danger' }>`
  border: 1px solid
    ${({ theme, variant }) =>
      variant === 'primary' ? theme.primary : variant === 'danger' ? '#E74C3C' : theme.border};
  background: ${({ theme, variant }) =>
    variant === 'primary' ? theme.primary : variant === 'danger' ? '#E74C3C' : 'transparent'};
  color: ${({ variant, theme }) => (variant === 'primary' || variant === 'danger' ? '#fff' : theme.text)};
  border-radius: 10px;
  padding: 0.55rem 0.8rem;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const FormCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 0.85rem;
  margin-bottom: 0.75rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Label = styled.label`
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.mutedText};
  font-weight: 900;
`;

const Input = styled.input`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Select = styled.select`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Textarea = styled.textarea`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  font-size: 0.95rem;
  min-height: 84px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Inline = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
`;

const CheckboxLabel = styled.label`
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.92rem;
  color: ${({ theme }) => theme.text};
  font-weight: 700;
`;

const ErrorText = styled.div`
  color: #E74C3C;
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

const Group = styled.div`
  margin-top: 1rem;
`;

const GroupTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.mutedText};
  margin-bottom: 0.5rem;
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const ItemCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 0.75rem 0.85rem;
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 0.75rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const TimeCol = styled.div`
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.85rem;
  line-height: 1.25;
`;

const MainCol = styled.div`
  min-width: 0;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
`;

const ItemTitle = styled.div`
  font-size: 1rem;
  font-weight: 900;
  color: ${({ theme }) => theme.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Pills = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const Pill = styled.span<{ tone?: 'primary' | 'neutral' }>`
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.18rem 0.45rem;
  border-radius: 999px;
  border: 1px solid ${({ theme, tone }) => (tone === 'primary' ? theme.primary : theme.border)};
  background: ${({ theme, tone }) => (tone === 'primary' ? `${theme.primary}14` : 'transparent')};
  color: ${({ theme, tone }) => (tone === 'primary' ? theme.primary : theme.mutedText)};
`;

const Meta = styled.div`
  margin-top: 0.35rem;
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.85rem;
`;

const MetaItem = styled.span`
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  min-width: 0;
`;

const Notes = styled.div`
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.text};
  opacity: 0.9;
  font-size: 0.9rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function toIsoFromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function toIsoFromDateOnly(value: string): string | null {
  if (!value) return null;
  // Midnight UTC of the chosen date.
  return `${value}T00:00:00Z`;
}

function formatTimeRange(start?: string | null, end?: string | null, allDay?: boolean | null): string {
  if (allDay) return 'All day';
  const s = safeDate(start);
  const e = safeDate(end);
  if (!s) return '—';
  const fmt = (x: Date) => x.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (!e) return fmt(s);
  return `${fmt(s)}–${fmt(e)}`;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function getDateKey(start?: string | null): string | null {
  if (!start) return null;
  // Works for ISO strings; falls back to Date parsing.
  const isoPrefix = start.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoPrefix)) return isoPrefix;
  const d = safeDate(start);
  if (!d) return null;
  // Local date key (stable enough for grouping).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
    if (d) return formatShortDate(d);
    // Fallback to YYYY-MM-DD from key.
    return key.slice('date:'.length);
  }
  // day:<n>
  const dayIndex = Number(key.slice('day:'.length));
  const firstWithDate = items.find((x) => !!safeDate(x.start_time));
  const d = safeDate(firstWithDate?.start_time ?? null);
  return d ? `Day ${dayIndex} • ${formatShortDate(d)}` : `Day ${dayIndex}`;
}

type Props = {
  tripId: string;
  items: ItineraryItemRead[];
  tripAccessToken?: string;
  canEdit?: boolean;
  onItemsChange?: (next: ItineraryItemRead[]) => void;
  onRefresh?: () => Promise<void> | void;
  /** Optional TripDoc revision for AI apply; if null we can still propose but apply will ask you to load Details. */
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
  const [startDate, setStartDate] = useState(''); // used when allDay
  const [startTime, setStartTime] = useState(''); // datetime-local when !allDay
  const [endTime, setEndTime] = useState(''); // datetime-local
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [dayIndex, setDayIndex] = useState<string>(''); // number text
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
    setErr(null);
  };

  const openCreate = () => {
    resetForm();
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
    setErr(null);
    setFormOpen(true);
  };

  const validate = (): { ok: boolean; payload?: ItineraryItemCreate } => {
    const t = title.trim();
    if (!t) return { ok: false };

    const parsedDay = dayIndex.trim() ? Number(dayIndex) : null;
    if (parsedDay != null && (!Number.isFinite(parsedDay) || parsedDay < 1)) {
      setErr('day_index must be >= 1');
      return { ok: false };
    }

    const latVal = lat.trim() ? Number(lat) : null;
    const lngVal = lng.trim() ? Number(lng) : null;
    const hasLat = latVal != null && !Number.isNaN(latVal);
    const hasLng = lngVal != null && !Number.isNaN(lngVal);
    if (lat.trim() || lng.trim()) {
      if (!(hasLat && hasLng)) {
        setErr('lat and lng must be both present (or both empty).');
        return { ok: false };
      }
    }

    let startIso: string | null = null;
    let endIso: string | null = null;
    if (allDay) {
      startIso = toIsoFromDateOnly(startDate);
      if (!startIso) {
        setErr('Start date is required for all-day items.');
        return { ok: false };
      }
      endIso = null;
    } else {
      startIso = toIsoFromDatetimeLocal(startTime);
      if (!startIso) {
        setErr('Start time is required.');
        return { ok: false };
      }
      endIso = endTime ? toIsoFromDatetimeLocal(endTime) : null;
      if (endTime && !endIso) {
        setErr('End time is invalid.');
        return { ok: false };
      }
      if (endIso) {
        const s = safeDate(startIso)?.getTime() ?? 0;
        const e = safeDate(endIso)?.getTime() ?? 0;
        if (e < s) {
          setErr('End time must be after start time.');
          return { ok: false };
        }
      }
    }

    setErr(null);
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
    // If parent doesn’t implement onRefresh, fall back to local list.
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
      alert('Editing is disabled for this share link. Enable editing to change itinerary.');
      return;
    }
    const v = validate();
    if (!v.ok || !v.payload) return;

    try {
      setSaving(true);
      if (editingId) {
        await api.updateItinerary(tripId, editingId, v.payload, opts);
      } else {
        await api.addItinerary(tripId, v.payload, opts);
      }
      await refreshFromServer();
      setFormOpen(false);
      resetForm();
    } catch (e) {
      console.error('Failed to save itinerary item:', e);
      alert('Failed to save itinerary item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this itinerary item?')) return;
    if (tripAccessToken && !canEdit) {
      alert('Editing is disabled for this share link.');
      return;
    }
    try {
      await api.deleteItinerary(tripId, id, opts);
      await refreshFromServer();
    } catch (e) {
      console.error('Failed to delete itinerary item:', e);
      alert('Failed to delete itinerary item.');
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<GroupKey, ItineraryItemRead[]>();
    for (const item of items) {
      const key = getGroupKey(item);
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    }
    // Preserve insertion order but sort within each group by start_time.
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => {
        const da = safeDate(a.start_time)?.getTime() ?? 0;
        const db = safeDate(b.start_time)?.getTime() ?? 0;
        return da - db;
      });
      map.set(k, arr);
    }
    const entries = Array.from(map.entries());
    // Sort groups: Day 1, Day 2, ... then date groups, then Unscheduled.
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
      return 1; // unscheduled last
    });
    return entries;
  }, [items]);

  return (
    <Wrapper>
      <HeaderRow>
        <Title>Itinerary</Title>
        <Toolbar>
          <Subtle>{items.length} item{items.length === 1 ? '' : 's'}</Subtle>
          <Button
            type="button"
            variant="primary"
            onClick={openCreate}
            disabled={tripAccessToken ? !canEdit : false}
            title={tripAccessToken && !canEdit ? 'Enable editing to add items' : undefined}
          >
            Add item
          </Button>
        </Toolbar>
      </HeaderRow>

      {formOpen && (
        <FormCard>
          <Row>
            <div style={{ fontWeight: 900 }}>
              {editingId ? 'Edit itinerary item' : 'Add itinerary item'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
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
              <Button type="button" variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </Row>

          <div style={{ marginTop: '0.75rem' }}>
            <Grid>
              <Field>
                <Label htmlFor="it-title">Title</Label>
                <Input id="it-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field>
                <Label htmlFor="it-type">Type</Label>
                <Select id="it-type" value={itemType} onChange={(e) => setItemType(e.target.value)}>
                  <option value="activity">Activity</option>
                  <option value="transport">Transport</option>
                  <option value="food">Food</option>
                  <option value="lodging">Lodging</option>
                  <option value="other">Other</option>
                </Select>
              </Field>

              <Field>
                <CheckboxLabel>
                  <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
                  All day
                </CheckboxLabel>
                <Subtle>Backend will align start_time to midnight UTC when all-day.</Subtle>
              </Field>

              <Field>
                <Label>{allDay ? 'Date' : 'Start time'}</Label>
                {allDay ? (
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                ) : (
                  <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                )}
              </Field>

              {!allDay && (
                <Field>
                  <Label>End time (optional)</Label>
                  <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </Field>
              )}

              <Field>
                <Label>Location (optional)</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              </Field>

              <Field>
                <Label>Day index (optional)</Label>
                <Input value={dayIndex} onChange={(e) => setDayIndex(e.target.value)} placeholder="1, 2, 3…" />
              </Field>

              <Field>
                <Label>Latitude (optional)</Label>
                <Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="48.858" />
              </Field>

              <Field>
                <Label>Longitude (optional)</Label>
                <Input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="2.294" />
              </Field>
            </Grid>

            <Field style={{ marginTop: '0.75rem' }}>
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>

            {err && <ErrorText>{err}</ErrorText>}
          </div>
        </FormCard>
      )}

      <div style={{ marginBottom: '0.9rem' }}>
        <TripAiEditPanel
          title="AI Edit Itinerary"
          tripId={tripId}
          tripAccessToken={tripAccessToken}
          canEdit={canEdit}
          docRevision={docRevision}
          editDoc={false}
          editItinerary={true}
          onNeedRefresh={refreshFromServer}
        />
      </div>

      {!items.length ? <Subtle>No itinerary items yet.</Subtle> : null}

      {grouped.map(([groupKey, groupItems]) => (
        <Group key={groupKey}>
          <GroupTitle>{formatGroupLabel(groupKey, groupItems)}</GroupTitle>
          <Timeline>
            {groupItems.map((i, idx) => (
              <ItemCard key={i.id || `${i.title}-${i.start_time}-${idx}`}>
                <TimeCol>{formatTimeRange(i.start_time, i.end_time ?? null, i.all_day ?? null)}</TimeCol>
                <MainCol>
                  <Row>
                    <ItemTitle title={i.title}>{i.title}</ItemTitle>
                    <Pills>
                      {i.all_day ? <Pill tone="primary">All day</Pill> : null}
                      <Pill>{i.item_type}</Pill>
                    </Pills>
                  </Row>

                  <Meta>
                    {i.location ? (
                      <MetaItem title={i.location}>
                        <span>📍</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {i.location}
                        </span>
                      </MetaItem>
                    ) : null}
                    {typeof i.lat === 'number' && typeof i.lng === 'number' ? (
                      <MetaItem>
                        <span>🧭</span>
                        <span>
                          {i.lat.toFixed(3)}, {i.lng.toFixed(3)}
                        </span>
                      </MetaItem>
                    ) : null}
                  </Meta>

                  {i.notes ? <Notes>{i.notes}</Notes> : null}

                  <Inline style={{ marginTop: '0.65rem' }}>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => openEdit(i)}
                      disabled={tripAccessToken ? !canEdit : false}
                      title={tripAccessToken && !canEdit ? 'Enable editing to edit items' : undefined}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleDelete(i.id)}
                      disabled={tripAccessToken ? !canEdit : false}
                      title={tripAccessToken && !canEdit ? 'Enable editing to delete items' : undefined}
                    >
                      Delete
                    </Button>
                  </Inline>
                </MainCol>
              </ItemCard>
            ))}
          </Timeline>
        </Group>
      ))}
    </Wrapper>
  );
}


