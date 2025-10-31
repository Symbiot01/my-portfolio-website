// Mock data for TripSync features
import { TripRead, TripMemberInfo, ExpenseUpdate, SettlementUpdate, BalanceEntry } from '@/types';

export const mockTripMembers: TripMemberInfo[] = [
  {
    member_id: '1',
    display_name: 'John Doe',
    linked: true,
  },
  {
    member_id: '2',
    display_name: 'Jane Smith',
    linked: false,
  },
  {
    member_id: '3',
    display_name: 'Alex Johnson',
    linked: true,
  },
  {
    member_id: '4',
    display_name: 'Sarah Williams',
    linked: false,
  },
];

export const mockTrip: TripRead = {
  id: 'mock-trip-1',
  name: 'Iceland Adventure 2025',
  description: 'A week-long trip exploring the natural wonders of Iceland',
  members: mockTripMembers,
  secret_access_url: 'https://example.com/trip/abc123',
};

// Mock expenses with extended fields for UI
export interface MockExpense {
  id: string;
  description?: string | null;
  amount?: number | null;
  paid_by_member_id?: string | null;
  split_with_member_ids?: string[] | null;
  date: string;
  category: string;
}

export const mockExpenses: MockExpense[] = [
  {
    id: 'exp-1',
    description: 'Hotel booking - Night 1',
    amount: 240,
    paid_by_member_id: '1',
    split_with_member_ids: ['1', '2', '3', '4'],
    date: new Date().toISOString(),
    category: 'Accommodation',
  },
  {
    id: 'exp-2',
    description: 'Dinner at seafood restaurant',
    amount: 85,
    paid_by_member_id: '2',
    split_with_member_ids: ['1', '2', '3'],
    date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    category: 'Food',
  },
  {
    id: 'exp-3',
    description: 'Car rental',
    amount: 180,
    paid_by_member_id: '1',
    split_with_member_ids: ['1', '2', '3', '4'],
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    category: 'Transport',
  },
  {
    id: 'exp-4',
    description: 'Blue Lagoon tickets',
    amount: 120,
    paid_by_member_id: '3',
    split_with_member_ids: ['1', '2', '3', '4'],
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    category: 'Activities',
  },
  {
    id: 'exp-5',
    description: 'Groceries',
    amount: 45,
    paid_by_member_id: '4',
    split_with_member_ids: ['1', '2', '3', '4'],
    date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    category: 'Food',
  },
  {
    id: 'exp-6',
    description: 'Gas for road trip',
    amount: 60,
    paid_by_member_id: '2',
    split_with_member_ids: ['1', '2', '3', '4'],
    date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    category: 'Transport',
  },
];

export const mockSettlements: (SettlementUpdate & { id: string; date: string; settled: boolean })[] = [
  {
    id: 'settle-1',
    payer_member_id: '2',
    payee_member_id: '1',
    amount: 50,
    date: new Date(Date.now() - 86400000).toISOString(),
    settled: true,
  },
];

export const mockBalances: BalanceEntry[] = [
  { member_id: '1', balance: 95.0 },
  { member_id: '2', balance: -28.33 },
  { member_id: '3', balance: -30.0 },
  { member_id: '4', balance: -36.67 },
];

