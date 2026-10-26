'use client';

import { ReactNode, Suspense } from 'react';
import styled from '@emotion/styled';
import { wl } from '@/styles/wishlistTheme';
import { WishlistBottomNav, WishlistTopBar } from '@/components/wishlist/WishlistShell';

const Shell = styled.div`
  min-height: 100vh;
  background: ${wl.canvas};
  color: ${wl.ink};
  font-family: ${wl.font.family};
  padding-bottom: 72px;

  @media (min-width: 901px) {
    padding-bottom: 0;
  }
`;

const Main = styled.main`
  max-width: 1120px;
  margin: 0 auto;
  padding: ${wl.space(3)} ${wl.space(3)} ${wl.space(5)};

  @media (max-width: 768px) {
    padding: ${wl.space(2)} ${wl.space(2)} ${wl.space(4)};
  }
`;

type Props = {
  children: ReactNode;
  groupId?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  hideChrome?: boolean;
};

export function WishlistAppShell({
  children,
  groupId,
  searchValue,
  onSearchChange,
  hideChrome,
}: Props) {
  return (
    <Shell style={{ fontFamily: 'var(--font-sans), system-ui, sans-serif' }}>
      {!hideChrome && (
        <Suspense fallback={null}>
          <WishlistTopBar
            groupId={groupId}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
          />
        </Suspense>
      )}
      <Main>{children}</Main>
      {!hideChrome && (
        <Suspense fallback={null}>
          <WishlistBottomNav groupId={groupId} />
        </Suspense>
      )}
    </Shell>
  );
}
