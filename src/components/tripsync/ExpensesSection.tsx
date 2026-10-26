'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import {
  TripMemberInfo,
  BalanceEntry,
  ExpenseCreate,
  ExpenseRead,
  SettlementRead,
} from '@/types';
import { MockExpense } from '@/lib/mockData';
import {
  EXPENSE_CATEGORIES,
  formatCurrency,
  formatRelativeDate,
  getDateGroupLabel,
  optimizeSettlements,
  getCategoryColor,
  getCategoryEmoji,
  computeExpenseAnalytics,
  getMemberShareForExpense,
  normalizeBalanceArray,
} from '@/lib/expenseUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ToastBanner = styled(motion.div)<{ tone: 'success' | 'error' | 'info' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  border: 1px solid
    ${({ tone }) =>
      tone === 'success'
        ? '#10B98155'
        : tone === 'error'
        ? '#EF444455'
        : '#6366F155'};
  background: ${({ tone }) =>
    tone === 'success'
      ? '#10B98118'
      : tone === 'error'
      ? '#EF444418'
      : '#6366F118'};
  color: ${({ tone, theme }) =>
    tone === 'success'
      ? '#10B981'
      : tone === 'error'
      ? '#EF4444'
      : theme.text};
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
`;

const KpiCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
`;

const KpiLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.mutedText};
`;

const KpiValue = styled.div`
  font-size: 1.35rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const KpiSub = styled.span`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.mutedText};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CategoryBreakdownStrip = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const StackedBar = styled.div`
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.border};
  overflow: hidden;
  display: flex;
  gap: 2px;
`;

const StackedSegment = styled.div<{ widthPct: number; color: string }>`
  width: ${({ widthPct }) => Math.max(widthPct, 2)}%;
  background: ${({ color }) => color};
  height: 100%;
  transition: width 0.3s ease;
`;

const CategoryPillsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
`;

const CategoryFilterChip = styled.button<{ active: boolean; chipColor?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid
    ${({ active, chipColor, theme }) =>
      active ? chipColor || theme.primary : theme.border};
  background: ${({ active, chipColor, theme }) =>
    active ? `${chipColor || theme.primary}22` : theme.background};
  color: ${({ active, chipColor, theme }) =>
    active ? chipColor || theme.primary : theme.text};
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ chipColor, theme }) => chipColor || theme.primary};
  }
`;

const QuickEntryCard = styled.div<{ isEditing: boolean }>`
  background: ${({ theme }) => theme.cardBg};
  border: 1.5px solid
    ${({ isEditing, theme }) => (isEditing ? theme.primary : theme.border)};
  border-radius: 14px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
`;

const QuickEntryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
`;

const QuickEntryTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
`;

const QuickFormGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.1fr 1.1fr 1.2fr auto;
  gap: 0.6rem;
  align-items: end;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  min-width: 0;
`;

const FieldLabel = styled.label`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.mutedText};
`;

const Input = styled.input`
  padding: 0.55rem 0.75rem;
  border-radius: 9px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 0.55rem 0.75rem;
  border-radius: 9px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled.button`
  padding: 0.58rem 1.1rem;
  border-radius: 9px;
  border: none;
  background: ${({ theme }) => theme.primary};
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s ease, transform 0.1s ease;

  &:hover:not(:disabled) {
    opacity: 0.92;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GhostButton = styled.button<{ active?: boolean; danger?: boolean }>`
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  border: 1px solid
    ${({ active, danger, theme }) =>
      danger ? '#EF444466' : active ? theme.primary : theme.border};
  background: ${({ active, danger, theme }) =>
    danger
      ? '#EF444415'
      : active
      ? `${theme.primary}18`
      : 'transparent'};
  color: ${({ active, danger, theme }) =>
    danger ? '#EF4444' : active ? theme.primary : theme.text};
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${({ danger, theme }) => (danger ? '#EF4444' : theme.primary)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AdvancedSplitDrawer = styled(motion.div)`
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px dashed ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SplitToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const SplitMemberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 0.5rem;
`;

const SplitMemberTile = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.65rem;
  border-radius: 10px;
  border: 1px solid
    ${({ selected, theme }) => (selected ? theme.primary : theme.border)};
  background: ${({ selected, theme }) =>
    selected ? `${theme.primary}12` : theme.background};
`;

const MobileModeSwitch = styled.div`
  display: none;
  gap: 0.35rem;
  padding: 0.35rem;
  border-radius: 10px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 920px) {
    display: flex;
  }
`;

const MobileModeTab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 0.5rem 0.6rem;
  border-radius: 7px;
  border: none;
  background: ${({ active, theme }) => (active ? theme.primary : 'transparent')};
  color: ${({ active, theme }) => (active ? '#fff' : theme.text)};
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  cursor: pointer;
`;

const WorkspaceColumns = styled.div<{ focusSettlements?: boolean }>`
  display: grid;
  grid-template-columns: ${({ focusSettlements }) =>
    focusSettlements ? '1fr 1.25fr' : '1.35fr 1fr'};
  gap: 1rem;
  align-items: start;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const CardPanel = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const PanelHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PanelHeading = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 0.45rem;
`;

const FilterToolbar = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 0.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ExpenseGroupBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const GroupDateHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.73rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.mutedText};
  padding: 0.2rem 0.1rem;
`;

const ExpenseRowCard = styled.div<{ expanded: boolean }>`
  background: ${({ theme }) => theme.background};
  border: 1px solid
    ${({ expanded, theme }) => (expanded ? theme.primary : theme.border)};
  border-radius: 11px;
  padding: 0.75rem 0.85rem;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary}88;
  }
`;

const ExpenseMainLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  @media (max-width: 540px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const ExpenseLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  min-width: 0;
  flex: 1;
  cursor: pointer;
`;

const ExpenseTitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const CategoryPill = styled.span<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  background: ${({ color }) => `${color}20`};
  color: ${({ color }) => color};
`;

const ExpenseTitle = styled.span`
  font-size: 0.96rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  word-break: break-word;
`;

const ExpenseSubMeta = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.mutedText};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

const ExpenseRightCol = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;

  @media (max-width: 540px) {
    justify-content: space-between;
    border-top: 1px solid ${({ theme }) => theme.border};
    padding-top: 0.45rem;
  }
`;

const AmountText = styled.span`
  font-size: 1.15rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  font-variant-numeric: tabular-nums;
`;

const ShareBreakdownRow = styled.div`
  margin-top: 0.6rem;
  padding-top: 0.55rem;
  border-top: 1px dashed ${({ theme }) => theme.border};
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const ShareChip = styled.span<{ isPayer?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ isPayer, theme }) =>
    isPayer ? `${theme.primary}18` : theme.cardBg};
  border: 1px solid
    ${({ isPayer, theme }) => (isPayer ? `${theme.primary}55` : theme.border)};
  color: ${({ theme }) => theme.text};
`;

const MemberBalanceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MemberBalanceRow = styled.div<{ activeFilter?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  background: ${({ theme }) => theme.background};
  border: 1px solid
    ${({ activeFilter, theme }) =>
      activeFilter ? theme.primary : theme.border};
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const MemberBalanceTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const AvatarBadge = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: ${({ theme }) => `${theme.primary}25`};
  color: ${({ theme }) => theme.primary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  flex-shrink: 0;
`;

const NetPill = styled.span<{ status: 'owed' | 'owes' | 'settled' }>`
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  background: ${({ status }) =>
    status === 'owed'
      ? '#10B98120'
      : status === 'owes'
      ? '#EF444420'
      : '#64748B20'};
  color: ${({ status }) =>
    status === 'owed'
      ? '#10B981'
      : status === 'owes'
      ? '#EF4444'
      : '#94A3B8'};
`;

const MemberSubStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.mutedText};
  font-variant-numeric: tabular-nums;
`;

const TransferCard = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 11px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const TransferTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const TransferActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ModePillGroup = styled.div`
  display: inline-flex;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  overflow: hidden;
`;

const ModePillButton = styled.button<{ active: boolean }>`
  padding: 0.28rem 0.55rem;
  border: none;
  background: ${({ active, theme }) => (active ? theme.primary : 'transparent')};
  color: ${({ active, theme }) => (active ? '#fff' : theme.mutedText)};
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
`;

const EmptyBox = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.88rem;
  border: 1px dashed ${({ theme }) => theme.border};
  border-radius: 10px;
`;

interface ExpensesSectionProps {
  tripId: string;
  members: TripMemberInfo[];
  expenses: (MockExpense | ExpenseRead)[];
  balances: BalanceEntry[] | { balances?: BalanceEntry[] | null } | null;
  settlements?: SettlementRead[];
  onExpensesChange?: (next: ExpenseRead[]) => void;
  onSettlementsChange?: (next: SettlementRead[]) => void;
  onUpdate: () => void | Promise<void>;
  tripAccessToken?: string;
  canEdit?: boolean;
  initialFocus?: 'expenses' | 'settlements';
  focusSettlements?: boolean;
}

export default function ExpensesSection({
  tripId,
  members,
  expenses: rawExpenses,
  balances: rawBalances,
  settlements: propSettlements,
  onExpensesChange,
  onSettlementsChange,
  onUpdate,
  tripAccessToken,
  canEdit = true,
  initialFocus = 'expenses',
  focusSettlements = false,
}: ExpensesSectionProps) {
  const expenses = rawExpenses as MockExpense[];
  const balances = useMemo(() => normalizeBalanceArray(rawBalances), [rawBalances]);
  const effectiveFocus = focusSettlements ? 'settlements' : initialFocus;
  const [toast, setToast] = useState<{
    message: string;
    tone: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = useCallback(
    (message: string, tone: 'success' | 'error' | 'info' = 'success') => {
      setToast({ message, tone });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Quick Entry / Edit Form State
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState<string>(members[0]?.member_id || '');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(() =>
    members.map((m) => m.member_id)
  );
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [showAdvancedSplit, setShowAdvancedSplit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default paidBy & selectedMembers when members list changes
  useEffect(() => {
    if (members.length === 0) return;
    if (!paidBy || !members.some((m) => m.member_id === paidBy)) {
      setPaidBy(members[0].member_id);
    }
    if (!editingExpenseId && selectedMembers.length === 0) {
      setSelectedMembers(members.map((m) => m.member_id));
    }
  }, [members, paidBy, editingExpenseId, selectedMembers.length]);

  // Filtering & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [memberFilter, setMemberFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);
  const [confirmDeleteExpenseId, setConfirmDeleteExpenseId] = useState<string | null>(null);

  // Mobile pane toggle
  const [mobilePane, setMobilePane] = useState<'expenses' | 'balances' | 'settlements'>(
    effectiveFocus === 'settlements' ? 'settlements' : 'expenses'
  );

  useEffect(() => {
    if (effectiveFocus === 'settlements') {
      setMobilePane('settlements');
      setSettlementTab('suggested');
    } else {
      setMobilePane('expenses');
    }
  }, [effectiveFocus]);

  // Settlements State
  const [settlementTab, setSettlementTab] = useState<'suggested' | 'history' | 'custom'>(
    'suggested'
  );
  const [previousSettlements, setPreviousSettlements] = useState<SettlementRead[]>(
    propSettlements ?? []
  );
  const [loadingSettlements, setLoadingSettlements] = useState(false);
  const [settlementMethods, setSettlementMethods] = useState<
    Record<string, 'UPI' | 'Cash' | 'Card'>
  >({});
  const [settlementCustomAmounts, setSettlementCustomAmounts] = useState<
    Record<string, string>
  >({});
  const [editingTransferKey, setEditingTransferKey] = useState<string | null>(null);
  const [settlingKey, setSettlingKey] = useState<string | null>(null);

  // Custom settlement form
  const [customPayer, setCustomPayer] = useState<string>(members[0]?.member_id || '');
  const [customPayee, setCustomPayee] = useState<string>(
    members[1]?.member_id || members[0]?.member_id || ''
  );
  const [customSettleAmount, setCustomSettleAmount] = useState<string>('');
  const [customSettleMode, setCustomSettleMode] = useState<'upi' | 'cash' | 'card'>('upi');

  // Edit previous settlement state
  const [editingSettlementId, setEditingSettlementId] = useState<string | null>(null);
  const [editSettlementAmount, setEditSettlementAmount] = useState<string>('');
  const [editSettlementMode, setEditSettlementMode] = useState<'upi' | 'cash' | 'card'>('upi');
  const [confirmDeleteSettlementId, setConfirmDeleteSettlementId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (members.length >= 2) {
      if (!customPayer) setCustomPayer(members[0].member_id);
      if (!customPayee || customPayee === customPayer) {
        const second = members.find((m) => m.member_id !== (customPayer || members[0].member_id));
        if (second) setCustomPayee(second.display_name ? second.member_id : '');
      }
    }
  }, [members, customPayer, customPayee]);

  const getMemberName = useCallback(
    (memberId: string) =>
      members.find((m) => m.member_id === memberId)?.display_name ||
      'Former Member',
    [members]
  );

  const fetchSettlements = useCallback(async () => {
    if (tripId === 'demo') {
      if (propSettlements) setPreviousSettlements(propSettlements);
      return;
    }
    try {
      setLoadingSettlements(true);
      const list = await api.listSettlements(
        tripId,
        tripAccessToken ? { tripAccessToken } : undefined
      );
      setPreviousSettlements(list);
    } catch (err) {
      console.error('Failed to fetch settlements:', err);
    } finally {
      setLoadingSettlements(false);
    }
  }, [tripId, tripAccessToken, propSettlements]);

  useEffect(() => {
    void fetchSettlements();
  }, [fetchSettlements, expenses.length, balances]);

  // Analytics & Optimized Settlements
  const analytics = useMemo(
    () => computeExpenseAnalytics(expenses, members, balances),
    [expenses, members, balances]
  );

  const optimizedSettlements = useMemo(() => optimizeSettlements(balances), [balances]);

  const pendingSettlementTotal = useMemo(
    () => optimizedSettlements.reduce((sum, s) => sum + s.amount, 0),
    [optimizedSettlements]
  );

  // Sync suggested settlement amounts whenever optimizedSettlements updates
  useEffect(() => {
    const nextAmounts: Record<string, string> = {};
    optimizedSettlements.forEach((s) => {
      const key = `${s.from}-${s.to}`;
      nextAmounts[key] = s.amount.toFixed(2);
    });
    setSettlementCustomAmounts(nextAmounts);
  }, [optimizedSettlements]);

  // Custom split math helpers
  const parsedTotalAmount = useMemo(() => {
    const n = parseFloat(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const allocatedCustomTotal = useMemo(() => {
    return selectedMembers.reduce((sum, mId) => {
      const val = parseFloat(customAmounts[mId] || '0');
      return sum + (Number.isFinite(val) && val > 0 ? val : 0);
    }, 0);
  }, [selectedMembers, customAmounts]);

  const customRemainder = useMemo(
    () => parseFloat((parsedTotalAmount - allocatedCustomTotal).toFixed(2)),
    [parsedTotalAmount, allocatedCustomTotal]
  );

  const distributeCustomEvenly = () => {
    if (selectedMembers.length === 0 || parsedTotalAmount <= 0) return;
    const baseShare = Math.floor((parsedTotalAmount / selectedMembers.length) * 100) / 100;
    const next: Record<string, string> = {};
    let running = 0;
    selectedMembers.forEach((id, idx) => {
      if (idx === selectedMembers.length - 1) {
        next[id] = Math.max(0, parsedTotalAmount - running).toFixed(2);
      } else {
        next[id] = baseShare.toFixed(2);
        running += baseShare;
      }
    });
    setCustomAmounts(next);
  };

  const assignRemainderToMember = (memberId: string) => {
    const current = parseFloat(customAmounts[memberId] || '0') || 0;
    const updated = Math.max(0, current + customRemainder);
    setCustomAmounts((prev) => ({ ...prev, [memberId]: updated.toFixed(2) }));
  };

  const resetExpenseForm = () => {
    setEditingExpenseId(null);
    setDescription('');
    setAmount('');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setSplitType('equal');
    setSelectedMembers(members.map((m) => m.member_id));
    setCustomAmounts({});
    setShowAdvancedSplit(false);
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tripAccessToken && !canEdit) {
      showToast('Enable editing on this share link to add or modify expenses.', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('Please enter a description for the expense.', 'error');
      return;
    }
    if (parsedTotalAmount <= 0) {
      showToast('Please enter a valid positive amount.', 'error');
      return;
    }
    if (!paidBy) {
      showToast('Please select who paid.', 'error');
      return;
    }
    if (selectedMembers.length === 0) {
      showToast('Select at least one member to split the expense with.', 'error');
      return;
    }

    let custom_splits: { member_id: string; amount: number }[] | undefined;

    if (splitType === 'custom') {
      const splits = selectedMembers.map((mId) => {
        const val = parseFloat(customAmounts[mId] || '0');
        return {
          member_id: mId,
          amount: Number.isFinite(val) && val >= 0 ? parseFloat(val.toFixed(2)) : 0,
        };
      });
      const sumSplits = splits.reduce((acc, s) => acc + s.amount, 0);
      if (Math.abs(sumSplits - parsedTotalAmount) > 0.01) {
        showToast(
          `Custom split total (${formatCurrency(sumSplits)}) must match expense amount (${formatCurrency(
            parsedTotalAmount
          )}).`,
          'error'
        );
        return;
      }
      custom_splits = splits;
    }

    setIsSubmitting(true);
    try {
      const opts = tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined;
      const payload: ExpenseCreate = {
        description: description.trim(),
        amount: parsedTotalAmount,
        paid_by_member_id: paidBy,
        split_with_member_ids: splitType === 'equal' ? selectedMembers : undefined,
        split_type: splitType === 'custom' ? 'exact' : 'equal',
        custom_splits: splitType === 'custom' ? custom_splits : undefined,
        category,
        date: date ? new Date(`${date}T12:00:00Z`).toISOString() : new Date().toISOString(),
      };

      if (tripId === 'demo') {
        const nextItem: ExpenseRead = {
          id: editingExpenseId || `demo-exp-${Date.now()}`,
          description: payload.description,
          amount: payload.amount,
          paid_by_member_id: payload.paid_by_member_id,
          split_with_member_ids: payload.split_with_member_ids || selectedMembers,
          split_type: payload.split_type,
          custom_splits: payload.custom_splits || null,
          category: payload.category,
          date: payload.date,
        };
        const updatedList = editingExpenseId
          ? (expenses as ExpenseRead[]).map((x) =>
              x.id === editingExpenseId ? nextItem : x
            )
          : [nextItem, ...(expenses as ExpenseRead[])];
        onExpensesChange?.(updatedList);
        showToast(
          `${editingExpenseId ? 'Updated' : 'Added'} "${payload.description}" (${formatCurrency(
            payload.amount
          )})`
        );
        resetExpenseForm();
        return;
      }

      if (editingExpenseId) {
        await api.updateExpense(tripId, editingExpenseId, payload, opts);
        showToast(`Updated "${payload.description}" (${formatCurrency(payload.amount)})`);
      } else {
        await api.addExpense(tripId, payload, opts);
        showToast(`Added "${payload.description}" (${formatCurrency(payload.amount)})`);
      }

      resetExpenseForm();
      await onUpdate();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save expense.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEditExpense = (expense: MockExpense) => {
    if (tripAccessToken && !canEdit) {
      showToast('Enable editing on this share link first.', 'error');
      return;
    }
    setEditingExpenseId(expense.id);
    setDescription(expense.description || '');
    setAmount(expense.amount != null ? String(expense.amount) : '');
    setCategory(expense.category || 'Other');
    const parsedDate = expense.date ? expense.date.slice(0, 10) : '';
    setDate(
      /^\d{4}-\d{2}-\d{2}$/.test(parsedDate)
        ? parsedDate
        : new Date().toISOString().split('T')[0]
    );
    setPaidBy(expense.paid_by_member_id || members[0]?.member_id || '');

    if (expense.split_type === 'exact' && Array.isArray(expense.custom_splits)) {
      setSplitType('custom');
      setSelectedMembers(expense.custom_splits.map((cs) => cs.member_id));
      const map: Record<string, string> = {};
      expense.custom_splits.forEach((cs) => {
        map[cs.member_id] = String(cs.amount);
      });
      setCustomAmounts(map);
      setShowAdvancedSplit(true);
    } else {
      setSplitType('equal');
      const ids =
        expense.split_with_member_ids && expense.split_with_member_ids.length > 0
          ? expense.split_with_member_ids
          : members.map((m) => m.member_id);
      setSelectedMembers(ids);
      setCustomAmounts({});
      setShowAdvancedSplit(ids.length !== members.length);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (tripAccessToken && !canEdit) {
      showToast('Enable editing on this share link first.', 'error');
      return;
    }
    if (tripId === 'demo') {
      const next = (expenses as ExpenseRead[]).filter((x) => x.id !== expenseId);
      onExpensesChange?.(next);
      setConfirmDeleteExpenseId(null);
      showToast('Expense deleted.');
      return;
    }
    try {
      await api.deleteExpense(
        tripId,
        expenseId,
        tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined
      );
      setConfirmDeleteExpenseId(null);
      showToast('Expense deleted.');
      await onUpdate();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete expense.', 'error');
    }
  };

  const handleQuickSettle = async (fromId: string, toId: string, defaultAmount: number) => {
    if (tripAccessToken && !canEdit) {
      showToast('Enable editing on this share link to record settlements.', 'error');
      return;
    }
    const key = `${fromId}-${toId}`;
    const mode = (settlementMethods[key] || 'UPI').toLowerCase() as 'upi' | 'cash' | 'card';
    const rawAmt = settlementCustomAmounts[key];
    const finalAmount = rawAmt ? parseFloat(rawAmt) : defaultAmount;

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      showToast('Enter a valid positive settlement amount.', 'error');
      return;
    }

    if (tripId === 'demo') {
      const newS: SettlementRead = {
        id: `demo-settle-${Date.now()}`,
        payer_member_id: fromId,
        payee_member_id: toId,
        amount: parseFloat(finalAmount.toFixed(2)),
        mode,
        created_at: new Date().toISOString(),
      };
      const nextS = [newS, ...previousSettlements];
      setPreviousSettlements(nextS);
      onSettlementsChange?.(nextS);
      setEditingTransferKey(null);
      showToast(
        `Recorded ${formatCurrency(finalAmount)} from ${getMemberName(fromId)} to ${getMemberName(
          toId
        )} (${mode.toUpperCase()})`
      );
      return;
    }

    setSettlingKey(key);
    try {
      await api.addSettlement(
        tripId,
        {
          payer_member_id: fromId,
          payee_member_id: toId,
          amount: parseFloat(finalAmount.toFixed(2)),
          mode,
        },
        tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined
      );
      setEditingTransferKey(null);
      showToast(
        `Recorded ${formatCurrency(finalAmount)} from ${getMemberName(fromId)} to ${getMemberName(
          toId
        )} (${mode.toUpperCase()})`
      );
      await onUpdate();
      await fetchSettlements();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to record settlement.', 'error');
    } finally {
      setSettlingKey(null);
    }
  };

  const handleAddCustomSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tripAccessToken && !canEdit) {
      showToast('Enable editing on this share link to record settlements.', 'error');
      return;
    }
    const amt = parseFloat(customSettleAmount);
    if (!customPayer || !customPayee || customPayer === customPayee) {
      showToast('Payer and recipient must be different members.', 'error');
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      showToast('Please enter a valid positive amount.', 'error');
      return;
    }

    if (tripId === 'demo') {
      const newS: SettlementRead = {
        id: `demo-settle-${Date.now()}`,
        payer_member_id: customPayer,
        payee_member_id: customPayee,
        amount: parseFloat(amt.toFixed(2)),
        mode: customSettleMode,
        created_at: new Date().toISOString(),
      };
      const nextS = [newS, ...previousSettlements];
      setPreviousSettlements(nextS);
      onSettlementsChange?.(nextS);
      setCustomSettleAmount('');
      setSettlementTab('history');
      showToast(
        `Recorded ${formatCurrency(amt)}: ${getMemberName(customPayer)} → ${getMemberName(
          customPayee
        )}`
      );
      return;
    }

    try {
      await api.addSettlement(
        tripId,
        {
          payer_member_id: customPayer,
          payee_member_id: customPayee,
          amount: parseFloat(amt.toFixed(2)),
          mode: customSettleMode,
        },
        tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined
      );
      setCustomSettleAmount('');
      setSettlementTab('history');
      showToast(
        `Recorded ${formatCurrency(amt)}: ${getMemberName(customPayer)} → ${getMemberName(
          customPayee
        )}`
      );
      await onUpdate();
      await fetchSettlements();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to record settlement.', 'error');
    }
  };

  const handleUpdateSettlement = async (settlementId: string) => {
    if (tripAccessToken && !canEdit) {
      showToast('Enable editing on this share link first.', 'error');
      return;
    }
    const amt = parseFloat(editSettlementAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      showToast('Amount must be greater than 0.', 'error');
      return;
    }
    if (tripId === 'demo') {
      const nextS = previousSettlements.map((s) =>
        s.id === settlementId
          ? { ...s, amount: parseFloat(amt.toFixed(2)), mode: editSettlementMode }
          : s
      );
      setPreviousSettlements(nextS);
      onSettlementsChange?.(nextS);
      setEditingSettlementId(null);
      showToast('Settlement updated.');
      return;
    }
    try {
      await api.updateSettlement(
        tripId,
        settlementId,
        { amount: parseFloat(amt.toFixed(2)), mode: editSettlementMode },
        tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined
      );
      setEditingSettlementId(null);
      showToast('Settlement updated.');
      await onUpdate();
      await fetchSettlements();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update settlement.', 'error');
    }
  };

  const handleDeleteSettlement = async (settlementId: string) => {
    if (tripAccessToken && !canEdit) {
      showToast('Enable editing on this share link first.', 'error');
      return;
    }
    if (tripId === 'demo') {
      const nextS = previousSettlements.filter((s) => s.id !== settlementId);
      setPreviousSettlements(nextS);
      onSettlementsChange?.(nextS);
      setConfirmDeleteSettlementId(null);
      showToast('Settlement deleted.');
      return;
    }
    try {
      await api.deleteSettlement(
        tripId,
        settlementId,
        tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined
      );
      setConfirmDeleteSettlementId(null);
      showToast('Settlement deleted.');
      await onUpdate();
      await fetchSettlements();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete settlement.', 'error');
    }
  };

  // Filtered & sorted expenses
  const filteredExpenses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = expenses.filter((exp) => {
      if (categoryFilter !== 'All' && (exp.category || 'Other') !== categoryFilter) {
        return false;
      }
      if (memberFilter !== 'All') {
        const isPayer = exp.paid_by_member_id === memberFilter;
        const share = getMemberShareForExpense(exp, memberFilter);
        if (!isPayer && share <= 0) return false;
      }
      if (q) {
        const descMatch = (exp.description || '').toLowerCase().includes(q);
        const payerMatch = getMemberName(exp.paid_by_member_id || '')
          .toLowerCase()
          .includes(q);
        const catMatch = (exp.category || '').toLowerCase().includes(q);
        if (!descMatch && !payerMatch && !catMatch) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'highest') return Number(b.amount || 0) - Number(a.amount || 0);
      if (sortBy === 'lowest') return Number(a.amount || 0) - Number(b.amount || 0);
      const da = new Date(a.date || 0).getTime() || 0;
      const db = new Date(b.date || 0).getTime() || 0;
      return db - da;
    });
  }, [expenses, categoryFilter, memberFilter, searchQuery, sortBy, getMemberName]);

  const groupedExpenses = useMemo(() => {
    if (sortBy !== 'newest') {
      return [['Sorted Results', filteredExpenses] as const];
    }
    const groups: Record<string, MockExpense[]> = {};
    filteredExpenses.forEach((exp) => {
      const label = getDateGroupLabel(exp.date);
      if (!groups[label]) groups[label] = [];
      groups[label].push(exp);
    });
    const order = ['Today', 'Yesterday', 'This Week', 'Earlier'];
    return order.filter((k) => groups[k]?.length).map((k) => [k, groups[k]] as const);
  }, [filteredExpenses, sortBy]);

  const exportExpensesCsv = () => {
    if (expenses.length === 0) return;
    const headers = ['Date', 'Description', 'Category', 'Amount (INR)', 'Paid By', 'Split Type'];
    const rows = expenses.map((e) => [
      (e.date || '').slice(0, 10),
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.category || 'Other',
      Number(e.amount || 0).toFixed(2),
      `"${getMemberName(e.paid_by_member_id || '').replace(/"/g, '""')}"`,
      e.split_type || 'equal',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip-expenses-${tripId.slice(-6)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported expenses to CSV.', 'info');
  };

  return (
    <Container>
      <AnimatePresence>
        {toast && (
          <ToastBanner
            tone={toast.tone}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <span>{toast.message}</span>
            <GhostButton type="button" onClick={() => setToast(null)}>
              ✕
            </GhostButton>
          </ToastBanner>
        )}
      </AnimatePresence>

      {/* Top Compact KPI Strip */}
      <KpiGrid>
        <KpiCard>
          <KpiLabel>Total Trip Spend</KpiLabel>
          <KpiValue>{formatCurrency(analytics.totalSpent)}</KpiValue>
          <KpiSub>
            {analytics.expenseCount} expense{analytics.expenseCount === 1 ? '' : 's'} • Avg{' '}
            {formatCurrency(analytics.avgPerExpense)}
          </KpiSub>
        </KpiCard>

        <KpiCard>
          <KpiLabel>Avg / Member</KpiLabel>
          <KpiValue>{formatCurrency(analytics.avgPerPerson)}</KpiValue>
          <KpiSub>Across {members.length} trip members</KpiSub>
        </KpiCard>

        <KpiCard>
          <KpiLabel>Top Category</KpiLabel>
          <KpiValue>
            {analytics.topCategory
              ? `${analytics.topCategory.emoji} ${analytics.topCategory.category}`
              : '—'}
          </KpiValue>
          <KpiSub>
            {analytics.topCategory
              ? `${formatCurrency(analytics.topCategory.amount)} (${Math.round(
                  analytics.topCategory.percentage
                )}%)`
              : 'No expenses yet'}
          </KpiSub>
        </KpiCard>

        <KpiCard>
          <KpiLabel>Settlement Status</KpiLabel>
          <KpiValue
            style={{
              color: optimizedSettlements.length === 0 ? '#10B981' : undefined,
            }}
          >
            {optimizedSettlements.length === 0
              ? 'All Settled ✓'
              : `${optimizedSettlements.length} Transfer${
                  optimizedSettlements.length === 1 ? '' : 's'
                }`}
          </KpiValue>
          <KpiSub>
            {optimizedSettlements.length === 0
              ? `${previousSettlements.length} recorded payment${
                  previousSettlements.length === 1 ? '' : 's'
                }`
              : `${formatCurrency(pendingSettlementTotal)} left to settle`}
          </KpiSub>
        </KpiCard>
      </KpiGrid>

      {/* Proportional Category Bar + 1-Click Category Filter Pills */}
      {analytics.byCategory.length > 0 && (
        <CategoryBreakdownStrip>
          <StackedBar>
            {analytics.byCategory.map((cat) => (
              <StackedSegment
                key={cat.category}
                widthPct={cat.percentage}
                color={cat.color}
                title={`${cat.category}: ${formatCurrency(cat.amount)} (${Math.round(
                  cat.percentage
                )}%)`}
              />
            ))}
          </StackedBar>
          <CategoryPillsRow>
            <CategoryFilterChip
              type="button"
              active={categoryFilter === 'All'}
              onClick={() => setCategoryFilter('All')}
            >
              All ({expenses.length})
            </CategoryFilterChip>
            {analytics.byCategory.map((cat) => (
              <CategoryFilterChip
                key={cat.category}
                type="button"
                active={categoryFilter === cat.category}
                chipColor={cat.color}
                onClick={() =>
                  setCategoryFilter((cur) => (cur === cat.category ? 'All' : cat.category))
                }
              >
                <span>{cat.emoji}</span>
                <span>{cat.category}</span>
                <span style={{ opacity: 0.8 }}>{formatCurrency(cat.amount)}</span>
              </CategoryFilterChip>
            ))}
          </CategoryPillsRow>
        </CategoryBreakdownStrip>
      )}

      {/* Always-Ready 1-Row Quick Add / Edit Expense Bar */}
      <QuickEntryCard isEditing={!!editingExpenseId}>
        <form onSubmit={handleSubmitExpense}>
          <QuickEntryHeader>
            <QuickEntryTitle>
              <span>{editingExpenseId ? '✏️ Editing Expense' : '⚡ Quick Add Expense'}</span>
              {splitType === 'equal' && selectedMembers.length > 0 && parsedTotalAmount > 0 && (
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#10B981',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    background: '#10B98118',
                  }}
                >
                  {formatCurrency(parsedTotalAmount / selectedMembers.length)} / person (
                  {selectedMembers.length})
                </span>
              )}
            </QuickEntryTitle>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              <GhostButton
                type="button"
                active={showAdvancedSplit || splitType === 'custom'}
                onClick={() => setShowAdvancedSplit((v) => !v)}
              >
                {splitType === 'custom'
                  ? 'Custom Split (Exact)'
                  : `Split: ${
                      selectedMembers.length === members.length
                        ? 'Everyone'
                        : `${selectedMembers.length}/${members.length}`
                    }`}{' '}
                {showAdvancedSplit ? '▴' : '▾'}
              </GhostButton>
              {editingExpenseId && (
                <GhostButton type="button" onClick={resetExpenseForm}>
                  Cancel Edit
                </GhostButton>
              )}
            </div>
          </QuickEntryHeader>

          <QuickFormGrid>
            <FieldGroup>
              <FieldLabel htmlFor="exp-desc">What was it for?</FieldLabel>
              <Input
                id="exp-desc"
                type="text"
                placeholder="e.g. Dinner at Beach Shack, Cab to Airport…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEdit || isSubmitting}
                required
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="exp-amount">Amount (₹)</FieldLabel>
              <Input
                id="exp-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!canEdit || isSubmitting}
                required
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="exp-cat">Category</FieldLabel>
              <Select
                id="exp-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={!canEdit || isSubmitting}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryEmoji(cat)} {cat}
                  </option>
                ))}
              </Select>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="exp-paidby">Paid By</FieldLabel>
              <Select
                id="exp-paidby"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                disabled={!canEdit || isSubmitting}
              >
                {members.map((m) => (
                  <option key={m.member_id} value={m.member_id}>
                    {m.display_name}
                  </option>
                ))}
              </Select>
            </FieldGroup>

            <PrimaryButton
              type="submit"
              disabled={!canEdit || isSubmitting || members.length === 0}
            >
              {isSubmitting
                ? 'Saving…'
                : editingExpenseId
                ? 'Save Changes'
                : '+ Add Expense'}
            </PrimaryButton>
          </QuickFormGrid>

          <AnimatePresence>
            {showAdvancedSplit && (
              <AdvancedSplitDrawer
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <SplitToolbar>
                  <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <GhostButton
                      type="button"
                      active={splitType === 'equal'}
                      onClick={() => setSplitType('equal')}
                    >
                      ÷ Equal Split
                    </GhostButton>
                    <GhostButton
                      type="button"
                      active={splitType === 'custom'}
                      onClick={() => {
                        setSplitType('custom');
                        if (Object.keys(customAmounts).length === 0 && parsedTotalAmount > 0) {
                          distributeCustomEvenly();
                        }
                      }}
                    >
                      ✎ Exact Amounts
                    </GhostButton>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.35rem' }}>
                      <FieldLabel htmlFor="exp-date" style={{ margin: 0 }}>
                        Date:
                      </FieldLabel>
                      <Input
                        id="exp-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ width: 'auto', padding: '0.35rem 0.55rem', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <GhostButton
                      type="button"
                      onClick={() => setSelectedMembers(members.map((m) => m.member_id))}
                    >
                      All ({members.length})
                    </GhostButton>
                    <GhostButton
                      type="button"
                      onClick={() =>
                        setSelectedMembers((prev) =>
                          members
                            .map((m) => m.member_id)
                            .filter((id) => !prev.includes(id))
                        )
                      }
                    >
                      Invert
                    </GhostButton>
                    {splitType === 'custom' && (
                      <GhostButton type="button" onClick={distributeCustomEvenly}>
                        Split Evenly
                      </GhostButton>
                    )}
                  </div>
                </SplitToolbar>

                {splitType === 'custom' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      background:
                        Math.abs(customRemainder) < 0.01 ? '#10B98115' : '#F59E0B18',
                      border: `1px solid ${
                        Math.abs(customRemainder) < 0.01 ? '#10B98155' : '#F59E0B55'
                      }`,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>
                      Allocated: {formatCurrency(allocatedCustomTotal)} /{' '}
                      {formatCurrency(parsedTotalAmount)}
                    </span>
                    <span
                      style={{
                        color: Math.abs(customRemainder) < 0.01 ? '#10B981' : '#F59E0B',
                      }}
                    >
                      {Math.abs(customRemainder) < 0.01
                        ? '✓ Exact match'
                        : customRemainder > 0
                        ? `${formatCurrency(customRemainder)} remaining`
                        : `${formatCurrency(Math.abs(customRemainder))} over total`}
                    </span>
                  </div>
                )}

                <SplitMemberGrid>
                  {members.map((member) => {
                    const isSelected = selectedMembers.includes(member.member_id);
                    const equalShare =
                      isSelected && selectedMembers.length > 0
                        ? parsedTotalAmount / selectedMembers.length
                        : 0;
                    return (
                      <SplitMemberTile key={member.member_id} selected={isSelected}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.86rem',
                            minWidth: 0,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleMemberToggle(member.member_id)}
                          />
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {member.display_name}
                          </span>
                        </label>

                        {splitType === 'equal' ? (
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: isSelected ? '#10B981' : '#94A3B8',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {isSelected ? formatCurrency(equalShare) : '₹0'}
                          </span>
                        ) : (
                          isSelected && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={customAmounts[member.member_id] ?? ''}
                                onChange={(e) =>
                                  setCustomAmounts((prev) => ({
                                    ...prev,
                                    [member.member_id]: e.target.value,
                                  }))
                                }
                                style={{
                                  width: '86px',
                                  padding: '0.3rem 0.45rem',
                                  fontSize: '0.82rem',
                                  textAlign: 'right',
                                }}
                              />
                              {Math.abs(customRemainder) >= 0.01 && (
                                <GhostButton
                                  type="button"
                                  title="Assign remaining balance to this member"
                                  onClick={() => assignRemainderToMember(member.member_id)}
                                  style={{ padding: '0.25rem 0.4rem', fontSize: '0.7rem' }}
                                >
                                  +Rem
                                </GhostButton>
                              )}
                            </div>
                          )
                        )}
                      </SplitMemberTile>
                    );
                  })}
                </SplitMemberGrid>
              </AdvancedSplitDrawer>
            )}
          </AnimatePresence>
        </form>
      </QuickEntryCard>

      {/* Mobile Mode Switcher */}
      <MobileModeSwitch>
        <MobileModeTab
          type="button"
          active={mobilePane === 'expenses'}
          onClick={() => setMobilePane('expenses')}
        >
          Expenses ({filteredExpenses.length})
        </MobileModeTab>
        <MobileModeTab
          type="button"
          active={mobilePane === 'balances'}
          onClick={() => setMobilePane('balances')}
        >
          Balances
        </MobileModeTab>
        <MobileModeTab
          type="button"
          active={mobilePane === 'settlements'}
          onClick={() => setMobilePane('settlements')}
        >
          Settle ({optimizedSettlements.length})
        </MobileModeTab>
      </MobileModeSwitch>

      {/* Unified 2-Column Workspace */}
      <WorkspaceColumns focusSettlements={effectiveFocus === 'settlements'}>
        {/* Left Column: Expenses Feed */}
        <CardPanel
          style={{
            display:
              mobilePane !== 'expenses' && typeof window !== 'undefined' && window.innerWidth <= 920
                ? undefined
                : 'flex',
          }}
        >
          <PanelHeaderRow>
            <PanelHeading>
              <span>🧾 Expenses</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.7 }}>
                ({filteredExpenses.length} of {expenses.length})
              </span>
            </PanelHeading>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {(categoryFilter !== 'All' || memberFilter !== 'All' || searchQuery) && (
                <GhostButton
                  type="button"
                  onClick={() => {
                    setCategoryFilter('All');
                    setMemberFilter('All');
                    setSearchQuery('');
                  }}
                >
                  Reset Filters
                </GhostButton>
              )}
              {expenses.length > 0 && (
                <GhostButton type="button" onClick={exportExpensesCsv}>
                  ⬇ CSV
                </GhostButton>
              )}
            </div>
          </PanelHeaderRow>

          <FilterToolbar>
            <Input
              type="search"
              placeholder="Search description, payer, category…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              aria-label="Filter by member"
            >
              <option value="All">👥 All Members</option>
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  Involving {m.display_name}
                </option>
              ))}
            </Select>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'highest' | 'lowest')}
              aria-label="Sort expenses"
            >
              <option value="newest">🕒 Newest First</option>
              <option value="highest">⬆️ Highest Amount</option>
              <option value="lowest">⬇️ Lowest Amount</option>
            </Select>
          </FilterToolbar>

          {filteredExpenses.length === 0 ? (
            <EmptyBox>
              {expenses.length === 0
                ? 'No expenses logged yet. Use the Quick Add bar above to add your first expense!'
                : 'No expenses match your active filters.'}
            </EmptyBox>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {groupedExpenses.map(([groupLabel, groupItems]) => {
                const groupSum = groupItems.reduce(
                  (acc, item) => acc + Number(item.amount || 0),
                  0
                );
                return (
                  <ExpenseGroupBlock key={groupLabel}>
                    <GroupDateHeader>
                      <span>{groupLabel}</span>
                      <span>{formatCurrency(groupSum)}</span>
                    </GroupDateHeader>

                    {groupItems.map((expense) => {
                      const isExpanded = expandedExpenseId === expense.id;
                      const catColor = getCategoryColor(expense.category || 'Other');
                      const catEmoji = getCategoryEmoji(expense.category || 'Other');
                      const participantCount =
                        expense.split_type === 'exact'
                          ? expense.custom_splits?.length || 0
                          : expense.split_with_member_ids?.length || 0;
                      const perPerson =
                        expense.split_type !== 'exact' && participantCount > 0
                          ? Number(expense.amount || 0) / participantCount
                          : null;

                      return (
                        <ExpenseRowCard key={expense.id} expanded={isExpanded}>
                          <ExpenseMainLine>
                            <ExpenseLeft
                              onClick={() =>
                                setExpandedExpenseId((cur) =>
                                  cur === expense.id ? null : expense.id
                                )
                              }
                              title="Click to toggle per-person breakdown"
                            >
                              <ExpenseTitleLine>
                                <CategoryPill color={catColor}>
                                  {catEmoji} {expense.category || 'Other'}
                                </CategoryPill>
                                <ExpenseTitle>{expense.description}</ExpenseTitle>
                              </ExpenseTitleLine>

                              <ExpenseSubMeta>
                                <span>
                                  Paid by{' '}
                                  <strong>
                                    {getMemberName(expense.paid_by_member_id || '')}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span>
                                  {expense.split_type === 'exact'
                                    ? `Exact split (${participantCount})`
                                    : `${participantCount} people${
                                        perPerson != null
                                          ? ` (${formatCurrency(perPerson)}/ea)`
                                          : ''
                                      }`}
                                </span>
                                <span>•</span>
                                <span>{formatRelativeDate(expense.date)}</span>
                              </ExpenseSubMeta>
                            </ExpenseLeft>

                            <ExpenseRightCol>
                              <AmountText>{formatCurrency(expense.amount || 0)}</AmountText>
                              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                <GhostButton
                                  type="button"
                                  onClick={() =>
                                    setExpandedExpenseId((cur) =>
                                      cur === expense.id ? null : expense.id
                                    )
                                  }
                                  title="View split details"
                                  style={{ padding: '0.3rem 0.5rem' }}
                                >
                                  {isExpanded ? '▴' : '▾'}
                                </GhostButton>
                                <GhostButton
                                  type="button"
                                  onClick={() => handleStartEditExpense(expense)}
                                  disabled={!canEdit}
                                  title="Edit expense"
                                  style={{ padding: '0.3rem 0.5rem' }}
                                >
                                  ✏️
                                </GhostButton>
                                {confirmDeleteExpenseId === expense.id ? (
                                  <>
                                    <GhostButton
                                      type="button"
                                      danger
                                      onClick={() => handleDeleteExpense(expense.id)}
                                      style={{ padding: '0.3rem 0.5rem' }}
                                    >
                                      Confirm
                                    </GhostButton>
                                    <GhostButton
                                      type="button"
                                      onClick={() => setConfirmDeleteExpenseId(null)}
                                      style={{ padding: '0.3rem 0.5rem' }}
                                    >
                                      No
                                    </GhostButton>
                                  </>
                                ) : (
                                  <GhostButton
                                    type="button"
                                    onClick={() => setConfirmDeleteExpenseId(expense.id)}
                                    disabled={!canEdit}
                                    title="Delete expense"
                                    style={{ padding: '0.3rem 0.5rem' }}
                                  >
                                    🗑️
                                  </GhostButton>
                                )}
                              </div>
                            </ExpenseRightCol>
                          </ExpenseMainLine>

                          {isExpanded && (
                            <ShareBreakdownRow>
                              {members.map((m) => {
                                const share = getMemberShareForExpense(expense, m.member_id);
                                const isPayer = expense.paid_by_member_id === m.member_id;
                                if (share <= 0 && !isPayer) return null;
                                return (
                                  <ShareChip key={m.member_id} isPayer={isPayer}>
                                    <span>{m.display_name}:</span>
                                    <strong>{formatCurrency(share)}</strong>
                                    {isPayer && (
                                      <span style={{ opacity: 0.75 }}>(Paid total)</span>
                                    )}
                                  </ShareChip>
                                );
                              })}
                            </ShareBreakdownRow>
                          )}
                        </ExpenseRowCard>
                      );
                    })}
                  </ExpenseGroupBlock>
                );
              })}
            </div>
          )}
        </CardPanel>

        {/* Right Column: Member Balances + Smart Settlements Hub */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Member Balances & Spending Matrix */}
          <CardPanel>
            <PanelHeaderRow>
              <PanelHeading>⚖️ Member Balances & Shares</PanelHeading>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Click a member to filter
              </span>
            </PanelHeaderRow>

            <MemberBalanceList>
              {analytics.byMember.map((stat) => {
                const status =
                  stat.netBalance > 0.01
                    ? 'owed'
                    : stat.netBalance < -0.01
                    ? 'owes'
                    : 'settled';
                const initials = stat.display_name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);
                const isFiltered = memberFilter === stat.member_id;

                return (
                  <MemberBalanceRow
                    key={stat.member_id}
                    activeFilter={isFiltered}
                    onClick={() =>
                      setMemberFilter((cur) =>
                        cur === stat.member_id ? 'All' : stat.member_id
                      )
                    }
                  >
                    <MemberBalanceTop>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <AvatarBadge>{initials}</AvatarBadge>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {stat.display_name}
                          </div>
                        </div>
                      </div>

                      <NetPill status={status}>
                        {status === 'owed'
                          ? `Gets back +${formatCurrency(stat.netBalance)}`
                          : status === 'owes'
                          ? `Owes ${formatCurrency(Math.abs(stat.netBalance))}`
                          : 'Settled ₹0'}
                      </NetPill>
                    </MemberBalanceTop>

                    <MemberSubStats>
                      <span>
                        Paid: <strong>{formatCurrency(stat.paidTotal)}</strong> ({stat.paidCount}{' '}
                        exp)
                      </span>
                      <span>
                        Trip Share: <strong>{formatCurrency(stat.shareTotal)}</strong>
                      </span>
                    </MemberSubStats>
                  </MemberBalanceRow>
                );
              })}
            </MemberBalanceList>
          </CardPanel>

          {/* Smart Settlements Hub */}
          <CardPanel>
            <PanelHeaderRow>
              <PanelHeading>🤝 Settlements</PanelHeading>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <GhostButton
                  type="button"
                  active={settlementTab === 'suggested'}
                  onClick={() => setSettlementTab('suggested')}
                >
                  Suggested ({optimizedSettlements.length})
                </GhostButton>
                <GhostButton
                  type="button"
                  active={settlementTab === 'custom'}
                  onClick={() => setSettlementTab('custom')}
                >
                  + Record
                </GhostButton>
                <GhostButton
                  type="button"
                  active={settlementTab === 'history'}
                  onClick={() => setSettlementTab('history')}
                >
                  History ({previousSettlements.length})
                </GhostButton>
              </div>
            </PanelHeaderRow>

            {settlementTab === 'suggested' && (
              <>
                {optimizedSettlements.length === 0 ? (
                  <EmptyBox>
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>🎉</div>
                    <strong>Everyone is settled up!</strong>
                    <div style={{ marginTop: '0.25rem' }}>
                      No pending balances between trip members.
                    </div>
                  </EmptyBox>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {optimizedSettlements.map((settlement) => {
                      const key = `${settlement.from}-${settlement.to}`;
                      const mode = settlementMethods[key] || 'UPI';
                      const customAmt =
                        settlementCustomAmounts[key] ?? settlement.amount.toFixed(2);
                      const isEditingAmt = editingTransferKey === key;

                      return (
                        <TransferCard key={key}>
                          <TransferTopRow>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                              <span>{getMemberName(settlement.from)}</span>
                              <span style={{ margin: '0 0.4rem', opacity: 0.6 }}>pays</span>
                              <span>{getMemberName(settlement.to)}</span>
                            </div>
                            <AmountText style={{ fontSize: '1.05rem', color: '#10B981' }}>
                              {formatCurrency(Number(customAmt) || settlement.amount)}
                            </AmountText>
                          </TransferTopRow>

                          {isEditingAmt && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <FieldLabel style={{ margin: 0 }}>Custom Amount (₹):</FieldLabel>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={customAmt}
                                onChange={(e) =>
                                  setSettlementCustomAmounts((prev) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                  }))
                                }
                                style={{ width: '120px', padding: '0.35rem 0.5rem' }}
                              />
                            </div>
                          )}

                          <TransferActionsRow>
                            <ModePillGroup>
                              {(['UPI', 'Cash', 'Card'] as const).map((m) => (
                                <ModePillButton
                                  key={m}
                                  type="button"
                                  active={mode === m}
                                  onClick={() =>
                                    setSettlementMethods((prev) => ({ ...prev, [key]: m }))
                                  }
                                >
                                  {m}
                                </ModePillButton>
                              ))}
                            </ModePillGroup>

                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <GhostButton
                                type="button"
                                onClick={() =>
                                  setEditingTransferKey((cur) => (cur === key ? null : key))
                                }
                              >
                                {isEditingAmt ? 'Done' : 'Partial ₹'}
                              </GhostButton>
                              <PrimaryButton
                                type="button"
                                disabled={!canEdit || settlingKey === key}
                                onClick={() =>
                                  handleQuickSettle(
                                    settlement.from,
                                    settlement.to,
                                    settlement.amount
                                  )
                                }
                                style={{ padding: '0.42rem 0.85rem', fontSize: '0.8rem' }}
                              >
                                {settlingKey === key ? 'Recording…' : '✓ Settle Now'}
                              </PrimaryButton>
                            </div>
                          </TransferActionsRow>
                        </TransferCard>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {settlementTab === 'custom' && (
              <form
                onSubmit={handleAddCustomSettlement}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <FieldGroup>
                    <FieldLabel>Payer (Who Paid)</FieldLabel>
                    <Select
                      value={customPayer}
                      onChange={(e) => setCustomPayer(e.target.value)}
                      disabled={!canEdit}
                    >
                      {members.map((m) => (
                        <option key={m.member_id} value={m.member_id}>
                          {m.display_name}
                        </option>
                      ))}
                    </Select>
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Recipient (Paid To)</FieldLabel>
                    <Select
                      value={customPayee}
                      onChange={(e) => setCustomPayee(e.target.value)}
                      disabled={!canEdit}
                    >
                      {members.map((m) => (
                        <option key={m.member_id} value={m.member_id}>
                          {m.display_name}
                        </option>
                      ))}
                    </Select>
                  </FieldGroup>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <FieldGroup>
                    <FieldLabel>Amount (₹)</FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={customSettleAmount}
                      onChange={(e) => setCustomSettleAmount(e.target.value)}
                      disabled={!canEdit}
                      required
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Mode</FieldLabel>
                    <Select
                      value={customSettleMode}
                      onChange={(e) =>
                        setCustomSettleMode(e.target.value as 'upi' | 'cash' | 'card')
                      }
                      disabled={!canEdit}
                    >
                      <option value="upi">UPI</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                    </Select>
                  </FieldGroup>
                </div>

                <PrimaryButton type="submit" disabled={!canEdit}>
                  Record Settlement
                </PrimaryButton>
              </form>
            )}

            {settlementTab === 'history' && (
              <>
                {loadingSettlements ? (
                  <EmptyBox>Loading settlement history…</EmptyBox>
                ) : previousSettlements.length === 0 ? (
                  <EmptyBox>No settlements recorded yet.</EmptyBox>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {previousSettlements.map((s) => {
                      const isEditing = editingSettlementId === s.id;
                      const ts =
                        s.created_at ||
                        (s as unknown as { createdAt?: string; date?: string }).createdAt ||
                        (s as unknown as { date?: string }).date;
                      return (
                        <TransferCard key={s.id}>
                          <TransferTopRow>
                            <div style={{ fontSize: '0.86rem' }}>
                              <strong>{getMemberName(s.payer_member_id)}</strong>
                              <span style={{ opacity: 0.65 }}> → </span>
                              <strong>{getMemberName(s.payee_member_id)}</strong>
                              <div style={{ fontSize: '0.74rem', opacity: 0.65 }}>
                                {s.mode.toUpperCase()} •{' '}
                                {ts ? formatRelativeDate(ts) : 'Recorded'}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <AmountText style={{ fontSize: '0.98rem' }}>
                                {formatCurrency(s.amount)}
                              </AmountText>
                              <GhostButton
                                type="button"
                                disabled={!canEdit}
                                onClick={() => {
                                  if (isEditing) {
                                    setEditingSettlementId(null);
                                  } else {
                                    setEditingSettlementId(s.id);
                                    setEditSettlementAmount(String(s.amount));
                                    setEditSettlementMode(s.mode || 'upi');
                                  }
                                }}
                                style={{ padding: '0.25rem 0.45rem' }}
                              >
                                ✏️
                              </GhostButton>
                              {confirmDeleteSettlementId === s.id ? (
                                <>
                                  <GhostButton
                                    type="button"
                                    danger
                                    onClick={() => handleDeleteSettlement(s.id)}
                                    style={{ padding: '0.25rem 0.45rem' }}
                                  >
                                    Delete
                                  </GhostButton>
                                  <GhostButton
                                    type="button"
                                    onClick={() => setConfirmDeleteSettlementId(null)}
                                    style={{ padding: '0.25rem 0.45rem' }}
                                  >
                                    Cancel
                                  </GhostButton>
                                </>
                              ) : (
                                <GhostButton
                                  type="button"
                                  disabled={!canEdit}
                                  onClick={() => setConfirmDeleteSettlementId(s.id)}
                                  style={{ padding: '0.25rem 0.45rem' }}
                                >
                                  🗑️
                                </GhostButton>
                              )}
                            </div>
                          </TransferTopRow>

                          {isEditing && (
                            <div
                              style={{
                                display: 'flex',
                                gap: '0.45rem',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                              }}
                            >
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={editSettlementAmount}
                                onChange={(e) => setEditSettlementAmount(e.target.value)}
                                style={{ width: '110px', padding: '0.35rem 0.5rem' }}
                              />
                              <Select
                                value={editSettlementMode}
                                onChange={(e) =>
                                  setEditSettlementMode(
                                    e.target.value as 'upi' | 'cash' | 'card'
                                  )
                                }
                                style={{ width: '95px', padding: '0.35rem 0.5rem' }}
                              >
                                <option value="upi">UPI</option>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                              </Select>
                              <PrimaryButton
                                type="button"
                                onClick={() => handleUpdateSettlement(s.id)}
                                style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                              >
                                Save
                              </PrimaryButton>
                            </div>
                          )}
                        </TransferCard>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </CardPanel>
        </div>
      </WorkspaceColumns>
    </Container>
  );
}
