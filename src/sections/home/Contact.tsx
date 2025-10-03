// File: src/sections/Contact.tsx
// Description: Contact section with links for email, social, and resume download.
'use client';
import styled from '@emotion/styled';
import Image from 'next/image';

const Section = styled.section`
  padding: 4rem 2rem;
`;

const ContactWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  align-items: flex-start;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Left = styled.div`
  flex: 1;
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled(Image)`
  border-radius: 50%;
  width: 48px;
  height: 48px;
`;

const Title = styled.h2`
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  margin-left: 4rem;
  background: ${({ theme }) => theme.titleGradient};
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;

  @media (max-width: 1024px) {
    font-size: 2.5rem;
    margin-left: 2rem;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-left: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 1.6rem;
    margin-left: 0.5rem;
  }
`;


const Badge = styled.span`
  font-size: 0.85rem;
  font-style: italic;
  color: ${({ theme }) => theme.mutedText};
  opacity: 0.7;
  margin-bottom: 0.8rem;
  display: inline-block;
`;

const ContactList = styled.ul`
  list-style: none;
  padding: 0;

  li {
    margin-bottom: 0.8rem;

    a {
      text-decoration: none;
      color: ${({ theme }) => theme.text};
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.7;
      }
    }
  }
`;

const ResumeBox = styled.a`
  margin-top: 1rem;
  padding: 0.75rem 1.2rem;
  border: 2px solid ${({ theme }) => theme.primary};
  border-radius: 8px;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.primary};
    color: #fff;
  }
`;

export default function Contact() {
  return (
    <Section id="contact">
      <ContactWrapper>
        <Left>
          <TitleRow>
            <Avatar
              src="/avatar.gif"
              alt="Avatar"
              width={48}
              height={48}
            />
            <Title>Contact</Title>
          </TitleRow>

          <Badge>💬 Available for freelance/collab</Badge>

          <ContactList>
            <li>
              📧 <a href="mailto:sahil9439patel@gmail.com">sahil9439patel@gmail.com</a>
            </li>
            <li>
              💼 <a href="https://www.linkedin.com/in/sahil-patel-21b30a255/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </li>
            <li>
              💻 <a href="https://github.com/Symbiot01" target="_blank" rel="noopener noreferrer">GitHub</a>
            </li>
            <li>
              🧠 <a href="https://yourportfolio.com" target="_blank" rel="noopener noreferrer">Portfolio</a>
            </li>
            <li>
              🎮 <a href="https://discordapp.com/users/yourid" target="_blank" rel="noopener noreferrer">Discord</a>
            </li>
          </ContactList>
        </Left>

        <Right>
          <Badge>🎯 Open to Internship Opportunities</Badge>
          <ResumeBox href="/resume.pdf" download>
            📄 Download Resume
          </ResumeBox>
        </Right>
      </ContactWrapper>
    </Section>
  );
}
