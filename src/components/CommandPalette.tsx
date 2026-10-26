// File: src/components/CommandPalette.tsx
// Description: Global Cmd+K / Ctrl+K / "/" quick launcher modal for the Deep Space Observatory platform.
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export const OPEN_COMMAND_PALETTE_EVENT = 'open-observatory-command-palette';

export function triggerCommandPalette() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE_EVENT));
  }
}

interface CommandItem {
  id: string;
  label: string;
  sublabel: string;
  category: 'Navigation' | 'Platform Apps' | 'Developer Actions';
  shortcut?: string;
  action: () => void;
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 250;
  background: rgba(2, 6, 23, 0.68);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 12vh 1rem 2rem;
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 620px;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  box-shadow: 0 24px 60px ${({ theme }) => theme.shadow};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.95rem 1.15rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
`;

const PromptPrefix = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
  user-select: none;
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.text};
  font-size: 0.96rem;
  font-family: var(--font-sans), sans-serif;

  &::placeholder {
    color: ${({ theme }) => theme.mutedText};
  }
`;

const EscBadge = styled.kbd`
  font-family: var(--font-mono), monospace;
  font-size: 0.7rem;
  padding: 0.2rem 0.45rem;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.toggleBg};
  color: ${({ theme }) => theme.mutedText};
`;

const ListArea = styled.div`
  max-height: 380px;
  overflow-y: auto;
  padding: 0.5rem;
`;

const CategoryHeader = styled.div`
  font-family: var(--font-mono), monospace;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.mutedText};
  padding: 0.55rem 0.75rem 0.3rem;
`;

const CommandRow = styled.button<{ active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0.8rem;
  border-radius: 9px;
  border: 1px solid ${({ active, theme }) => (active ? `${theme.primary}55` : 'transparent')};
  background: ${({ active, theme }) => (active ? `${theme.primary}18` : 'transparent')};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  text-align: left;
  transition: background 0.12s ease, border-color 0.12s ease;

  &:hover {
    background: ${({ theme }) => `${theme.primary}14`};
  }
`;

const RowMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const RowTitle = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.headingText};
`;

const RowSub = styled.span`
  font-size: 0.76rem;
  color: ${({ theme }) => theme.mutedText};
`;

const ShortcutPill = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.72rem;
  padding: 0.18rem 0.5rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.toggleBg};
  color: ${({ theme }) => theme.mutedText};
  white-space: nowrap;
`;

const FooterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.toggleBg};
  font-family: var(--font-mono), monospace;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.mutedText};
`;

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  const navigateSection = (hash: string) => {
    setOpen(false);
    if (pathname === '/') {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    router.push(`/${hash}`);
  };

  const navigateRoute = (route: string) => {
    setOpen(false);
    router.push(route);
  };

  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      {
        id: 'nav-hero',
        label: 'Observatory Overview & Spec Runner',
        sublabel: 'Jump to Hero section and interactive sahil.py runner',
        category: 'Navigation',
        shortcut: 'G H',
        action: () => navigateSection('#top'),
      },
      {
        id: 'nav-projects',
        label: 'Featured Systems & Projects Matrix',
        sublabel: '6-card engineering bento with architecture telemetry',
        category: 'Navigation',
        shortcut: 'G P',
        action: () => navigateSection('#projects'),
      },
      {
        id: 'nav-skills',
        label: 'Capabilities & Proof-of-Work Matrix',
        sublabel: 'AI/ML, Robotics, CV, Backend, Frontend & DevOps stacks',
        category: 'Navigation',
        shortcut: 'G S',
        action: () => navigateSection('#skills'),
      },
      {
        id: 'nav-research',
        label: 'Research Lab & Publications Archive',
        sublabel: 'Papers, Colab notebooks, and graduate coursework',
        category: 'Navigation',
        shortcut: 'G R',
        action: () => navigateSection('#research'),
      },
      {
        id: 'nav-gallery',
        label: 'Visual Vault & 3D Renders',
        sublabel: 'Blender renders, game scenes, and visual experiments',
        category: 'Navigation',
        action: () => navigateSection('#gallery'),
      },
      {
        id: 'nav-contact',
        label: 'Open Transmission Channel (Contact)',
        sublabel: 'Direct message, social channels, or copyable cURL payload',
        category: 'Navigation',
        shortcut: 'G C',
        action: () => navigateSection('#contact'),
      },
      {
        id: 'app-tripsync',
        label: 'Launch TripSync Expense & Itinerary Workspace',
        sublabel: 'Collaborative group expense splitting, debt simplification & AI planner',
        category: 'Platform Apps',
        shortcut: '/tripsync',
        action: () => navigateRoute('/tripsync'),
      },
      {
        id: 'app-wishlist',
        label: 'Launch Hardware & Gift Registry Depot',
        sublabel: 'Shared wishlists with URL metadata scraper and surprise protection',
        category: 'Platform Apps',
        shortcut: '/wishlist',
        action: () => navigateRoute('/wishlist'),
      },
      {
        id: 'app-blog',
        label: 'Read Engineering Notes & Blog',
        sublabel: 'Technical deep-dives, architecture logs, and tutorials',
        category: 'Platform Apps',
        shortcut: '/blog',
        action: () => navigateRoute('/blog'),
      },
      {
        id: 'app-write',
        label: 'Open Editorial Studio (Write Post)',
        sublabel: 'Markdown + Tiptap rich editor with frontmatter & live telemetry',
        category: 'Platform Apps',
        shortcut: '/dashboard/write',
        action: () => navigateRoute('/dashboard/write'),
      },
      {
        id: 'act-theme',
        label: `Switch to ${isDarkMode ? 'Daylight Light' : 'Deep Space Dark'} Theme`,
        sublabel: 'Toggle color scheme across all platform routes',
        category: 'Developer Actions',
        shortcut: 'T',
        action: () => {
          toggleTheme();
          setOpen(false);
        },
      },
      {
        id: 'act-resume',
        label: 'Open Resume PDF (Sahil_Patel_Resume.pdf)',
        sublabel: 'View or download engineering curriculum vitae in new tab',
        category: 'Developer Actions',
        shortcut: 'CV',
        action: () => {
          window.open('/Sahil_Patel_Resume.pdf', '_blank', 'noopener,noreferrer');
          setOpen(false);
        },
      },
      {
        id: 'act-email',
        label: 'Copy Sahil Email Address to Clipboard',
        sublabel: 'patelsahil2k03@gmail.com',
        category: 'Developer Actions',
        shortcut: 'COPY',
        action: () => {
          navigator.clipboard?.writeText('patelsahil2k03@gmail.com');
          setToastMsg('Copied patelsahil2k03@gmail.com');
          setTimeout(() => {
            setToastMsg(null);
            setOpen(false);
          }, 900);
        },
      },
    ];

    if (user?.role === 'admin') {
      list.push({
        id: 'app-admin',
        label: 'Admin Editorial Merge Queue',
        sublabel: 'Review, inspect, and publish pending blog posts',
        category: 'Platform Apps',
        shortcut: '/admin',
        action: () => navigateRoute('/admin'),
      });
    }

    return list;
  }, [isDarkMode, pathname, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.sublabel.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, open]);

  useEffect(() => {
    const handleCustomOpen = () => {
      setOpen(true);
      setQuery('');
    };
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handleCustomOpen);
    return () => window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handleCustomOpen);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery('');
        return;
      }

      if (
        e.key === '/' &&
        !open &&
        !(
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement ||
          (document.activeElement as HTMLElement)?.isContentEditable
        )
      ) {
        e.preventDefault();
        setOpen(true);
        setQuery('');
        return;
      }

      if (!open) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filtered.length ? (prev - 1 + filtered.length) % filtered.length : 0
        );
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filtered, selectedIndex]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  if (!open) return null;

  const categories: Array<CommandItem['category']> = [
    'Navigation',
    'Platform Apps',
    'Developer Actions',
  ];

  let runningIndex = -1;

  return (
    <Backdrop onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Command Palette">
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <SearchBar>
          <PromptPrefix>~/sahil $</PromptPrefix>
          <SearchInput
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, section, or app (TripSync, Wishlist, Resume)..."
            aria-label="Command palette search"
          />
          <EscBadge>ESC</EscBadge>
        </SearchBar>

        <ListArea>
          {toastMsg ? (
            <div
              style={{
                padding: '1.25rem',
                textAlign: 'center',
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '0.86rem',
              }}
            >
              ✓ {toastMsg}
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                padding: '1.75rem',
                textAlign: 'center',
                fontSize: '0.88rem',
                opacity: 0.7,
              }}
            >
              No matching commands for &ldquo;{query}&rdquo;
            </div>
          ) : (
            categories.map((cat) => {
              const items = filtered.filter((item) => item.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  <CategoryHeader>{cat}</CategoryHeader>
                  {items.map((item) => {
                    runningIndex += 1;
                    const idx = runningIndex;
                    const isActive = idx === selectedIndex;
                    return (
                      <CommandRow
                        key={item.id}
                        type="button"
                        active={isActive}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={item.action}
                      >
                        <RowMain>
                          <RowTitle>{item.label}</RowTitle>
                          <RowSub>{item.sublabel}</RowSub>
                        </RowMain>
                        {item.shortcut && <ShortcutPill>{item.shortcut}</ShortcutPill>}
                      </CommandRow>
                    );
                  })}
                </div>
              );
            })
          )}
        </ListArea>

        <FooterBar>
          <span>↑↓ Navigate • ↵ Execute • ESC Close</span>
          <span>SYS_LOC // 19.0760° N, 72.8777° E</span>
        </FooterBar>
      </ModalCard>
    </Backdrop>
  );
}
