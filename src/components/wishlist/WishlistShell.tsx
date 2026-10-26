'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import styled from '@emotion/styled';
import { Gift, List, Moon, Search, Settings, Sun, User } from 'lucide-react';
import { wl } from '@/styles/wishlistTheme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  background: ${wl.surface};
  border-bottom: 1px solid ${wl.border};
  padding: ${wl.space(1.5)} ${wl.space(3)};
  display: flex;
  align-items: center;
  gap: ${wl.space(2)};
  font-family: ${wl.font.family};

  @media (max-width: 768px) {
    padding: ${wl.space(1.5)} ${wl.space(2)};
  }
`;

const Logo = styled(Link)`
  font-weight: 800;
  font-size: 1.25rem;
  color: ${wl.primaryDeep};
  text-decoration: none;
  letter-spacing: -0.02em;
  flex-shrink: 0;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${wl.space(2.5)};
  margin-left: ${wl.space(2)};

  @media (max-width: 900px) {
    display: none;
  }
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  font: ${wl.font.label};
  color: ${({ $active }) => ($active ? wl.primaryDeep : wl.inkMuted)};
  text-decoration: none;
  padding-bottom: 2px;
  border-bottom: 2px solid ${({ $active }) => ($active ? wl.primaryDeep : 'transparent')};

  &:hover {
    color: ${wl.primaryDeep};
  }
`;

const SearchWrap = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: ${wl.space(1)};
  background: ${wl.canvas};
  border: 1px solid ${wl.border};
  border-radius: ${wl.radiusMd}px;
  padding: ${wl.space(1)} ${wl.space(1.5)};
  min-width: 180px;
  max-width: 280px;
  flex: 1;

  @media (max-width: 640px) {
    display: none;
  }

  svg {
    color: ${wl.inkFaint};
    flex-shrink: 0;
  }

  input {
    border: none;
    background: transparent;
    outline: none;
    width: 100%;
    font: ${wl.font.bodySm};
    color: ${wl.ink};
  }
`;

const Profile = styled(Link)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${wl.primarySoft};
  color: ${wl.primaryDeep};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

type Props = {
  groupId?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
};

export function WishlistTopBar({ groupId, searchValue, onSearchChange }: Props) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const tab = searchParams?.get('tab') ?? null;

  const combinedHref = groupId ? `/wishlist/${groupId}` : '/wishlist';
  const settingsHref = groupId ? `/wishlist/${groupId}?tab=settings` : '/wishlist';
  const myListHref = groupId ? `/wishlist/${groupId}?tab=mine` : '/wishlist';

  return (
    <Bar>
      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '0.75rem',
          color: wl.inkMuted,
          textDecoration: 'none',
          padding: '0.3rem 0.55rem',
          borderRadius: '6px',
          border: `1px solid ${wl.border}`,
        }}
      >
        ← Portfolio
      </Link>
      <Logo href="/wishlist">Wishlist Registry</Logo>
      <Nav>
        <NavLink href={myListHref} $active={tab === 'mine' || pathname === '/wishlist'}>
          My List
        </NavLink>
        <NavLink
          href={combinedHref}
          $active={!!groupId && tab !== 'settings' && tab !== 'mine'}
        >
          Combined View
        </NavLink>
        <NavLink href={settingsHref} $active={tab === 'settings'}>
          Group Settings
        </NavLink>
      </Nav>
      <SearchWrap>
        <Search size={18} />
        <input
          type="search"
          placeholder="Search registry…"
          value={searchValue ?? ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          aria-label="Search products"
        />
      </SearchWrap>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          width: 38,
          height: 38,
          borderRadius: '10px',
          border: `1px solid ${wl.border}`,
          background: wl.canvas,
          color: wl.ink,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      <Profile href={user ? '/wishlist' : '/login'} aria-label="Account">
        <User size={20} />
      </Profile>
    </Bar>
  );
}

const Bottom = styled.nav`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background: ${wl.surface};
  border-top: 1px solid ${wl.border};
  padding: ${wl.space(1)} ${wl.space(2)} calc(${wl.space(1)} + env(safe-area-inset-bottom));
  justify-content: space-around;
  font-family: ${wl.font.family};

  @media (max-width: 900px) {
    display: flex;
  }
`;

const BottomItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: ${({ $active }) => ($active ? '#fff' : wl.inkMuted)};
  font: ${wl.font.labelSm};
  padding: ${wl.space(1)} ${wl.space(1.5)};
  border-radius: ${wl.radiusMd}px;
  background: ${({ $active }) => ($active ? wl.primaryDeep : 'transparent')};
  min-width: 72px;
`;

export function WishlistBottomNav({ groupId }: { groupId?: string }) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab') ?? null;

  const myListHref = groupId ? `/wishlist/${groupId}?tab=mine` : '/wishlist';
  const combinedHref = groupId ? `/wishlist/${groupId}` : '/wishlist';
  const settingsHref = groupId ? `/wishlist/${groupId}?tab=settings` : '/wishlist';

  const onGroup = !!groupId && pathname.includes(`/wishlist/${groupId}`);

  return (
    <Bottom>
      <BottomItem href={myListHref} $active={onGroup ? tab === 'mine' : pathname === '/wishlist'}>
        <List size={20} />
        My List
      </BottomItem>
      <BottomItem
        href={combinedHref}
        $active={onGroup && tab !== 'settings' && tab !== 'mine'}
      >
        <Gift size={20} />
        Combined
      </BottomItem>
      <BottomItem href={settingsHref} $active={onGroup && tab === 'settings'}>
        <Settings size={20} />
        Settings
      </BottomItem>
    </Bottom>
  );
}
