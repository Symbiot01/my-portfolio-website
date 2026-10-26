// File: src/sections/home/Navbar.tsx
// Description: Deep Space Observatory command header with section jump links, Cmd+K trigger, status indicator, and app launchers.
'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import DarkModeToggle from '../../components/DarkModeToggle';
import { triggerCommandPalette } from '../../components/CommandPalette';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

declare module '@emotion/react' {
  export interface Theme {
    cardBg: string;
    surface: string;
    surfaceHigh?: string;
    text: string;
    primary: string;
    accent: string;
    border: string;
    background: string;
    mutedText: string;
    headingText: string;
    toggleBg: string;
    shadow: string;
    gradient: string;
    titleGradient: string;
  }
}

const NavOuter = styled.header`
  position: sticky;
  top: 0;
  z-index: 60;
  width: 100%;
  background: ${({ theme }) => `${theme.surface}d9`};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid ${({ theme }) => theme.border};
  transition: background 0.25s ease, border-color 0.25s ease;
`;

const NavInner = styled.nav`
  max-width: 1320px;
  margin: 0 auto;
  padding: 0.72rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.85rem;

  @media (max-width: 768px) {
    padding: 0.65rem 1rem;
  }
`;

const BrandGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
`;

const BrandLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: ${({ theme }) => theme.headingText};
  font-family: var(--font-display), 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.02rem;
  letter-spacing: -0.02em;
`;

const BrandMark = styled.span`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${({ theme }) => theme.gradient};
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono), monospace;
  font-size: 0.78rem;
  font-weight: 700;
  box-shadow: 0 2px 10px ${({ theme }) => theme.shadow};
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.22rem 0.58rem;
  border-radius: 999px;
  font-family: var(--font-mono), monospace;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.mutedText};
  background: ${({ theme }) => theme.toggleBg};
  border: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 1180px) {
    display: none;
  }
`;

const PulseDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: ${({ theme }) => theme.toggleBg};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 0.24rem;
  border-radius: 10px;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavItemLink = styled(Link)<{ active?: boolean; featured?: boolean }>`
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: ${({ active, featured }) => (active || featured ? 600 : 500)};
  padding: 0.36rem 0.68rem;
  border-radius: 7px;
  color: ${({ active, featured, theme }) =>
    active
      ? theme.headingText
      : featured
      ? theme.accent
      : theme.mutedText};
  background: ${({ active, theme }) => (active ? theme.cardBg : 'transparent')};
  border: 1px solid
    ${({ active, theme }) => (active ? theme.border : 'transparent')};
  transition: color 0.16s ease, background 0.16s ease, border-color 0.16s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;

  &:hover {
    color: ${({ theme }) => theme.headingText};
    background: ${({ active, theme }) =>
      active ? theme.cardBg : `${theme.cardBg}99`};
  }
`;

const LiveDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${({ theme }) => theme.accent};
  display: inline-block;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CmdTriggerBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.38rem 0.68rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.toggleBg};
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.78rem;
  cursor: pointer;
  transition: border-color 0.18s ease, color 0.18s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text};
  }

  kbd {
    font-family: var(--font-mono), monospace;
    font-size: 0.68rem;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    background: ${({ theme }) => theme.cardBg};
    border: 1px solid ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.text};
  }

  @media (max-width: 640px) {
    span.cmd-label {
      display: none;
    }
  }
`;

const ResumeLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.72rem;
  border-radius: 8px;
  font-family: var(--font-mono), monospace;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid ${({ theme }) => `${theme.primary}55`};
  background: ${({ theme }) => `${theme.primary}14`};
  color: ${({ theme }) => theme.headingText};
  transition: background 0.18s ease, border-color 0.18s ease;

  &:hover {
    background: ${({ theme }) => `${theme.primary}26`};
    border-color: ${({ theme }) => theme.primary};
  }

  @media (max-width: 820px) {
    display: none;
  }
`;

const DesktopAuthLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const AuthLinkBtn = styled(Link)<{ subtle?: boolean }>`
  padding: 0.38rem 0.75rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ subtle, theme }) =>
    subtle ? 'transparent' : theme.cardBg};
  color: ${({ theme }) => theme.text};
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const LogoutBtn = styled.button`
  padding: 0.38rem 0.72rem;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 600;
  border: 1px solid ${({ theme }) => theme.border};
  background: transparent;
  color: ${({ theme }) => theme.mutedText};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.text};
    border-color: ${({ theme }) => theme.primary};
  }
`;

const MobileControls = styled.div`
  display: none;
  align-items: center;
  gap: 0.45rem;

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const IconButton = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.toggleBg};
  color: ${({ theme }) => theme.text};
  padding: 0.44rem 0.62rem;
  border-radius: 8px;
  cursor: pointer;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.92rem;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const MobileOverlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.6);
  backdrop-filter: blur(4px);
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
  padding: 1rem 1.25rem 1.25rem;
  box-shadow: 0 18px 36px ${({ theme }) => theme.shadow};
`;

const MobileSectionTitle = styled.div`
  font-family: var(--font-mono), monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.mutedText};
  margin: 0.75rem 0 0.4rem;
`;

const MobileLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.4rem;

  a,
  button {
    text-align: left;
    text-decoration: none;
    color: ${({ theme }) => theme.text};
    font-weight: 600;
    padding: 0.58rem 0.75rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.cardBg};
    cursor: pointer;
    font-size: 0.85rem;
  }

  a:hover,
  button:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const navItems = useMemo(
    () => [
      { label: 'Projects', href: '#projects', featured: false },
      { label: 'Skills', href: '#skills', featured: false },
      { label: 'Research', href: '#research', featured: false },
      { label: 'Gallery', href: '#gallery', featured: false },
      { label: 'Blog', href: '/blog', featured: false },
      { label: 'TripSync', href: '/tripsync', featured: true },
      { label: 'Wishlist', href: '/wishlist', featured: true },
      { label: 'Contact', href: '#contact', featured: false },
    ],
    []
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  const resolveHref = (href: string) => {
    if (!href.startsWith('#')) return href;
    return pathname === '/' ? href : `/${href}`;
  };

  const isRouteActive = (href: string) => {
    if (href.startsWith('#')) return false;
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <NavOuter>
      <NavInner>
        <BrandGroup>
          <BrandLink href="/">
            <BrandMark>SP</BrandMark>
            <span>SAHIL_PATEL</span>
          </BrandLink>
          <StatusPill title="Systems Nominal • Open to AI/Robotics/Systems Roles">
            <PulseDot />
            <span>SYS: NOMINAL</span>
          </StatusPill>
        </BrandGroup>

        <NavLinks>
          {navItems.map((item) => (
            <NavItemLink
              key={item.label}
              href={resolveHref(item.href)}
              active={isRouteActive(item.href)}
              featured={item.featured}
            >
              {item.featured && <LiveDot />}
              {item.label}
            </NavItemLink>
          ))}
        </NavLinks>

        <RightSection>
          <CmdTriggerBtn
            type="button"
            onClick={triggerCommandPalette}
            aria-label="Open Command Palette"
            title="Search sections, apps & commands (Cmd+K)"
          >
            <span className="cmd-label">Search</span>
            <kbd>⌘K</kbd>
          </CmdTriggerBtn>

          <ResumeLink
            href="/Sahil_Patel_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            CV.pdf ↗
          </ResumeLink>

          <DarkModeToggle />

          <DesktopAuthLinks>
            {user ? (
              <>
                <AuthLinkBtn href="/dashboard/write">Studio</AuthLinkBtn>
                {user.role === 'admin' && (
                  <AuthLinkBtn href="/admin" subtle>
                    Queue
                  </AuthLinkBtn>
                )}
                <LogoutBtn type="button" onClick={logout} title={`Signed in as ${user.username}`}>
                  Out
                </LogoutBtn>
              </>
            ) : (
              <AuthLinkBtn href="/login" subtle>
                Sign In
              </AuthLinkBtn>
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
      </NavInner>

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
          <MobileSectionTitle>Observatory Navigation</MobileSectionTitle>
          <MobileLinks>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={resolveHref(item.href)}
                onClick={closeMobile}
              >
                {item.featured ? `✦ ${item.label}` : item.label}
              </Link>
            ))}
            <a
              href="/Sahil_Patel_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobile}
            >
              Resume (PDF) ↗
            </a>
          </MobileLinks>

          <MobileSectionTitle>Account & Studio</MobileSectionTitle>
          <MobileLinks>
            {user ? (
              <>
                <Link href="/dashboard/write" onClick={closeMobile}>
                  Editorial Studio
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" onClick={closeMobile}>
                    Admin Queue
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                >
                  Logout ({user.username})
                </button>
              </>
            ) : (
              <Link href="/login" onClick={closeMobile}>
                Sign In
              </Link>
            )}
          </MobileLinks>
        </MobileDrawer>
      )}
    </NavOuter>
  );
}
