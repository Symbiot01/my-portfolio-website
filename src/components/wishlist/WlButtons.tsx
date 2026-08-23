'use client';

import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { wl } from '@/styles/wishlistTheme';

const baseBtn = css`
  font-family: ${wl.font.family};
  font-weight: 600;
  font-size: 0.9375rem;
  line-height: 1.2;
  border-radius: ${wl.radiusSm}px;
  padding: ${wl.space(1.5)} ${wl.space(2)};
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease,
    transform 0.1s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${wl.space(1)};
  border: 1px solid transparent;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:not(:disabled):active {
    transform: scale(0.98);
  }
`;

export const WlPrimaryButton = styled.button`
  ${baseBtn};
  background: ${wl.primaryDeep};
  color: #fff;
  width: 100%;

  &:not(:disabled):hover {
    background: ${wl.primary};
  }
`;

export const WlSecondaryButton = styled.button`
  ${baseBtn};
  background: ${wl.canvas};
  color: ${wl.ink};
  border-color: ${wl.border};

  &:not(:disabled):hover {
    background: ${wl.border};
  }
`;

export const WlGhostButton = styled.button`
  ${baseBtn};
  background: ${wl.surface};
  color: ${wl.primaryDeep};
  border-color: ${wl.primaryDeep};
  width: 100%;

  &:not(:disabled):hover {
    background: ${wl.primarySoft};
  }
`;

/** Outlined purple CTA — “Add Another Option” */
export const WlOutlineButton = styled.button`
  ${baseBtn};
  background: ${wl.surface};
  color: ${wl.primaryDeep};
  border-color: ${wl.primaryDeep};
  width: 100%;

  &:not(:disabled):hover {
    background: ${wl.primarySoft};
  }
`;

export const WlDangerButton = styled.button`
  ${baseBtn};
  background: ${wl.dangerSoft};
  color: ${wl.danger};
  border-color: transparent;

  &:not(:disabled):hover {
    background: ${wl.danger};
    color: #fff;
  }
`;

export const WlIconButton = styled.button<{ tone?: 'primary' | 'tertiary' | 'danger' | 'secondary' }>`
  ${baseBtn};
  padding: ${wl.space(1)};
  width: 40px;
  height: 40px;
  border-radius: ${wl.radiusSm}px;
  background: ${({ tone }) =>
    tone === 'tertiary'
      ? wl.tertiary
      : tone === 'danger'
        ? wl.dangerSoft
        : tone === 'secondary'
          ? wl.secondarySoft
          : wl.primarySoft};
  color: ${({ tone }) =>
    tone === 'tertiary'
      ? wl.ink
      : tone === 'danger'
        ? wl.danger
        : tone === 'secondary'
          ? wl.secondary
          : wl.primaryDeep};
`;
