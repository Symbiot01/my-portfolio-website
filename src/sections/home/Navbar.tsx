// File: src/sections/Navbar.tsx
// Description: Navigation bar with links to portfolio sections and dark mode toggle.
'use client';
import styled from '@emotion/styled';
import Link from 'next/link';
import DarkModeToggle from '../../components/DarkModeToggle';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
declare module '@emotion/react' {
    export interface Theme {
        cardBg: string;
        surface: string;
        text: string;
        primary: string;
        border: string;
        // Add other theme properties here
    }
  }

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  z-index: 50;

  @media (max-width: 768px) {
    padding: 0.85rem 1rem;
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.text};
    font-weight: 500;

    &:hover {
      color: ${({ theme }) => theme.primary};
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const DesktopAuthLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileControls = styled.div`
  display: none;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const IconButton = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: transparent;
  color: ${({ theme }) => theme.text};
  padding: 0.55rem 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.primary};
    outline-offset: 2px;
  }
`;

const MobileOverlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  display: ${({ open }) => (open ? 'block' : 'none')};
`;

const MobileDrawer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  z-index: 101;
  padding: 0.75rem 1rem 1rem;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
`;

const MobileSectionTitle = styled.div`
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
  margin: 0.75rem 0 0.35rem;
`;

const MobileLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  a,
  button {
    text-align: left;
    text-decoration: none;
    color: ${({ theme }) => theme.text};
    font-weight: 600;
    padding: 0.7rem 0.6rem;
    border-radius: 10px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    font-size: 0.95rem;
  }

  a:hover,
  button:hover {
    border-color: ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.cardBg};
  }

  a:focus-visible,
  button:focus-visible {
    outline: 2px solid ${({ theme }) => theme.primary};
    outline-offset: 2px;
  }
`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const navItems = useMemo(
    () => [
      { label: 'Home', href: '#hero' },
      { label: 'Projects', href: '#projects' },
      { label: 'Skills', href: '#skills' },
      { label: 'Research', href: '#research' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'Blog', href: '/blog' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    []
  );

  // Close the drawer when navigating to a different route.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape and lock scroll while open.
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <Nav>
      <Logo>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Symbiot
        </Link>
      </Logo>

      <NavLinks>
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            {item.label}
          </Link>
        ))}
      </NavLinks>

      <RightSection>
        <DarkModeToggle />
        {/* 3. Conditionally show Login or Logout */}
        <DesktopAuthLinks>
          {user ? (
            <>
              <Link href="/dashboard/write">Write Post</Link>
              <span style={{ fontWeight: 500 }}>{user.username}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </DesktopAuthLinks>

        <MobileControls>
          <IconButton
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? '✕' : '☰'}
          </IconButton>
        </MobileControls>
      </RightSection>

      <MobileOverlay
        open={mobileOpen}
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
      />
      {mobileOpen && (
        <MobileDrawer
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          ref={drawerRef}
          onClick={(e) => e.stopPropagation()}
        >
          <MobileSectionTitle>Navigate</MobileSectionTitle>
          <MobileLinks>
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={closeMobile}>
                {item.label}
              </Link>
            ))}
          </MobileLinks>

          <MobileSectionTitle>Account</MobileSectionTitle>
          <MobileLinks>
            {user ? (
              <>
                <Link href="/dashboard/write" onClick={closeMobile}>
                  Write Post
                </Link>
                <div style={{ padding: '0 0.6rem', opacity: 0.8, fontSize: '0.9rem' }}>
                  Signed in as <strong>{user.username}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={closeMobile}>
                Login
              </Link>
            )}
          </MobileLinks>
        </MobileDrawer>
      )}
    </Nav>
  );
}
