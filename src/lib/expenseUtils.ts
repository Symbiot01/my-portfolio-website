// Utility functions for expense calculations, analytics, and formatting

import { BalanceEntry, ExpenseRead, TripMemberInfo } from '@/types';
import { MockExpense } from '@/lib/mockData';

export type AnyExpense = MockExpense | ExpenseRead;

export const EXPENSE_CATEGORIES = [
  'Food',
  'Food & Drinks',
  'Transport',
  'Accommodation',
  'Lodging',
  'Activities',
  'Shopping',
  'Groceries',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const formatCurrency = (amount: number): string => {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(safe);
};

export const formatRelativeDate = (dateString?: string | null): string => {
  if (!dateString) return 'Today';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Today';
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInMs < 0) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  if (diffInHours < 1) {
    const minutes = Math.max(0, Math.floor(diffInMs / (1000 * 60)));
    if (minutes === 0) return 'Just now';
    return `${minutes}m ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours}h ago`;
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

export const getDateGroupLabel = (dateString?: string | null): string => {
  if (!dateString) return 'Today';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Today';
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const targetStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
  const diffInDays = Math.round(
    (todayStart - targetStart) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays <= 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return 'This Week';
  return 'Earlier';
};

export const calculateSplitAmount = (
  totalAmount: number,
  splitMembers: string[],
  customAmounts?: Record<string, number>
): Record<string, number> => {
  if (customAmounts) {
    return customAmounts;
  }

  const perPersonAmount =
    splitMembers.length > 0 ? totalAmount / splitMembers.length : 0;
  const result: Record<string, number> = {};
  splitMembers.forEach((memberId) => {
    result[memberId] = perPersonAmount;
  });
  return result;
};

export const getMemberShareForExpense = (
  expense: AnyExpense,
  memberId: string
): number => {
  const amount = Number(expense.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) return 0;

  if (Array.isArray(expense.custom_splits) && expense.custom_splits.length > 0) {
    const found = expense.custom_splits.find((cs) => cs.member_id === memberId);
    return found && Number.isFinite(found.amount) ? found.amount : 0;
  }

  const participants = expense.split_with_member_ids || [];
  if (!participants.includes(memberId) || participants.length === 0) return 0;
  return amount / participants.length;
};

export interface CategoryStat {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
  emoji: string;
}

export interface MemberExpenseStat {
  member_id: string;
  memberId: string;
  display_name: string;
  displayName: string;
  paidTotal: number;
  totalPaid: number;
  shareTotal: number;
  totalShare: number;
  netBalance: number;
  paidCount: number;
}

export interface ExpenseAnalytics {
  totalSpent: number;
  totalAmount: number;
  expenseCount: number;
  avgPerExpense: number;
  avgPerPerson: number;
  averagePerPerson: number;
  topCategory: CategoryStat | null;
  byCategory: CategoryStat[];
  byMember: MemberExpenseStat[];
  memberStats: MemberExpenseStat[];
}

type BalanceInput =
  | BalanceEntry[]
  | { balances?: BalanceEntry[] | null }
  | null
  | undefined;

export function normalizeBalanceArray(balances?: BalanceInput): BalanceEntry[] {
  if (!balances) return [];
  if (Array.isArray(balances)) return balances;
  if ('balances' in balances && Array.isArray(balances.balances)) {
    return balances.balances;
  }
  return [];
}

export const computeExpenseAnalytics = (
  expenses: AnyExpense[],
  members: TripMemberInfo[],
  balances?: BalanceInput
): ExpenseAnalytics => {
  let totalSpent = 0;
  const categoryMap = new Map<string, { amount: number; count: number }>();
  const paidMap = new Map<string, { amount: number; count: number }>();
  const shareMap = new Map<string, number>();

  members.forEach((m) => {
    paidMap.set(m.member_id, { amount: 0, count: 0 });
    shareMap.set(m.member_id, 0);
  });

  for (const exp of expenses) {
    const amt = Number(exp.amount || 0);
    if (!Number.isFinite(amt) || amt <= 0) continue;
    totalSpent += amt;

    const cat = exp.category || 'Other';
    const prevCat = categoryMap.get(cat) || { amount: 0, count: 0 };
    categoryMap.set(cat, {
      amount: prevCat.amount + amt,
      count: prevCat.count + 1,
    });

    if (exp.paid_by_member_id) {
      const prevPaid = paidMap.get(exp.paid_by_member_id) || {
        amount: 0,
        count: 0,
      };
      paidMap.set(exp.paid_by_member_id, {
        amount: prevPaid.amount + amt,
        count: prevPaid.count + 1,
      });
    }

    for (const m of members) {
      const share = getMemberShareForExpense(exp, m.member_id);
      if (share > 0) {
        shareMap.set(m.member_id, (shareMap.get(m.member_id) || 0) + share);
      }
    }
  }

  const byCategory: CategoryStat[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
      color: getCategoryColor(category),
      emoji: getCategoryEmoji(category),
    }))
    .sort((a, b) => b.amount - a.amount);

  const normalizedBalances = normalizeBalanceArray(balances);
  const balanceLookup = new Map(
    normalizedBalances.map((b) => [b.member_id, b.balance])
  );

  const byMember: MemberExpenseStat[] = members.map((m) => {
    const paid = paidMap.get(m.member_id) || { amount: 0, count: 0 };
    const shareTotal = shareMap.get(m.member_id) || 0;
    const netBalance =
      balanceLookup.get(m.member_id) ?? paid.amount - shareTotal;
    return {
      member_id: m.member_id,
      memberId: m.member_id,
      display_name: m.display_name,
      displayName: m.display_name,
      paidTotal: paid.amount,
      totalPaid: paid.amount,
      shareTotal,
      totalShare: shareTotal,
      netBalance,
      paidCount: paid.count,
    };
  });

  const avgPerPerson = members.length > 0 ? totalSpent / members.length : 0;

  return {
    totalSpent,
    totalAmount: totalSpent,
    expenseCount: expenses.length,
    avgPerExpense: expenses.length > 0 ? totalSpent / expenses.length : 0,
    avgPerPerson,
    averagePerPerson: avgPerPerson,
    topCategory: byCategory[0] || null,
    byCategory,
    byMember,
    memberStats: byMember,
  };
};

export interface OptimizedSettlement {
  /**
   * Member who OWES money (debtor) and should PAY in a settlement.
   * In the UI/API this maps to `payer_member_id`.
   */
  from: string;
  fromName: string;
  /**
   * Member who IS OWED money (creditor) and should RECEIVE in a settlement.
   * In the UI/API this maps to `payee_member_id`.
   */
  to: string;
  toName: string;
  amount: number;
}

export const optimizeSettlements = (
  balancesInput?: BalanceInput
): OptimizedSettlement[] => {
  const balances = normalizeBalanceArray(balancesInput);
  const debtors = balances
    .filter((b) => b.balance < -0.009)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.balance - b.balance);

  const creditors = balances
    .filter((b) => b.balance > 0.009)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.balance - a.balance);

  const settlements: OptimizedSettlement[] = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const debtAmount = Math.abs(debtor.balance);
    const creditAmount = creditor.balance;

    const settleAmount = Math.min(debtAmount, creditAmount);

    if (settleAmount >= 0.01) {
      settlements.push({
        from: debtor.member_id,
        fromName: debtor.display_name || debtor.member_id,
        to: creditor.member_id,
        toName: creditor.display_name || creditor.member_id,
        amount: parseFloat(settleAmount.toFixed(2)),
      });
    }

    debtor.balance += settleAmount;
    creditor.balance -= settleAmount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }

  return settlements;
};

export const calculateOptimalSettlements = optimizeSettlements;

export const getCategoryColor = (category?: string | null): string => {
  const colors: Record<string, string> = {
    Food: '#F97316',
    'Food & Drinks': '#F97316',
    Transport: '#06B6D4',
    Accommodation: '#6366F1',
    Lodging: '#6366F1',
    Activities: '#EC4899',
    Shopping: '#8B5CF6',
    Groceries: '#10B981',
    Other: '#64748B',
  };
  return (category && colors[category]) || colors.Other;
};

export const getCategoryEmoji = (category?: string | null): string => {
  const emojis: Record<string, string> = {
    Food: '🍽️',
    'Food & Drinks': '🍽️',
    Transport: '🚗',
    Accommodation: '🏨',
    Lodging: '🏨',
    Activities: '🎯',
    Shopping: '🛍️',
    Groceries: '🛒',
    Other: '💰',
  };
  return (category && emojis[category]) || emojis.Other;
};

export const getCategoryMeta = (category?: string | null) => ({
  id: category || 'Other',
  emoji: getCategoryEmoji(category),
  color: getCategoryColor(category),
});
