// File: src/components/ProjectCard.tsx
// Description: Deep Space Observatory engineering bento card with telemetry header, image preview, tech chips, and expandable architecture specs drawer.
'use client';

import React, { useState } from 'react';
import styled from '@emotion/styled';
import Image from 'next/image';
import Link from 'next/link';

export interface ProjectItem {
  id: string;
  codeId: string;
  title: string;
  category: string;
  status: string;
  description: string;
  stack: string[];
  image: string;
  architecture: string[];
  metrics: string;
  liveHref?: string;
  repoHref?: string;
}

const CardOuter = styled.article`
  background: ${({ theme }) => `${theme.cardBg}e6`};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 8px 24px ${({ theme }) => theme.shadow};
  height: 100%;

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ theme }) => `${theme.primary}88`};
  }

  &:hover .project-card-media-img {
    transform: scale(1.03);
  }
`;

const TelemetryBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1rem;
  background: ${({ theme }) => theme.toggleBg};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  font-family: var(--font-mono), monospace;
  font-size: 0.7rem;
`;

const CodeTag = styled.span`
  color: ${({ theme }) => theme.accent};
  font-weight: 700;
  letter-spacing: 0.05em;
`;

const StatusPill = styled.span`
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: ${({ theme }) => `${theme.primary}1a`};
  border: 1px solid ${({ theme }) => `${theme.primary}44`};
  color: ${({ theme }) => theme.headingText};
  font-weight: 600;
`;

const MediaFrame = styled.div`
  position: relative;
  width: 100%;
  height: 195px;
  background: #080c17;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  overflow: hidden;
`;

const StyledImage = styled(Image)`
  object-fit: cover;
  transition: transform 0.35s ease;
`;

const MetricOverlay = styled.span`
  position: absolute;
  bottom: 0.6rem;
  right: 0.6rem;
  padding: 0.24rem 0.55rem;
  border-radius: 6px;
  background: rgba(7, 10, 20, 0.82);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #e2e8f0;
  font-family: var(--font-mono), monospace;
  font-size: 0.68rem;
  font-weight: 600;
`;

const Body = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  flex: 1;
`;

const Title = styled.h3`
  font-family: var(--font-display), 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.headingText};
  line-height: 1.28;
`;

const Description = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.mutedText};
`;

const StackRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.38rem;
  margin-top: auto;
`;

const TechChip = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.7rem;
  padding: 0.22rem 0.52rem;
  border-radius: 5px;
  background: ${({ theme }) => theme.toggleBg};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const SpecsDrawer = styled.div`
  margin-top: 0.5rem;
  padding: 0.75rem 0.85rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.toggleBg};
  border: 1px solid ${({ theme }) => theme.border};
  font-family: var(--font-mono), monospace;
  font-size: 0.73rem;
  color: ${({ theme }) => theme.text};

  ul {
    margin: 0.35rem 0 0;
    padding-left: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: ${({ theme }) => theme.mutedText};
  }
`;

const CardFooter = styled.div`
  padding: 0.75rem 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const SpecToggleBtn = styled.button`
  font-family: var(--font-mono), monospace;
  font-size: 0.74rem;
  font-weight: 600;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.accent};
  cursor: pointer;
  padding: 0.2rem 0;

  &:hover {
    text-decoration: underline;
  }
`;

const LinksGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionLink = styled(Link)`
  font-family: var(--font-mono), monospace;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.32rem 0.68rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.toggleBg};
  color: ${({ theme }) => theme.headingText};
  transition: border-color 0.16s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

export default function ProjectCard({ project }: { project: ProjectItem }) {
  const [specsOpen, setSpecsOpen] = useState(false);

  return (
    <CardOuter>
      <div>
        <TelemetryBar>
          <CodeTag>{project.codeId}</CodeTag>
          <StatusPill>{project.status}</StatusPill>
        </TelemetryBar>

        <MediaFrame>
          <StyledImage
            className="project-card-media-img"
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <MetricOverlay>{project.metrics}</MetricOverlay>
        </MediaFrame>
      </div>

      <Body>
        <Title>{project.title}</Title>
        <Description>{project.description}</Description>

        <StackRow>
          {project.stack.map((tech) => (
            <TechChip key={tech}>{tech}</TechChip>
          ))}
        </StackRow>

        {specsOpen && (
          <SpecsDrawer>
            <strong>ARCHITECTURE_NOTES //</strong>
            <ul>
              {project.architecture.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </SpecsDrawer>
        )}
      </Body>

      <CardFooter>
        <SpecToggleBtn
          type="button"
          onClick={() => setSpecsOpen((v) => !v)}
          aria-expanded={specsOpen}
        >
          {specsOpen ? '[-] Hide Specs' : '[+] System Specs'}
        </SpecToggleBtn>

        <LinksGroup>
          {project.repoHref && (
            <ActionLink href={project.repoHref} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </ActionLink>
          )}
          {project.liveHref && (
            <ActionLink href={project.liveHref}>
              {project.liveHref.startsWith('/') ? 'Launch App →' : 'Live Demo ↗'}
            </ActionLink>
          )}
        </LinksGroup>
      </CardFooter>
    </CardOuter>
  );
}
