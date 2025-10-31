'use client';

import { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { api } from '@/lib/api';
import { TripMemberInfo, BalanceEntry, ExpenseCreate } from '@/types';
import { MockExpense } from '@/lib/mockData';
import {
  formatCurrency,
  formatRelativeDate,
  getDateGroupLabel,
  calculateSplitAmount,
  optimizeSettlements,
  getCategoryColor,
  getCategoryEmoji,
} from '@/lib/expenseUtils';

// Styled Components
const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: calc(100vh - 300px);
  min-height: 600px;
`;

const PanelSection = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  padding: 1rem;
  overflow: auto;
  height: 100%;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 0;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.mutedText};
  }
`;

const ResizeHandleVertical = styled.div`
  width: 6px;
  background: transparent;
  cursor: col-resize;
  position: relative;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.primary}40;
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 30px;
    background: ${({ theme }) => theme.border};
    border-radius: 0;
  }
`;

const ResizeHandleHorizontal = styled.div`
  height: 6px;
  background: transparent;
  cursor: row-resize;
  position: relative;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.primary}40;
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 2px;
    background: ${({ theme }) => theme.border};
    border-radius: 0;
  }
`;

const AddExpenseCard = styled(motion.div)<{ expanded: boolean }>`
  background: ${({ theme }) => theme.background};
  border: 2px dashed ${({ theme }) => theme.border};
  border-radius: 4px;
  padding: ${({ expanded }) => (expanded ? '1.25rem' : '1rem')};
  margin-bottom: 1rem;
  cursor: ${({ expanded }) => (expanded ? 'default' : 'pointer')};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme, expanded }) => !expanded && theme.primary};
  }
`;

const ExpandHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
  padding-top: 0;
  line-height: 1.2;
`;

const ExpandIcon = styled.span<{ expanded: boolean }>`
  font-size: 1.5rem;
  transition: transform 0.3s ease;
  transform: rotate(${({ expanded }) => (expanded ? '45deg' : '0deg')});
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  padding: 0.6rem;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Select = styled.select`
  padding: 0.6rem;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const SplitOptionsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;

  input[type='radio'] {
    cursor: pointer;
  }
`;

const MemberCheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 3px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  input[type='checkbox'] {
    cursor: pointer;
  }
`;

const CustomAmountInput = styled(Input)`
  margin-left: 1rem;
  max-width: 120px;
`;

const Button = styled.button`
  padding: 0.65rem 1.25rem;
  border-radius: 3px;
  border: none;
  background: ${({ theme }) => theme.primary};
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Table Styled Components
const TableWrapper = styled.div`
  margin-bottom: 0;
  border-radius: 3px;
  overflow: auto;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  flex: 1;
  max-height: 100%;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 0;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.mutedText};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: ${({ theme }) => theme.cardBg};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.border};
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.toggleBg}40;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th<{ sortable?: boolean }>`
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.mutedText};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: ${({ sortable }) => (sortable ? 'pointer' : 'default')};
  user-select: none;
  position: relative;

  &:hover {
    color: ${({ theme, sortable }) => sortable && theme.text};
  }
`;

const TableCell = styled.td`
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
`;

const MemberNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
`;

const MemberAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 3px;
  background: ${({ theme }) => theme.primary}30;
  color: ${({ theme }) => theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
`;

const BalanceAmount = styled.div<{ balance: number }>`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ balance }) => (balance > 0 ? '#27AE60' : balance < 0 ? '#E74C3C' : '#95A5A6')};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BalanceBadge = styled.span<{ type: 'owed' | 'owes' | 'settled' }>`
  padding: 0.2rem 0.6rem;
  border-radius: 2px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${({ type }) =>
    type === 'owed' ? '#27AE6020' : type === 'owes' ? '#E74C3C20' : '#95A5A620'};
  color: ${({ type }) =>
    type === 'owed' ? '#27AE60' : type === 'owes' ? '#E74C3C' : '#95A5A6'};
`;

const SortIcon = styled.span`
  margin-left: 0.5rem;
  font-size: 0.7rem;
  opacity: 0.6;
`;

const ExpensesWrapper = styled.div`
  flex: 1;
  overflow: auto;
  max-height: 100%;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 0;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.mutedText};
  }
`;

const ExpensesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const DateGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const DateHeader = styled.h4`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.mutedText};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`;

const ExpenseCard = styled(motion.div)`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 3px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  &:hover .expense-actions {
    opacity: 1;
  }
`;

const ExpenseInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ExpenseHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CategoryBadge = styled.span<{ color: string }>`
  padding: 0.2rem 0.6rem;
  border-radius: 2px;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  font-size: 0.7rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
`;

const ExpenseDescription = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const ExpenseMeta = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.mutedText};
`;

const ExpenseAmount = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
`;

const ExpenseActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const IconButton = styled.button`
  padding: 0.4rem;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.mutedText};
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.toggleBg};
    color: ${({ theme }) => theme.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.mutedText};
`;

const SettlementsWrapper = styled.div`
  flex: 1;
  overflow: auto;
  max-height: 100%;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 0;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.mutedText};
  }
`;

const SettlementCard = styled(motion.div)`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 3px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SettlementInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SettlementText = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.text};

  strong {
    font-weight: 700;
  }
`;

const SettlementAmount = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
`;

const SecondaryButton = styled.button`
  padding: 0.45rem 0.85rem;
  border-radius: 2px;
  border: 1px solid ${({ theme }) => theme.border};
  background: transparent;
  color: ${({ theme }) => theme.text};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.toggleBg};
  }
`;

// Component Interface
interface ExpensesSectionProps {
  tripId: string;
  members: TripMemberInfo[];
  expenses: MockExpense[];
  balances: BalanceEntry[];
  onUpdate: () => void;
}

export default function ExpensesSection({
  tripId,
  members,
  expenses,
  balances,
  onUpdate,
}: ExpensesSectionProps) {
  // State
  const [formExpanded, setFormExpanded] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Form state
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState(members[0]?.member_id || '');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    members.map((m) => m.member_id)
  );
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function
  const getMemberName = (memberId: string) => {
    return members.find((m) => m.member_id === memberId)?.display_name || 'Unknown';
  };

  // Table columns
  const columns = useMemo<ColumnDef<BalanceEntry>[]>(
    () => [
      {
        accessorKey: 'member_id',
        header: 'Member',
        cell: (info) => {
          const memberId = info.getValue() as string;
          const memberName = getMemberName(memberId);
          const initials = memberName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          return (
            <MemberNameCell>
              <MemberAvatar>{initials}</MemberAvatar>
              {memberName}
            </MemberNameCell>
          );
        },
      },
      {
        accessorKey: 'balance',
        header: 'Balance',
        cell: (info) => {
          const balance = info.getValue() as number;
          return (
            <BalanceAmount balance={balance}>
              {balance > 0 && '+'}
              {formatCurrency(balance)}
            </BalanceAmount>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: (info) => {
          const balance = info.row.original.balance;
          if (balance > 0) {
            return <BalanceBadge type="owed">Owed</BalanceBadge>;
          } else if (balance < 0) {
            return <BalanceBadge type="owes">Owes</BalanceBadge>;
          } else {
            return <BalanceBadge type="settled">Settled</BalanceBadge>;
          }
        },
      },
    ],
    [members]
  );

  // Create table instance
  const table = useReactTable({
    data: balances,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Handlers
  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleCustomAmountChange = (memberId: string, value: string) => {
    setCustomAmounts((prev) => ({ ...prev, [memberId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || selectedMembers.length === 0) return;

    setIsSubmitting(true);
    try {
      if (editingExpenseId) {
        // Update existing expense
        const expenseData = {
          description: description.trim(),
          amount: parseFloat(amount),
          paid_by_member_id: paidBy,
          split_with_member_ids: selectedMembers,
        };
        await api.updateExpense(tripId, editingExpenseId, expenseData);
        alert('Expense updated successfully!');
      } else {
        // Create new expense
        const expenseData: ExpenseCreate = {
          description: description.trim(),
          amount: parseFloat(amount),
          paid_by_member_id: paidBy,
          split_with_member_ids: selectedMembers,
        };
        await api.addExpense(tripId, expenseData);
        alert('Expense added successfully!');
      }
      
      // Reset form
      setEditingExpenseId(null);
      setDescription('');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedMembers(members.map((m) => m.member_id));
      setCustomAmounts({});
      setFormExpanded(false);
      
      onUpdate();
    } catch (error) {
      console.error('Failed to save expense:', error);
      alert('Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (expense: MockExpense) => {
    // Set editing mode
    setEditingExpenseId(expense.id);
    
    // Populate form with expense data
    setDescription(expense.description || '');
    setAmount(expense.amount?.toString() || '');
    setPaidBy(expense.paid_by_member_id || members[0]?.member_id || '');
    setSelectedMembers(expense.split_with_member_ids || []);
    setFormExpanded(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setDescription('');
    setAmount('');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedMembers(members.map((m) => m.member_id));
    setCustomAmounts({});
    setFormExpanded(false);
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await api.deleteExpense(tripId, expenseId);
      alert('Expense deleted successfully!');
      onUpdate();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  // Group expenses by date
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const group = getDateGroupLabel(expense.date);
    if (!groups[group]) groups[group] = [];
    groups[group].push(expense);
    return groups;
  }, {} as Record<string, MockExpense[]>);

  const dateOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];
  const sortedGroups = dateOrder.filter((group) => groupedExpenses[group]);

  // Calculate optimized settlements
  const optimizedSettlements = optimizeSettlements(balances);

  return (
    <>
      {/* Add Expense Form */}
      <AddExpenseCard
            expanded={formExpanded}
            onClick={() => !formExpanded && setFormExpanded(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ExpandHeader>
              <SectionTitle>
                {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
              </SectionTitle>
              <ExpandIcon expanded={formExpanded}>+</ExpandIcon>
            </ExpandHeader>

            <AnimatePresence>
              {formExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <Form onSubmit={handleSubmit}>
                    <FormRow>
                      <FormGroup>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          type="text"
                          placeholder="What was this for?"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                        />
                      </FormGroup>
                    </FormRow>

                    <FormRow>
                      <FormGroup>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option value="Food">🍽️ Food</option>
                          <option value="Transport">🚗 Transport</option>
                          <option value="Accommodation">🏨 Accommodation</option>
                          <option value="Activities">🎯 Activities</option>
                          <option value="Other">💰 Other</option>
                        </Select>
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </FormGroup>
                    </FormRow>

                    <FormGroup>
                      <Label htmlFor="paidBy">Paid By</Label>
                      <Select id="paidBy" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
                        {members.map((member) => (
                          <option key={member.member_id} value={member.member_id}>
                            {member.display_name}
                          </option>
                        ))}
                      </Select>
                    </FormGroup>

                    <SplitOptionsGroup>
                      <Label>Split Between</Label>
                      <RadioGroup>
                        <RadioLabel>
                          <input
                            type="radio"
                            name="splitType"
                            checked={splitType === 'equal'}
                            onChange={() => setSplitType('equal')}
                          />
                          Split Equally
                        </RadioLabel>
                        <RadioLabel>
                          <input
                            type="radio"
                            name="splitType"
                            checked={splitType === 'custom'}
                            onChange={() => setSplitType('custom')}
                          />
                          Custom Split
                        </RadioLabel>
                      </RadioGroup>

                      <MemberCheckboxGroup>
                        {members.map((member) => (
                          <div key={member.member_id}>
                            <CheckboxLabel>
                              <input
                                type="checkbox"
                                checked={selectedMembers.includes(member.member_id)}
                                onChange={() => handleMemberToggle(member.member_id)}
                              />
                              {member.display_name}
                            </CheckboxLabel>
                            {splitType === 'custom' && selectedMembers.includes(member.member_id) && (
                              <CustomAmountInput
                                type="number"
                                step="0.01"
                                placeholder="Amount"
                                value={customAmounts[member.member_id] || ''}
                                onChange={(e) =>
                                  handleCustomAmountChange(member.member_id, e.target.value)
                                }
                              />
                            )}
                          </div>
                        ))}
                      </MemberCheckboxGroup>
                    </SplitOptionsGroup>

                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting 
                          ? (editingExpenseId ? 'Updating...' : 'Adding...') 
                          : (editingExpenseId ? 'Update Expense' : 'Add Expense')
                        }
                      </Button>
                      <SecondaryButton type="button" onClick={handleCancelEdit}>
                        Cancel
                      </SecondaryButton>
                    </div>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>
      </AddExpenseCard>

      {/* Resizable Grid Layout */}
      <GridContainer>
        <PanelGroup direction="vertical">
          {/* Top Section: Balances (left) and Settlements (right) */}
          <Panel defaultSize={35} minSize={25} maxSize={50}>
            <PanelGroup direction="horizontal">
              {/* Balances Panel - Left */}
              <Panel defaultSize={50} minSize={30}>
                <PanelSection>
                  <SectionTitle style={{ marginBottom: '0.5rem' }}>Balances</SectionTitle>
                  <TableWrapper style={{ border: 'none', marginBottom: 0 }}>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHeader
                        key={header.id}
                        sortable={header.column.getCanSort()}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <SortIcon>
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? '⇅'}
                          </SortIcon>
                        )}
                      </TableHeader>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </tbody>
            </Table>
                  </TableWrapper>
                </PanelSection>
              </Panel>

              {/* Vertical Resize Handle */}
              <PanelResizeHandle>
                <ResizeHandleVertical />
              </PanelResizeHandle>

              {/* Settlements Panel - Right */}
              <Panel defaultSize={50} minSize={30}>
                <PanelSection>
                  <SectionTitle style={{ marginBottom: '0.5rem' }}>Suggested Settlements</SectionTitle>
                  {optimizedSettlements.length === 0 ? (
                    <EmptyState>
                      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
                      <p>All settled up!</p>
                    </EmptyState>
                  ) : (
                    <SettlementsWrapper>
                      {optimizedSettlements.map((settlement, index) => (
                        <SettlementCard
                          key={`${settlement.from}-${settlement.to}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <SettlementInfo>
                            <SettlementText>
                              <strong>{getMemberName(settlement.from)}</strong> pays{' '}
                              <strong>{getMemberName(settlement.to)}</strong>
                            </SettlementText>
                            <SettlementAmount>{formatCurrency(settlement.amount)}</SettlementAmount>
                          </SettlementInfo>
                          <SecondaryButton>Mark as Settled</SecondaryButton>
                        </SettlementCard>
                      ))}
                    </SettlementsWrapper>
                  )}
                </PanelSection>
              </Panel>
            </PanelGroup>
          </Panel>

          {/* Horizontal Resize Handle */}
          <PanelResizeHandle>
            <ResizeHandleHorizontal />
          </PanelResizeHandle>

          {/* Bottom Section: Expenses List */}
          <Panel defaultSize={65} minSize={30}>
            <PanelSection>
              <SectionTitle style={{ marginBottom: '0.5rem' }}>
                All Expenses ({expenses.length})
              </SectionTitle>

          {expenses.length === 0 ? (
            <EmptyState>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💸</div>
              <p>No expenses yet. Add your first expense above!</p>
            </EmptyState>
          ) : (
            <ExpensesWrapper>
              <ExpensesList>
                {sortedGroups.map((groupLabel) => (
                  <DateGroup key={groupLabel}>
                    <DateHeader>{groupLabel}</DateHeader>
                    {groupedExpenses[groupLabel].map((expense, index) => (
                      <ExpenseCard
                        key={expense.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ExpenseInfo>
                          <ExpenseHeader>
                            <CategoryBadge color={getCategoryColor(expense.category)}>
                              {getCategoryEmoji(expense.category)} {expense.category}
                            </CategoryBadge>
                            <ExpenseDescription>{expense.description}</ExpenseDescription>
                          </ExpenseHeader>
                          <ExpenseMeta>
                            Paid by <strong>{getMemberName(expense.paid_by_member_id || '')}</strong>{' '}
                            • Split between {expense.split_with_member_ids?.length || 0} people •{' '}
                            {formatRelativeDate(expense.date)}
                          </ExpenseMeta>
                        </ExpenseInfo>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <ExpenseAmount>{formatCurrency(expense.amount || 0)}</ExpenseAmount>
                          <ExpenseActions className="expense-actions">
                            <IconButton title="Edit" onClick={() => handleEdit(expense)}>
                              ✏️
                            </IconButton>
                            <IconButton title="Delete" onClick={() => handleDelete(expense.id)}>
                              🗑️
                            </IconButton>
                          </ExpenseActions>
                        </div>
                      </ExpenseCard>
                    ))}
                  </DateGroup>
                ))}
              </ExpensesList>
            </ExpensesWrapper>
          )}
            </PanelSection>
          </Panel>
        </PanelGroup>
      </GridContainer>
    </>
  );
}

