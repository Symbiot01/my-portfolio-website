// File: src/sections/Navbar.tsx
// Description: Navigation bar with links to portfolio sections and dark mode toggle.
'use client';
import styled from '@emotion/styled';
import Link from 'next/link';
import DarkModeToggle from '../../components/DarkModeToggle';
import { useAuth } from '@/context/AuthContext';
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
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
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
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <Nav>
      <Logo>Symbiot</Logo>

      <NavLinks>
        <Link href="#hero">Home</Link>
        <Link href="#projects">Projects</Link>
        <Link href="#skills">Skills</Link>
        <Link href="#research">Research</Link>
        <Link href="#gallery">Gallery</Link>
        <Link href="blog">Blog</Link>
        <Link href="#about">About</Link>
        <Link href="#contact">Contact</Link>
      </NavLinks>

      <RightSection>
        <DarkModeToggle />
        {/* 3. Conditionally show Login or Logout */}
        {user ? (
          <>
            <Link href="/dashboard/write">Write Post</Link>
            <span style={{ fontWeight: 500 }}>{user.username}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </RightSection>
    </Nav>
  );
}
