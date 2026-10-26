// File: src/sections/home/Skills.tsx
// Description: 6-Bay Capabilities Matrix with live Proof-of-Work inspector HUD.
'use client';

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  SiPytorch,
  SiTensorflow,
  SiScikitlearn,
  SiOpencv,
  SiArduino,
  SiRaspberrypi,
  SiRos,
  SiUnity,
  SiDotnet,
  SiReact,
  SiNextdotjs,
  SiFastapi,
  SiMongodb,
  SiBlender,
  SiFigma,
  SiGit,
  SiDocker,
  SiLinux,
  SiPython,
} from 'react-icons/si';
import { IconType } from 'react-icons';

const Section = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 4.5rem 1.5rem;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const TopRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Eyebrow = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.accent};
`;

const Heading = styled.h2`
  font-family: var(--font-display), 'Space Grotesk', sans-serif;
  font-size: clamp(1.85rem, 3.2vw, 2.5rem);
  font-weight: 700;
  color: ${({ theme }) => theme.headingText};
  margin-top: 0.35rem;
`;

const InspectorHUD = styled.div`
  background: ${({ theme }) => `${theme.cardBg}ee`};
  border: 1px solid ${({ theme }) => `${theme.primary}55`};
  border-radius: 12px;
  padding: 0.9rem 1.2rem;
  min-width: 320px;
  max-width: 520px;
  flex: 1;
  box-shadow: 0 8px 24px ${({ theme }) => theme.shadow};

  div.hud-label {
    font-family: var(--font-mono), monospace;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: ${({ theme }) => theme.accent};
    margin-bottom: 0.25rem;
  }

  div.hud-title {
    font-weight: 700;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.headingText};
    margin-bottom: 0.2rem;
  }

  div.hud-proof {
    font-size: 0.82rem;
    color: ${({ theme }) => theme.mutedText};
    line-height: 1.45;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const BayCard = styled(motion.div)`
  background: ${({ theme }) => `${theme.cardBg}d9`};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 6px 20px ${({ theme }) => theme.shadow};
`;

const BayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding-bottom: 0.65rem;
`;

const BayCode = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.mutedText};
`;

const BayTitle = styled.h3`
  font-family: var(--font-display), 'Space Grotesk', sans-serif;
  font-size: 1.08rem;
  font-weight: 700;
  color: ${({ theme }) => theme.headingText};
`;

const NodesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
`;

const SkillNode = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.7rem;
  border-radius: 9px;
  border: 1px solid
    ${({ selected, theme }) => (selected ? theme.primary : theme.border)};
  background: ${({ selected, theme }) =>
    selected ? `${theme.primary}1c` : theme.toggleBg};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  text-align: left;
  transition: all 0.16s ease;

  svg {
    width: 1.15rem;
    height: 1.15rem;
    color: ${({ selected, theme }) => (selected ? theme.accent : theme.primary)};
    flex-shrink: 0;
  }

  div.node-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  span.name {
    font-size: 0.82rem;
    font-weight: 600;
    color: ${({ theme }) => theme.headingText};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span.tag {
    font-family: var(--font-mono), monospace;
    font-size: 0.65rem;
    color: ${({ theme }) => theme.mutedText};
  }

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

interface SkillItem {
  name: string;
  tag: string;
  proof: string;
  icon: IconType;
}

interface SkillBay {
  code: string;
  title: string;
  skills: SkillItem[];
}

const SKILL_BAYS: SkillBay[] = [
  {
    code: 'BAY_01 // AI_DL',
    title: 'AI, Deep Learning & RL',
    skills: [
      {
        name: 'PyTorch',
        tag: 'RL / CNNs',
        proof: 'Used in DDPG & PPO policy networks, custom gym environments, and CNN classifiers.',
        icon: SiPytorch,
      },
      {
        name: 'TensorFlow',
        tag: 'Deep Learning',
        proof: 'Trained supervised & sequence architectures across Andrew Ng Deep Learning Specialization.',
        icon: SiTensorflow,
      },
      {
        name: 'scikit-learn',
        tag: 'Classical ML',
        proof: 'Feature pipelines, clustering, and baseline regression/classification benchmarks.',
        icon: SiScikitlearn,
      },
      {
        name: 'Python',
        tag: 'Core Runtime',
        proof: 'Primary language across ML research, FastAPI backends, and OpenCV vision pipelines.',
        icon: SiPython,
      },
    ],
  },
  {
    code: 'BAY_02 // CV_ROBOTICS',
    title: 'Computer Vision & Robotics',
    skills: [
      {
        name: 'OpenCV',
        tag: '60 FPS Vision',
        proof: 'Real-time contour detection, Kalman object tracking, and morphological filtering.',
        icon: SiOpencv,
      },
      {
        name: 'ROS',
        tag: 'Robot OS',
        proof: 'Pub/Sub telemetry nodes and autonomous navigation state estimation.',
        icon: SiRos,
      },
      {
        name: 'Raspberry Pi',
        tag: 'Edge Compute',
        proof: 'Onboard Linux edge inference and camera sensor integration.',
        icon: SiRaspberrypi,
      },
      {
        name: 'Arduino',
        tag: 'Microcontrollers',
        proof: 'Low-level PWM actuator control, IMU fusion, and ultrasonic sensor arrays.',
        icon: SiArduino,
      },
    ],
  },
  {
    code: 'BAY_03 // FULLSTACK',
    title: 'Full-Stack & Distributed Web',
    skills: [
      {
        name: 'Next.js 14',
        tag: 'App Router',
        proof: 'Powers this Observatory, TripSync collaborative workspace, and Wishlist Depot.',
        icon: SiNextdotjs,
      },
      {
        name: 'FastAPI',
        tag: 'Async Python',
        proof: 'Production REST API with JWT auth, Beanie ODM, rate-limiting, and AI Co-Pilot.',
        icon: SiFastapi,
      },
      {
        name: 'MongoDB',
        tag: 'Motor / Beanie',
        proof: 'Document modeling for TripSync expense ledgers, wishlists, and editorial posts.',
        icon: SiMongodb,
      },
      {
        name: 'React & TS',
        tag: 'Strict UI',
        proof: 'Type-safe interactive interfaces, custom hooks, and Emotion design systems.',
        icon: SiReact,
      },
    ],
  },
  {
    code: 'BAY_04 // XR_SIM',
    title: 'Simulation, GameDev & XR',
    skills: [
      {
        name: 'Unity 3D',
        tag: 'Physics & XR',
        proof: 'Built Self-Learning Enemy AI arenas, ML-Agents soccer, and VR Planet Explorer.',
        icon: SiUnity,
      },
      {
        name: 'ML-Agents',
        tag: 'PPO / SAC',
        proof: 'Multi-agent reinforcement learning training bridge between Unity C# and PyTorch.',
        icon: SiPytorch,
      },
      {
        name: 'C# / .NET',
        tag: 'Simulation',
        proof: 'Real-time state machines, raycast sensors, and custom orbital physics scripts.',
        icon: SiDotnet,
      },
      {
        name: 'OpenXR & Shaders',
        tag: 'GLSL / HLSL',
        proof: 'Custom procedural shaders and stereo VR rendering at 90Hz.',
        icon: SiUnity,
      },
    ],
  },
  {
    code: 'BAY_05 // 3D_DESIGN',
    title: '3D Graphics & Interface Design',
    skills: [
      {
        name: 'Blender 3D',
        tag: 'Cycles / Eevee',
        proof: 'Hard-surface sci-fi corridors, isometric architectural renders, and low-poly assets.',
        icon: SiBlender,
      },
      {
        name: 'Figma',
        tag: 'Design Systems',
        proof: 'Component token architecture, wireframing, and interactive UI prototyping.',
        icon: SiFigma,
      },
    ],
  },
  {
    code: 'BAY_06 // INFRA_OPS',
    title: 'Systems & DevOps Tooling',
    skills: [
      {
        name: 'Linux',
        tag: 'Ubuntu / Bash',
        proof: 'Daily driver kernel environment for robotics, container builds, and server ops.',
        icon: SiLinux,
      },
      {
        name: 'Docker',
        tag: 'Containers',
        proof: 'Reproducible FastAPI + Next.js deployment containers and local dev stacks.',
        icon: SiDocker,
      },
      {
        name: 'Git & CI',
        tag: 'Version Control',
        proof: 'Automated pytest suites, branch workflows, and multi-service monorepo management.',
        icon: SiGit,
      },
    ],
  },
];

export default function Skills() {
  const [selectedSkill, setSelectedSkill] = useState<SkillItem>(
    SKILL_BAYS[0].skills[0]
  );

  return (
    <Section id="skills">
      <TopRow>
        <div>
          <Eyebrow>CAPABILITY_NODES // VERIFIED STACK</Eyebrow>
          <Heading>Technical Capabilities Matrix</Heading>
        </div>

        <InspectorHUD aria-live="polite">
          <div className="hud-label">
            PROOF_OF_WORK // {selectedSkill.tag.toUpperCase()}
          </div>
          <div className="hud-title">{selectedSkill.name}</div>
          <div className="hud-proof">{selectedSkill.proof}</div>
        </InspectorHUD>
      </TopRow>

      <Grid>
        {SKILL_BAYS.map((bay, idx) => (
          <BayCard
            key={bay.code}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
          >
            <BayHeader>
              <BayTitle>{bay.title}</BayTitle>
              <BayCode>{bay.code}</BayCode>
            </BayHeader>

            <NodesGrid>
              {bay.skills.map((skill) => {
                const Icon = skill.icon;
                const isSelected = selectedSkill.name === skill.name;
                return (
                  <SkillNode
                    key={skill.name}
                    type="button"
                    selected={isSelected}
                    onMouseEnter={() => setSelectedSkill(skill)}
                    onClick={() => setSelectedSkill(skill)}
                  >
                    <Icon />
                    <div className="node-meta">
                      <span className="name">{skill.name}</span>
                      <span className="tag">{skill.tag}</span>
                    </div>
                  </SkillNode>
                );
              })}
            </NodesGrid>
          </BayCard>
        ))}
      </Grid>
    </Section>
  );
}
