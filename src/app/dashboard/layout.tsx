'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styled from '@emotion/styled';
import Navbar from '@/sections/home/Navbar';

const DashboardContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <>
      <Navbar />
      <DashboardContainer>
        <h1>My Dashboard</h1>
        {/* We can add sub-navigation here later (e.g., Write, My Posts) */}
        <main>{children}</main>
      </DashboardContainer>
    </>
  );
}