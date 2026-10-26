// File: src/sections/home/Contact.tsx
// Description: Deep Space Observatory Transmission & Contact section with copyable cURL snippet, direct channels, and interactive mini-CLI bar.
'use client';

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const Section = styled.footer`
  max-width: 1320px;
  margin: 0 auto;
  padding: 4.5rem 1.5rem 2.5rem;

  @media (max-width: 768px) {
    padding: 3rem 1rem 2rem;
  }
`;

const ContactBento = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 1.5rem;
  margin-bottom: 1.75rem;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  background: ${({ theme }) => `${theme.cardBg}d9`};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 12px 32px ${({ theme }) => theme.shadow};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.4rem;
`;

const Eyebrow = styled.span`
  font-family: var(--font-mono), monospace;
  font-size: 0.74rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.accent};
`;

const Title = styled.h2`
  font-family: var(--font-display), 'Space Grotesk', sans-serif;
  font-size: clamp(1.75rem, 3vw, 2.35rem);
  font-weight: 700;
  color: ${({ theme }) => theme.headingText};
  margin-top: 0.3rem;
`;

const Subtext = styled.p`
  font-size: 0.94rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.mutedText};
`;

const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const ChannelCard = styled.a`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.toggleBg};
  transition: border-color 0.16s ease, transform 0.16s ease;

  span.lbl {
    font-family: var(--font-mono), monospace;
    font-size: 0.68rem;
    color: ${({ theme }) => theme.mutedText};
    text-transform: uppercase;
  }

  span.val {
    font-size: 0.88rem;
    font-weight: 600;
    color: ${({ theme }) => theme.headingText};
    word-break: break-all;
  }

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    transform: translateY(-2px);
  }
`;

const CurlBox = styled.div`
  background: #080c17;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  overflow: hidden;
`;

const CurlHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.9rem;
  background: #0e1526;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  font-family: var(--font-mono), monospace;
  font-size: 0.7rem;
  color: #94a3b8;
`;

const CopyBtn = styled.button`
  font-family: var(--font-mono), monospace;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.22rem 0.55rem;
  border-radius: 5px;
  border: 1px solid rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.14);
  color: #7dd3fc;
  cursor: pointer;
`;

const CurlPre = styled.pre`
  margin: 0;
  padding: 0.95rem 1rem;
  font-family: var(--font-mono), monospace;
  font-size: 0.74rem;
  line-height: 1.55;
  color: #cbd5e1;
  overflow-x: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  label {
    font-family: var(--font-mono), monospace;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${({ theme }) => theme.mutedText};
  }

  input,
  textarea {
    padding: 0.68rem 0.85rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.toggleBg};
    color: ${({ theme }) => theme.text};
    font-family: var(--font-sans), sans-serif;
    font-size: 0.88rem;
    outline: none;

    &:focus {
      border-color: ${({ theme }) => theme.primary};
    }
  }
`;

const SubmitBtn = styled.button`
  padding: 0.75rem 1.25rem;
  border-radius: 9px;
  border: none;
  background: ${({ theme }) => theme.gradient};
  color: #ffffff;
  font-family: var(--font-mono), monospace;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  transition: opacity 0.16s ease;

  &:hover {
    opacity: 0.92;
  }
`;

const CliFooterBar = styled.div`
  background: #080c17;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 0.7rem 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-family: var(--font-mono), monospace;
  font-size: 0.76rem;
  color: #cbd5e1;
`;

const CliInputWrap = styled.form`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 240px;

  span.prompt {
    color: #38bdf8;
    font-weight: 700;
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #f8fafc;
    font-family: var(--font-mono), monospace;
    font-size: 0.78rem;
  }
`;

const CURL_SNIPPET = `curl -X POST https://sahilpatel.dev/api/ping \\
  -H "Content-Type: application/json" \\
  -d '{"sender": "recruiter_or_collaborator", "role": "AI_Robotics_Systems", "email": "patelsahil2k03@gmail.com"}'`;

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [cliInput, setCliInput] = useState('');
  const [cliOutput, setCliOutput] = useState(
    'Type "help", "tripsync", "wishlist", "resume", or "theme" and press Enter.'
  );
  const router = useRouter();
  const { toggleTheme } = useTheme();

  const handleCopyCurl = () => {
    navigator.clipboard?.writeText(CURL_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleMailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `[Observatory Transmission] From ${senderName || 'Collaborator'}`
    );
    const body = encodeURIComponent(
      `Name: ${senderName}\nEmail: ${senderEmail}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:patelsahil2k03@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cliInput.trim().toLowerCase();
    setCliInput('');
    if (!cmd) return;

    if (cmd === 'help') {
      setCliOutput(
        'Available commands: tripsync | wishlist | blog | resume | theme | clear'
      );
    } else if (cmd === 'tripsync') {
      setCliOutput('Launching /tripsync workspace...');
      router.push('/tripsync');
    } else if (cmd === 'wishlist') {
      setCliOutput('Launching /wishlist registry...');
      router.push('/wishlist');
    } else if (cmd === 'blog') {
      setCliOutput('Navigating to /blog...');
      router.push('/blog');
    } else if (cmd === 'resume' || cmd === 'cv') {
      setCliOutput('Opening Sahil_Patel_Resume.pdf...');
      window.open('/Sahil_Patel_Resume.pdf', '_blank', 'noopener,noreferrer');
    } else if (cmd === 'theme') {
      toggleTheme();
      setCliOutput('Toggled Observatory color mode.');
    } else if (cmd === 'clear') {
      setCliOutput('Ready.');
    } else {
      setCliOutput(`Unknown command "${cmd}". Try: help, tripsync, wishlist, resume, theme`);
    }
  };

  return (
    <Section id="contact">
      <ContactBento>
        <Panel>
          <div>
            <Eyebrow>UPLINK_CHANNEL // DIRECT TRANSMISSION</Eyebrow>
            <Title>Initiate Collaboration</Title>
            <Subtext style={{ marginTop: '0.45rem' }}>
              Available for AI/ML, Autonomous Robotics, Computer Vision, and Full-Stack
              Systems Engineering opportunities, research internships, and technical
              collaborations.
            </Subtext>
          </div>

          <ChannelGrid>
            <ChannelCard href="mailto:patelsahil2k03@gmail.com">
              <span className="lbl">Primary Email</span>
              <span className="val">patelsahil2k03@gmail.com</span>
            </ChannelCard>
            <ChannelCard
              href="https://github.com/Symbiot01"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="lbl">GitHub Repository</span>
              <span className="val">github.com/Symbiot01 ↗</span>
            </ChannelCard>
            <ChannelCard
              href="https://www.linkedin.com/in/sahil-patel-21b30a255/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="lbl">LinkedIn Network</span>
              <span className="val">in/sahil-patel-21b30a255 ↗</span>
            </ChannelCard>
            <ChannelCard
              href="/Sahil_Patel_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="lbl">Curriculum Vitae</span>
              <span className="val">Sahil_Patel_Resume.pdf ↓</span>
            </ChannelCard>
          </ChannelGrid>

          <CurlBox>
            <CurlHeader>
              <span>TERMINAL_PING // cURL HANDSHAKE</span>
              <CopyBtn type="button" onClick={handleCopyCurl}>
                {copied ? '✓ Copied' : 'Copy cURL'}
              </CopyBtn>
            </CurlHeader>
            <CurlPre>{CURL_SNIPPET}</CurlPre>
          </CurlBox>
        </Panel>

        <Panel>
          <div>
            <Eyebrow>DISPATCH_PAYLOAD // DIRECT MESSAGE</Eyebrow>
            <Title>Send Transmission</Title>
            <Subtext style={{ marginTop: '0.4rem' }}>
              Compose a direct message below to open a pre-addressed transmission to Sahil.
            </Subtext>
          </div>

          <Form onSubmit={handleMailSubmit}>
            <InputRow>
              <Field>
                <label htmlFor="contact-name">Sender Identifier</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="Alex Mercer / Acme Robotics"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
              </Field>
              <Field>
                <label htmlFor="contact-email">Return Address (Email)</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                />
              </Field>
            </InputRow>

            <Field>
              <label htmlFor="contact-msg">Transmission Payload</label>
              <textarea
                id="contact-msg"
                rows={4}
                required
                placeholder="Tell me about the role, research problem, or system you are building..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>

            <SubmitBtn type="submit">Transmit Message →</SubmitBtn>
          </Form>
        </Panel>
      </ContactBento>

      <CliFooterBar>
        <CliInputWrap onSubmit={handleCliSubmit}>
          <span className="prompt">guest@observatory:~$</span>
          <input
            type="text"
            value={cliInput}
            onChange={(e) => setCliInput(e.target.value)}
            placeholder="type 'help', 'tripsync', 'wishlist', 'resume'..."
            aria-label="Interactive footer terminal"
          />
        </CliInputWrap>
        <span style={{ color: '#94a3b8' }}>{cliOutput}</span>
      </CliFooterBar>
    </Section>
  );
}
