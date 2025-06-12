'use client';

import styled from '@emotion/styled';
import Image from 'next/image';

const Card = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 4rem;
  position: relative;
  border-radius: 16px;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  @media (min-width: 2000px) {
    margin-bottom: 6rem;
  }
`;

const TextContainer = styled.div`
  flex: 1;
  padding: 2rem 2rem 2rem 2rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  @media (min-width: 2000px) {
    padding: 4rem;
  }
`;

const Title = styled.h3`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid ${({ theme }) => theme.accent};
  text-align: right;
  position: relative;
  z-index: 3;
  transform: translate(30%, 0);

  @media (max-width: 768px) {
    transform: none;
    text-align: center;
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 2000px) {
    font-size: 3.5rem;
    margin-bottom: 2rem;
  }
`;

const Stack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  margin-right: 6%;
  justify-content: flex-end;

  span {
    background: ${({ theme }) => theme.accent};
    color: #fff;
    font-size: 0.9rem;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;

    @media (min-width: 2000px) {
      font-size: 1.4rem;
      padding: 0.4rem 1rem;
    }
  }

  @media (max-width: 768px) {
    justify-content: center;
    margin-right: 0;
    font-size: 0.7rem;
  }
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.mutedText};
  max-width: 600px;
  text-align: right;
  margin-left: auto;
  margin-right: 6%;

  @media (max-width: 768px) {
    text-align: center;
    margin: 0 auto;
    font-size: 0.9rem;
  }

  @media (min-width: 2000px) {
    font-size: 1.8rem;
    max-width: 800px;
  }
`;

const ImageWrapper = styled.div`
  flex: 1;
  position: relative;
  height: 500px;
  min-width: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50px);
  z-index: 1;

  @media (max-width: 768px) {
    transform: none;
    width: 100%;
    height: 400px;
  }

  @media (min-width: 2000px) {
    height: 600px;
  }
`;

const StyledImage = styled(Image)`
  border-radius: 0.75rem;
  object-fit: contain;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

const ImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 0.75rem;
  z-index: 1;
`;


type Props = {
  title: string;
  description: string;
  stack: string[];
  image: string;
};

export default function ProjectCard({ title, description, stack, image }: Props) {
  return (
    <Card>
      <TextContainer>
        <Title>{title}</Title>
        <Stack>
          {stack.map((tech, i) => (
            <span key={i}>{tech}</span>
          ))}
        </Stack>
        <Description>{description}</Description>
      </TextContainer>

      <ImageWrapper>
        <StyledImage
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* <ImageOverlay /> */}
      </ImageWrapper>
    </Card>
  );
}
