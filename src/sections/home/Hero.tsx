// File: src/sections/home/Hero.tsx
// Description: Deep Space Observatory Hero section with telemetry badges, role chips, and interactive multi-tab code spec runner.
'use client';

import React, { useState } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { motion } from 'framer-motion';

const HeroSection = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 3.5rem 1.5rem 4.5rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem 3rem;
  }
`;

const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 1.5rem;
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LeftPanel = styled(motion.div)`
  background: ${({ theme }) => `${theme.cardBg}d9`};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 2.4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.75rem;
  box-shadow: 0 14px 38px ${({ theme }) => theme.shadow};

  @media (max-width: 640px) {
    padding: 1.5rem;
  }
`;

const TelemetryHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: ${({ theme }) => `${theme.primary}18`};
  border: 1px solid ${({ theme }) => `${theme.primary}44`};
  font-family: var(--font-mono), monospace;
  font-size: 0.72rem;
  font-weight: 600;
  color: ${({ theme }) => theme.headingText};
  letter-spacing: 0.04em;
`;

const GreenPulse = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
`;

const CoordLabel = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.72rem;
  color: ${({ theme }) => theme.mutedText};
`;

const HeadlineGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const Eyebrow = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.accent};
`;

const MainTitle = styled.h1`
  font-family: var(--font-display), 'Space Grotesk', sans-serif;
  font-size: clamp(2.35rem, 4.4vw, 3.7rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.03em;
  background: ${({ theme }) => theme.titleGradient};
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
`;

const LeadBio = styled.p`
  font-size: 1.02rem;
  line-height: 1.68;
  color: ${({ theme }) => theme.mutedText};
  max-width: 62ch;

  strong {
    color: ${({ theme }) => theme.headingText};
    font-weight: 600;
  }
`;

const RolePillsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
`;

const RolePill = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.74rem;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  background: ${({ theme }) => theme.toggleBg};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const ActionGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.25rem;
`;

const PrimaryCTA = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.72rem 1.35rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  background: ${({ theme }) => theme.gradient};
  color: #ffffff;
  box-shadow: 0 6px 20px ${({ theme }) => theme.shadow};
  transition: transform 0.16s ease, opacity 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }
`;

const SecondaryCTA = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.7rem 1.15rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.88rem;
  background: ${({ theme }) => theme.toggleBg};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.headingText};
  transition: border-color 0.18s ease, background 0.18s ease;

  &:hover {
    border-color: ${({ theme }) => theme.accent};
    background: ${({ theme }) => theme.cardBg};
  }
`;

const MetricsStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  padding-top: 1.2rem;
  border-top: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  span.val {
    font-family: var(--font-mono), monospace;
    font-size: 1.05rem;
    font-weight: 700;
    color: ${({ theme }) => theme.headingText};
  }

  span.lbl {
    font-family: var(--font-mono), monospace;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${({ theme }) => theme.mutedText};
  }
`;

/* Right Interactive Spec Runner */
const TerminalCard = styled(motion.div)`
  background: #090d1a;
  color: #e2e8f0;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 16px 40px ${({ theme }) => theme.shadow};
`;

const TerminalTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1rem;
  background: #0f1629;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  gap: 0.5rem;
`;

const WindowDots = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;

  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  span:nth-of-type(1) {
    background: #ef4444;
  }
  span:nth-of-type(2) {
    background: #f59e0b;
  }
  span:nth-of-type(3) {
    background: #10b981;
  }
`;

const TabRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  overflow-x: auto;
`;

const TabBtn = styled.button<{ active: boolean }>`
  font-family: var(--font-mono), monospace;
  font-size: 0.74rem;
  padding: 0.32rem 0.68rem;
  border-radius: 6px;
  border: 1px solid
    ${({ active }) => (active ? 'rgba(99, 102, 241, 0.5)' : 'transparent')};
  background: ${({ active }) =>
    active ? 'rgba(99, 102, 241, 0.18)' : 'transparent'};
  color: ${({ active }) => (active ? '#f8fafc' : '#94a3b8')};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: #f8fafc;
  }
`;

const RunBtn = styled.button`
  font-family: var(--font-mono), monospace;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.3rem 0.68rem;
  border-radius: 6px;
  border: 1px solid rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.14);
  color: #7dd3fc;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: rgba(56, 189, 248, 0.24);
  }
`;

const CodeViewport = styled.pre`
  flex: 1;
  margin: 0;
  padding: 1.15rem 1.25rem;
  font-family: var(--font-mono), 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  line-height: 1.62;
  color: #cbd5e1;
  overflow-x: auto;
  white-space: pre;
`;

const StdoutDrawer = styled.div`
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  background: #060913;
  padding: 0.75rem 1.1rem;
  font-family: var(--font-mono), monospace;
  font-size: 0.73rem;
  line-height: 1.5;
  color: #94a3b8;
`;

const CODE_TABS: Record<
  'sahil.py' | 'telemetry.json' | 'systems.yaml',
  { code: string; output: string[] }
> = {
  'sahil.py': {
    code: `# sahil.py — Autonomous Systems & AI Engineering Spec
class SahilPatel:
    def __init__(self):
        self.handle = "Symbiot01"
        self.institution = "IIT Kharagpur"
        self.degree = "Dual Degree (B.Tech + M.Tech) 2022–2027"
        self.department = "Ocean Eng. & Naval Architecture"
        self.domains = [
            "Deep Reinforcement Learning",
            "Autonomous Robotics & ROS2",
            "Computer Vision & 3D Graphics",
            "Full-Stack Distributed Web"
        ]

    def active_deployments(self) -> dict:
        return {
            "TripSync": "FastAPI + Next.js + Beanie + Gemini Co-Pilot",
            "WishlistDepot": "Anti-spoiler Registry + Live URL Scraper",
            "EditorialStudio": "Tiptap Workstation + Admin Merge Queue",
            "UnityRL": "PPO Self-Learning Multi-Agent Combat & Soccer",
        }

if __name__ == "__main__":
    eng = SahilPatel()
    print(f"[OK] {eng.institution} // {len(eng.domains)} Core Stacks Ready")`,
    output: [
      '$ python3 sahil.py --verify-telemetry',
      '[OK] IIT Kharagpur // 4 Core Stacks Ready',
      '[SYS] Active Deployments: TripSync, WishlistDepot, EditorialStudio, UnityRL',
      '[STATUS] Available for AI / Robotics / Systems Engineering roles & research',
    ],
  },
  'telemetry.json': {
    code: `{
  "engineer": "Sahil Patel",
  "education": {
    "institute": "Indian Institute of Technology Kharagpur",
    "program": "B.Tech + M.Tech Dual Degree (2022 - 2027)",
    "coursework": [
      "Deep Learning Specialization",
      "CS285 Deep Reinforcement Learning",
      "AI/ML in Robot Autonomy",
      "Algorithms & Data Structures",
      "Computer Graphics & OpenGL",
      "Optimization Techniques"
    ]
  },
  "contact": {
    "email": "patelsahil2k03@gmail.com",
    "github": "https://github.com/Symbiot01",
    "linkedin": "https://www.linkedin.com/in/sahil-patel-21b30a255/"
  }
}`,
    output: [
      '$ jq .education.coursework telemetry.json',
      '✓ Schema validated (6 graduate & specialization modules indexed)',
      '✓ Primary uplink: patelsahil2k03@gmail.com',
    ],
  },
  'systems.yaml': {
    code: `# Platform Architecture & Live Subsystems
observatory_version: "2.4.0-deep-space"
runtime:
  frontend: "Next.js 14 App Router + Emotion + TypeScript"
  backend: "FastAPI + Motor Async MongoDB + Beanie ODM"
  ai_engine: "PyTorch + OpenCV + Gemini Structured Co-Pilot"

live_routes:
  - path: "/tripsync"
    purpose: "Collaborative expense ledger, debt simplification & AI planner"
  - path: "/wishlist"
    purpose: "Shared hardware & gift registry with surprise lock"
  - path: "/blog"
    purpose: "Technical engineering documentation & research notes"
  - path: "/dashboard/write"
    purpose: "Rich Markdown/Tiptap editorial workstation"`,
    output: [
      '$ kubectl get routes -n sahil-observatory',
      'NAME              PATH               STATUS    LATENCY',
      'tripsync-ledger   /tripsync          ONLINE    18ms',
      'wishlist-depot    /wishlist          ONLINE    14ms',
      'editorial-studio  /dashboard/write   ONLINE    12ms',
    ],
  },
};

const ROLE_CHIPS = [
  'Deep RL & PyTorch',
  'Computer Vision (OpenCV)',
  'ROS & Embedded Robotics',
  'FastAPI & Next.js Systems',
  'Unity ML-Agents & Shaders',
  'IIT Kharagpur ’27',
];

export default function Hero() {
  const [activeTab, setActiveTab] = useState<'sahil.py' | 'telemetry.json' | 'systems.yaml'>('sahil.py');
  const [runCount, setRunCount] = useState(1);

  const currentSpec = CODE_TABS[activeTab];

  return (
    <HeroSection id="hero">
      <BentoGrid>
        <LeftPanel
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <TelemetryHeader>
            <StatusBadge>
              <GreenPulse />
              <span>OBSERVATORY_NODE // ACTIVE</span>
            </StatusBadge>
            <CoordLabel>IIT KHARAGPUR • DUAL DEGREE ’27</CoordLabel>
          </TelemetryHeader>

          <HeadlineGroup>
            <Eyebrow>Autonomous Systems • AI/ML • Full-Stack Architecture</Eyebrow>
            <MainTitle>Sahil Patel</MainTitle>
            <LeadBio>
              Engineering intelligent agents, real-time computer vision pipelines, and
              production full-stack platforms. Dual Degree researcher at{' '}
              <strong>IIT Kharagpur</strong> bridging <strong>Deep Reinforcement Learning</strong>,{' '}
              <strong>Robotics</strong>, and interactive systems.
            </LeadBio>
          </HeadlineGroup>

          <RolePillsRow>
            {ROLE_CHIPS.map((chip) => (
              <RolePill key={chip}>{chip}</RolePill>
            ))}
          </RolePillsRow>

          <ActionGroup>
            <PrimaryCTA href="#projects">Explore Systems Matrix ↓</PrimaryCTA>
            <SecondaryCTA href="/tripsync">Launch TripSync ↗</SecondaryCTA>
            <SecondaryCTA href="/wishlist">Hardware Registry ↗</SecondaryCTA>
            <SecondaryCTA href="/blog">Engineering Notes</SecondaryCTA>
          </ActionGroup>

          <MetricsStrip>
            <MetricItem>
              <span className="val">6+</span>
              <span className="lbl">Core Systems</span>
            </MetricItem>
            <MetricItem>
              <span className="val">3</span>
              <span className="lbl">Live Web Apps</span>
            </MetricItem>
            <MetricItem>
              <span className="val">2027</span>
              <span className="lbl">B.Tech + M.Tech</span>
            </MetricItem>
            <MetricItem>
              <span className="val">24/7</span>
              <span className="lbl">Telemetry Ready</span>
            </MetricItem>
          </MetricsStrip>
        </LeftPanel>

        <TerminalCard
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <TerminalTopBar>
            <WindowDots>
              <span />
              <span />
              <span />
            </WindowDots>

            <TabRow role="tablist" aria-label="Engineer specification files">
              {(['sahil.py', 'telemetry.json', 'systems.yaml'] as const).map((tab) => (
                <TabBtn
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  active={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </TabBtn>
              ))}
            </TabRow>

            <RunBtn
              type="button"
              onClick={() => setRunCount((c) => c + 1)}
              title="Execute current specification"
            >
              ▶ Run ({runCount})
            </RunBtn>
          </TerminalTopBar>

          <CodeViewport>{currentSpec.code}</CodeViewport>

          <StdoutDrawer>
            {currentSpec.output.map((line, i) => (
              <div
                key={i}
                style={{
                  color:
                    i === 0
                      ? '#38bdf8'
                      : line.startsWith('[OK]') || line.startsWith('✓')
                      ? '#10b981'
                      : '#94a3b8',
                }}
              >
                {line}
              </div>
            ))}
          </StdoutDrawer>
        </TerminalCard>
      </BentoGrid>
    </HeroSection>
  );
}
