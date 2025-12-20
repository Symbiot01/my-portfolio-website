// Utility functions for expense calculations and formatting

import { BalanceEntry } from '@/types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Just now';
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMs / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

export const getDateGroupLabel = (dateString: string): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Today';
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
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

  const perPersonAmount = totalAmount / splitMembers.length;
  const result: Record<string, number> = {};
  splitMembers.forEach((memberId) => {
    result[memberId] = perPersonAmount;
  });
  return result;
};

interface OptimizedSettlement {
  /**
   * Member who OWES money (debtor) and should PAY in a settlement.
   * In the UI/API this maps to `payer_member_id`.
   */
  from: string;
  /**
   * Member who IS OWED money (creditor) and should RECEIVE in a settlement.
   * In the UI/API this maps to `payee_member_id`.
   */
  to: string;
  amount: number;
}

export const optimizeSettlements = (balances: BalanceEntry[]): OptimizedSettlement[] => {
  // Create copies sorted by balance
  const debtors = balances
    .filter((b) => b.balance < 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.balance - b.balance);

  const creditors = balances
    .filter((b) => b.balance > 0)
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

    settlements.push({
      from: debtor.member_id,
      to: creditor.member_id,
      amount: parseFloat(settleAmount.toFixed(2)),
    });

    debtor.balance += settleAmount;
    creditor.balance -= settleAmount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }

  return settlements;
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Food: '#FF6B6B',
    Transport: '#4ECDC4',
    Accommodation: '#45B7D1',
    Activities: '#FFA07A',
    Other: '#95A5A6',
  };
  return colors[category] || colors.Other;
};

export const getCategoryEmoji = (category: string): string => {
  const emojis: Record<string, string> = {
    Food: '🍽️',
    Transport: '🚗',
    Accommodation: '🏨',
    Activities: '🎯',
    Other: '💰',
  };
  return emojis[category] || emojis.Other;
};


