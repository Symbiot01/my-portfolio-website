// File: src/components/ScrollCue.tsx
// Description: Animated scroll cue indicator for prompting users to scroll down.
'use client';

import styled from '@emotion/styled';
import { ChevronDown } from 'lucide-react';
import { keyframes } from '@emotion/react';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const ScrollCueWrapper = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 80px;

  @media (min-width: 2000px) {
    width: 140px;
    height: 140px;
  }
`;

const CircleText = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  font-size: 0.5rem;
  font-weight: 500;
  color: ${({ theme }) => theme.mutedText};
  animation: ${spin} 8s linear infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;

  @media (min-width: 2000px) {
    font-size: 0.65rem;
  }

  svg {
    margin-top: -2px;
  }
`;

const RotatingText = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  text-align: center;

  span {
    display: inline-block;
    position: absolute;
    left: 50%;
    transform-origin: 0 40px;

    @media (min-width: 2000px) {
      transform-origin: 0 70px;
    }
  }
`;

const ChevronWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

type ScrollCueProps = {
  text?: string;
};

export default function ScrollCue({ text = '• Scroll Down • Scroll Down •' }: ScrollCueProps) {
  return (
    <ScrollCueWrapper>
      <CircleText>
        <RotatingText>
          {text.split('').map((char, i) => (
            <span
              key={i}
              style={{
                transform: `rotate(${i * (360 / text.length)}deg)`,
              }}
            >
              {char}
            </span>
          ))}
        </RotatingText>
      </CircleText>
      <ChevronWrapper>
        <ChevronDown size={28} />
      </ChevronWrapper>
    </ScrollCueWrapper>
  );
}
