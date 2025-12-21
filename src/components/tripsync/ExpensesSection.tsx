'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { TripMemberInfo, BalanceEntry, ExpenseCreate, SettlementRead } from '@/types';
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

  @media (max-width: 768px) {
    height: auto;
    min-height: 0;
  }
`;

const PanelSection = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 1rem;
  overflow: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);

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

  @media (max-width: 768px) {
    padding: 0.85rem;
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
  background: ${({ theme }) => theme.cardBg};
  border: 2px dashed ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: ${({ expanded }) => (expanded ? '1.25rem' : '1rem')};
  margin-bottom: 1rem;
  cursor: ${({ expanded }) => (expanded ? 'default' : 'pointer')};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme, expanded }) => !expanded && theme.primary};
  }

  @media (max-width: 768px) {
    padding: ${({ expanded }) => (expanded ? '1rem' : '0.9rem')};
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
  border-radius: 12px;
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
  border-radius: 12px;
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
  border-radius: 12px;
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
  border-radius: 12px;
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

  @media (max-width: 768px) {
    padding: 0.55rem 0.6rem;
    font-size: 0.7rem;
    letter-spacing: 0.35px;
  }
`;

const TableCell = styled.td`
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};

  @media (max-width: 768px) {
    padding: 0.65rem 0.6rem;
    font-size: 0.82rem;
  }
`;

const MemberNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
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

  @media (max-width: 768px) {
    width: 26px;
    height: 26px;
    font-size: 0.75rem;
  }
`;

const BalanceAmount = styled.div<{ balance: number }>`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ balance }) => (balance > 0 ? '#27AE60' : balance < 0 ? '#E74C3C' : '#95A5A6')};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.05rem;
    gap: 0.35rem;
  }
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
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
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

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding: 0.9rem;
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
  border-radius: 999px;
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

  @media (max-width: 640px) {
    font-size: 1.02rem;
  }
`;

const ExpenseMeta = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.mutedText};

  @media (max-width: 640px) {
    font-size: 0.82rem;
    line-height: 1.35;
  }
`;

const ExpenseAmount = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};

  @media (max-width: 640px) {
    font-size: 1.35rem;
    text-align: left;
  }
`;

const ExpenseRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const ExpenseActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;

  @media (max-width: 768px) {
    opacity: 1; /* no hover on touch devices */
  }
`;

const IconButton = styled.button`
  padding: 0.4rem;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.mutedText};
  cursor: pointer;
  border-radius: 10px;
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

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

const SettlementSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
  overflow: auto;
`;

const SettlementTabs = styled.div`
  display: flex;
  gap: 0.25rem;
  border-bottom: 2px solid ${({ theme }) => theme.border};
  margin-bottom: 0.75rem;

  @media (max-width: 768px) {
    gap: 0.4rem;
    border-bottom-width: 1px;
  }
`;

const SettlementTab = styled.button<{ active: boolean }>`
  padding: 0.6rem 1rem;
  border: none;
  background: ${({ active, theme }) => (active ? theme.cardBg : 'transparent')};
  color: ${({ active, theme }) => (active ? theme.text : theme.mutedText)};
  font-size: 0.85rem;
  font-weight: ${({ active }) => (active ? 700 : 500)};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border-radius: 12px 12px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.primary};
    transform: scaleX(${({ active }) => (active ? 1 : 0)});
    transition: transform 0.2s ease;
  }

  &:hover {
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.cardBg}80;
  }
`;

const SettlementsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 3px;
  overflow: hidden;
`;

const SettlementRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.border};
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.toggleBg}40;
  }
`;

const SettlementCell = styled.td`
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text};
  vertical-align: middle;
  
  &:first-child {
    font-weight: 600;
  }
`;

const SettlementHeader = styled.th`
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.mutedText};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ theme }) => theme.cardBg};
  border-bottom: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 768px) {
    padding: 0.45rem 0.55rem;
    font-size: 0.68rem;
    letter-spacing: 0.35px;
  }
`;

const SettlementDate = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.mutedText};

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const SettleButton = styled.button`
  padding: 0.35rem 0.65rem;
  border-radius: 2px;
  border: none;
  background: ${({ theme }) => theme.primary};
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
  white-space: nowrap;
  margin: 0;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditableAmountInput = styled.input`
  padding: 0.35rem 0.5rem;
  border-radius: 2px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  font-size: 0.85rem;
  font-weight: 600;
  width: 90px;
  text-align: right;
  margin: 0;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.background};
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    width: 80px;
    font-size: 0.8rem;
  }
`;

const EditableSelect = styled.select`
  padding: 0.35rem 0.5rem;
  border-radius: 2px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  min-width: 110px;
  max-width: 130px;
  margin: 0;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.4rem center;
  padding-right: 1.8rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    background-color: ${({ theme }) => theme.background};
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  }

  &:hover {
    border-color: ${({ theme }) => theme.primary}80;
  }

  @media (max-width: 768px) {
    min-width: 92px;
    max-width: 120px;
    font-size: 0.75rem;
  }
`;

// Mobile-first settlement cards (used to avoid table overflow on phones)
const SettlementCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SettlementCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
`;

const SettlementCardTitle = styled.div`
  font-weight: 800;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-width: 0;
`;

const SettlementSummaryAmount = styled.div`
  font-weight: 900;
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;
  white-space: nowrap;
`;

const SettlementSummaryMeta = styled.div`
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.85rem;
  line-height: 1.35;
`;

const SettlementCardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const SettlementCardField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SettlementCardLabel = styled.div`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.mutedText};
  font-weight: 700;
`;

const SettlementCardActions = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
`;

const SettlementSecondaryButton = styled.button`
  flex: 1;
  min-width: 0;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: transparent;
  color: ${({ theme }) => theme.text};
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.toggleBg};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.primary};
    outline-offset: 2px;
  }
`;

const SettlementPrimaryButton = styled.button`
  flex: 1;
  min-width: 0;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.primary};
  color: #fff;
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  cursor: pointer;

  &:hover {
    opacity: 0.92;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.primary};
    outline-offset: 2px;
  }
`;

const MobileTabs = styled.div`
  display: none;
  gap: 0.35rem;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.cardBg};
  position: sticky;
  top: 0;
  z-index: 5;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileTab = styled.button<{ active: boolean }>`
  flex: 1;
  border: 1px solid ${({ theme, active }) => (active ? theme.primary : 'transparent')};
  background: ${({ theme, active }) => (active ? theme.primary : 'transparent')};
  color: ${({ active, theme }) => (active ? '#fff' : theme.text)};
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.6rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.primary};
    outline-offset: 2px;
  }
`;

// Component Interface
interface ExpensesSectionProps {
  tripId: string;
  members: TripMemberInfo[];
  expenses: MockExpense[];
  balances: BalanceEntry[];
  onUpdate: () => void;
  tripAccessToken?: string;
  /**
   * Quicklink write gate.
   * When false (and tripAccessToken is present), disable mutations.
   */
  canEdit?: boolean;
}

export default function ExpensesSection({
  tripId,
  members,
  expenses,
  balances,
  onUpdate,
  tripAccessToken,
  canEdit = true,
}: ExpensesSectionProps) {
  // State
  const [formExpanded, setFormExpanded] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [settlementTab, setSettlementTab] = useState<'suggested' | 'previous'>('suggested');
  const [mobileActiveTab, setMobileActiveTab] = useState<'balances' | 'settlements' | 'expenses'>(
    'expenses'
  );
  const [expandedSettlementKey, setExpandedSettlementKey] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [settlementMethods, setSettlementMethods] = useState<Record<string, string>>({});
  const [settlementAmounts, setSettlementAmounts] = useState<Record<string, string>>({});
  const [settlementPayers, setSettlementPayers] = useState<Record<string, string>>({});
  const [settlementPayees, setSettlementPayees] = useState<Record<string, string>>({});
  const [previousSettlements, setPreviousSettlements] = useState<SettlementRead[]>([]);
  const [loadingSettlements, setLoadingSettlements] = useState(false);

  // Track viewport for mobile-only layout.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Fetch previous settlements
  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        setLoadingSettlements(true);
        const settlements = await api.listSettlements(
          tripId,
          tripAccessToken ? { tripAccessToken } : undefined
        );
        setPreviousSettlements(settlements);
      } catch (error) {
        console.error('Failed to fetch settlements:', error);
      } finally {
        setLoadingSettlements(false);
      }
    };
    fetchSettlements();
  }, [tripId, onUpdate]);

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
    if (tripAccessToken && !canEdit) {
      alert('Editing is disabled for this share link. Enable editing to add/edit expenses.');
      return;
    }

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
        await api.updateExpense(
          tripId,
          editingExpenseId,
          expenseData,
          tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined
        );
        alert('Expense updated successfully!');
      } else {
        // Create new expense
        const expenseData: ExpenseCreate = {
          description: description.trim(),
          amount: parseFloat(amount),
          paid_by_member_id: paidBy,
          split_with_member_ids: selectedMembers,
        };
        await api.addExpense(
          tripId,
          expenseData,
          tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined
        );
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
    if (tripAccessToken && !canEdit) {
      alert('Editing is disabled for this share link.');
      return;
    }
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
    if (tripAccessToken && !canEdit) {
      alert('Editing is disabled for this share link.');
      return;
    }

    try {
      await api.deleteExpense(
        tripId,
        expenseId,
        tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined
      );
      alert('Expense deleted successfully!');
      onUpdate();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleMethodChange = (settlementKey: string, method: string) => {
    setSettlementMethods((prev) => ({ ...prev, [settlementKey]: method }));
  };

  const handleAmountChange = (settlementKey: string, value: string) => {
    setSettlementAmounts((prev) => ({ ...prev, [settlementKey]: value }));
  };

  const handlePayerChange = (settlementKey: string, memberId: string) => {
    setSettlementPayers((prev) => ({ ...prev, [settlementKey]: memberId }));
  };

  const handlePayeeChange = (settlementKey: string, memberId: string) => {
    setSettlementPayees((prev) => ({ ...prev, [settlementKey]: memberId }));
  };

  const handleMakeSettlement = async (settlementKey: string) => {
    const method = (settlementMethods[settlementKey] || 'UPI').toLowerCase() as 'cash' | 'upi' | 'card';
    const amountStr = settlementAmounts[settlementKey] || '0';
    const payer = settlementPayers[settlementKey];
    const payee = settlementPayees[settlementKey];
    const amount = parseFloat(amountStr);
    
    if (!payer || !payee || isNaN(amount) || amount <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }
    
    try {
      // Settlement direction (NOT swapped):
      // - payer = debtor (owes money) -> pays
      // - payee = creditor (is owed money) -> receives
      if (tripAccessToken && !canEdit) {
        alert('Editing is disabled for this share link. Enable editing to record settlements.');
        return;
      }
      await api.addSettlement(
        tripId,
        {
          payer_member_id: payer,
          payee_member_id: payee,
          amount: amount,
          mode: method,
        },
        tripAccessToken ? { tripAccessToken, tripEdit: canEdit } : undefined
      );
      
      // Refresh balances and settlements
      await onUpdate();
      
      // Fetch updated settlements
      const settlements = await api.listSettlements(
        tripId,
        tripAccessToken ? { tripAccessToken } : undefined
      );
      setPreviousSettlements(settlements);
      
      alert(`Settlement recorded!\n${getMemberName(payer)} → ${getMemberName(payee)}\nAmount: ${formatCurrency(amount)}\nMethod: ${method.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to record settlement:', error);
      alert('Failed to record settlement. Please try again.');
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

  // Initialize editable settlement values with defaults
  useEffect(() => {
    const newAmounts: Record<string, string> = {};
    const newPayers: Record<string, string> = {};
    const newPayees: Record<string, string> = {};
    
    optimizedSettlements.forEach((settlement) => {
      const key = `${settlement.from}-${settlement.to}`;
      // Only set if not already exists
      if (!settlementAmounts[key]) {
        newAmounts[key] = settlement.amount.toFixed(2);
      }
      if (!settlementPayers[key]) {
        newPayers[key] = settlement.from;
      }
      if (!settlementPayees[key]) {
        newPayees[key] = settlement.to;
      }
      // Initialize method if not set
      if (!settlementMethods[key]) {
        setSettlementMethods((prev) => ({ ...prev, [key]: 'UPI' }));
      }
    });
    
    if (Object.keys(newAmounts).length > 0) {
      setSettlementAmounts((prev) => ({ ...prev, ...newAmounts }));
    }
    if (Object.keys(newPayers).length > 0) {
      setSettlementPayers((prev) => ({ ...prev, ...newPayers }));
    }
    if (Object.keys(newPayees).length > 0) {
      setSettlementPayees((prev) => ({ ...prev, ...newPayees }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optimizedSettlements.length]); // Only reinitialize when settlement count changes

  const renderBalancesPanel = () => (
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
  );

  const renderSettlementsPanel = () => (
    <PanelSection>
      <SectionTitle style={{ marginBottom: '0.5rem' }}>Settlements</SectionTitle>

      {/* Tabs */}
      <SettlementTabs>
        <SettlementTab
          active={settlementTab === 'suggested'}
          onClick={() => setSettlementTab('suggested')}
        >
          Suggested
        </SettlementTab>
        <SettlementTab
          active={settlementTab === 'previous'}
          onClick={() => setSettlementTab('previous')}
        >
          Previous
        </SettlementTab>
      </SettlementTabs>

      {/* Tab Content */}
      {settlementTab === 'suggested' ? (
        <SettlementsWrapper>
          {optimizedSettlements.length === 0 ? (
            <EmptyState>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
              <p>All settled up!</p>
            </EmptyState>
          ) : (
            <>
              {isMobile ? (
                <SettlementCards>
                  {optimizedSettlements.map((settlement) => {
                    const settlementKey = `${settlement.from}-${settlement.to}`;
                    const payerId = settlementPayers[settlementKey] || settlement.from;
                    const payeeId = settlementPayees[settlementKey] || settlement.to;
                    const amount = settlementAmounts[settlementKey] || settlement.amount.toFixed(2);
                    const method = settlementMethods[settlementKey] || 'UPI';
                    const isExpanded = expandedSettlementKey === settlementKey;

                    return (
                      <SettlementCard key={settlementKey}>
                        <SettlementCardTitle>
                          <span style={{ fontWeight: 900 }}>
                            {getMemberName(payerId)} → {getMemberName(payeeId)}
                          </span>
                          <SettlementSummaryAmount>{formatCurrency(Number(amount) || 0)}</SettlementSummaryAmount>
                        </SettlementCardTitle>

                        {!isExpanded ? (
                          <SettlementSummaryMeta>
                            Method: <strong style={{ color: 'inherit' }}>{method}</strong>
                          </SettlementSummaryMeta>
                        ) : (
                          <SettlementCardGrid>
                            <SettlementCardField>
                              <SettlementCardLabel>Payer</SettlementCardLabel>
                              <EditableSelect
                                value={payerId}
                                onChange={(e) => handlePayerChange(settlementKey, e.target.value)}
                              >
                                {members.map((member) => (
                                  <option key={member.member_id} value={member.member_id}>
                                    {member.display_name}
                                  </option>
                                ))}
                              </EditableSelect>
                            </SettlementCardField>

                            <SettlementCardField>
                              <SettlementCardLabel>Payee</SettlementCardLabel>
                              <EditableSelect
                                value={payeeId}
                                onChange={(e) => handlePayeeChange(settlementKey, e.target.value)}
                              >
                                {members.map((member) => (
                                  <option key={member.member_id} value={member.member_id}>
                                    {member.display_name}
                                  </option>
                                ))}
                              </EditableSelect>
                            </SettlementCardField>

                            <SettlementCardField>
                              <SettlementCardLabel>Amount</SettlementCardLabel>
                              <EditableAmountInput
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={(e) => handleAmountChange(settlementKey, e.target.value)}
                              />
                            </SettlementCardField>

                            <SettlementCardField>
                              <SettlementCardLabel>Method</SettlementCardLabel>
                              <EditableSelect
                                value={method}
                                onChange={(e) => handleMethodChange(settlementKey, e.target.value)}
                              >
                                <option value="UPI">UPI</option>
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                              </EditableSelect>
                            </SettlementCardField>
                          </SettlementCardGrid>
                        )}

                        <SettlementCardActions>
                          <SettlementSecondaryButton
                            type="button"
                            onClick={() => setExpandedSettlementKey((cur) => (cur === settlementKey ? null : settlementKey))}
                          >
                            {isExpanded ? 'Done' : 'Edit'}
                          </SettlementSecondaryButton>
                          <SettlementPrimaryButton type="button" onClick={() => handleMakeSettlement(settlementKey)}>
                            Make Settlement
                          </SettlementPrimaryButton>
                        </SettlementCardActions>
                      </SettlementCard>
                    );
                  })}
                </SettlementCards>
              ) : (
                <SettlementSection>
                  <SettlementsTable>
                    <thead>
                      <tr>
                        <SettlementHeader>Payer → Payee</SettlementHeader>
                        <SettlementHeader>Amount</SettlementHeader>
                        <SettlementHeader>Method</SettlementHeader>
                        <SettlementHeader>Action</SettlementHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {optimizedSettlements.map((settlement) => {
                        const settlementKey = `${settlement.from}-${settlement.to}`;
                        const payerId = settlementPayers[settlementKey] || settlement.from;
                        const payeeId = settlementPayees[settlementKey] || settlement.to;
                        const amount = settlementAmounts[settlementKey] || settlement.amount.toFixed(2);
                        return (
                          <SettlementRow key={settlementKey}>
                            <SettlementCell>
                              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', margin: 0 }}>
                                <EditableSelect
                                  value={payerId}
                                  onChange={(e) => handlePayerChange(settlementKey, e.target.value)}
                                >
                                  {members.map((member) => (
                                    <option key={member.member_id} value={member.member_id}>
                                      {member.display_name}
                                    </option>
                                  ))}
                                </EditableSelect>
                                <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)', margin: 0 }}>→</span>
                                <EditableSelect
                                  value={payeeId}
                                  onChange={(e) => handlePayeeChange(settlementKey, e.target.value)}
                                >
                                  {members.map((member) => (
                                    <option key={member.member_id} value={member.member_id}>
                                      {member.display_name}
                                    </option>
                                  ))}
                                </EditableSelect>
                              </div>
                            </SettlementCell>
                            <SettlementCell style={{ padding: '0.5rem', textAlign: 'right' }}>
                              <EditableAmountInput
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={(e) => handleAmountChange(settlementKey, e.target.value)}
                              />
                            </SettlementCell>
                            <SettlementCell style={{ padding: '0.5rem' }}>
                              <EditableSelect
                                value={settlementMethods[settlementKey] || 'UPI'}
                                onChange={(e) => handleMethodChange(settlementKey, e.target.value)}
                              >
                                <option value="UPI">UPI</option>
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                              </EditableSelect>
                            </SettlementCell>
                            <SettlementCell style={{ padding: '0.5rem' }}>
                              <SettleButton onClick={() => handleMakeSettlement(settlementKey)}>
                                Make Settlement
                              </SettleButton>
                            </SettlementCell>
                          </SettlementRow>
                        );
                      })}
                    </tbody>
                  </SettlementsTable>
                </SettlementSection>
              )}
            </>
          )}
        </SettlementsWrapper>
      ) : (
        <SettlementsWrapper>
          {loadingSettlements ? (
            <EmptyState>
              <p>Loading settlements…</p>
            </EmptyState>
          ) : previousSettlements.length === 0 ? (
            <EmptyState>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📋</div>
              <p>No settlement history yet</p>
            </EmptyState>
          ) : (
            <SettlementSection>
              <SettlementsTable>
                <thead>
                  <tr>
                    <SettlementHeader>From → To</SettlementHeader>
                    <SettlementHeader>Amount</SettlementHeader>
                    <SettlementHeader>Date</SettlementHeader>
                    <SettlementHeader>Method</SettlementHeader>
                  </tr>
                </thead>
                <tbody>
                  {previousSettlements.map((settlement) => (
                    <SettlementRow key={settlement.id}>
                      <SettlementCell>
                        <strong>{getMemberName(settlement.payer_member_id)}</strong>
                        {' → '}
                        <strong>{getMemberName(settlement.payee_member_id)}</strong>
                      </SettlementCell>
                      <SettlementCell>{formatCurrency(settlement.amount)}</SettlementCell>
                      <SettlementCell>
                        <SettlementDate>
                                      {formatRelativeDate(
                                        settlement.created_at ||
                                          // Some backends may send "date" instead of "created_at"
                                          (settlement as unknown as { date?: string }).date ||
                                          new Date().toISOString()
                                      )}
                        </SettlementDate>
                      </SettlementCell>
                      <SettlementCell>
                        {settlement.mode === 'upi' ? 'UPI' : settlement.mode === 'cash' ? 'Cash' : 'Card'}
                      </SettlementCell>
                    </SettlementRow>
                  ))}
                </tbody>
              </SettlementsTable>
            </SettlementSection>
          )}
        </SettlementsWrapper>
      )}
    </PanelSection>
  );

  const renderExpensesPanel = () => (
    <PanelSection>
      <SectionTitle style={{ marginBottom: '0.5rem' }}>All Expenses ({expenses.length})</SectionTitle>

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
                    <ExpenseRight>
                      <ExpenseAmount>{formatCurrency(expense.amount || 0)}</ExpenseAmount>
                      <ExpenseActions className="expense-actions">
                        <IconButton title="Edit" onClick={() => handleEdit(expense)}>
                          ✏️
                        </IconButton>
                        <IconButton title="Delete" onClick={() => handleDelete(expense.id)}>
                          🗑️
                        </IconButton>
                      </ExpenseActions>
                    </ExpenseRight>
                  </ExpenseCard>
                ))}
              </DateGroup>
            ))}
          </ExpensesList>
        </ExpensesWrapper>
      )}
    </PanelSection>
  );

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
        {isMobile ? (
          <>
            <MobileTabs>
              <MobileTab
                type="button"
                active={mobileActiveTab === 'balances'}
                onClick={() => setMobileActiveTab('balances')}
              >
                Balances
              </MobileTab>
              <MobileTab
                type="button"
                active={mobileActiveTab === 'settlements'}
                onClick={() => setMobileActiveTab('settlements')}
              >
                Settlements
              </MobileTab>
              <MobileTab
                type="button"
                active={mobileActiveTab === 'expenses'}
                onClick={() => setMobileActiveTab('expenses')}
              >
                Expenses
              </MobileTab>
            </MobileTabs>

            {mobileActiveTab === 'balances' && renderBalancesPanel()}
            {mobileActiveTab === 'settlements' && renderSettlementsPanel()}
            {mobileActiveTab === 'expenses' && renderExpensesPanel()}
          </>
        ) : (
          <PanelGroup direction="vertical">
            {/* Top Section: Balances (left) and Settlements (right) */}
            <Panel defaultSize={35} minSize={25} maxSize={50}>
              <PanelGroup direction="horizontal">
                {/* Balances Panel - Left */}
                <Panel defaultSize={50} minSize={30}>{renderBalancesPanel()}</Panel>

                {/* Vertical Resize Handle */}
                <PanelResizeHandle>
                  <ResizeHandleVertical />
                </PanelResizeHandle>

                {/* Settlements Panel - Right */}
                <Panel defaultSize={50} minSize={30}>{renderSettlementsPanel()}</Panel>
              </PanelGroup>
            </Panel>

            {/* Horizontal Resize Handle */}
            <PanelResizeHandle>
              <ResizeHandleHorizontal />
            </PanelResizeHandle>

            {/* Bottom Section: Expenses List */}
            <Panel defaultSize={65} minSize={30}>{renderExpensesPanel()}</Panel>
          </PanelGroup>
        )}
      </GridContainer>
    </>
  );
}

