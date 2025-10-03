// File: src/sections/Hero.tsx
// Description: Hero section with animated title, roles, and image slider.
'use client';

import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'react-slick';
import Image from 'next/image';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ScrollCue from '@/components/ScrollCue';
import { useEffect, useState } from 'react';

declare module '@emotion/react' {
  export interface Theme {
    cardBg: string;
    mutedText: string;
    titleGradient: string;
    primary: string;
    accent: string;
    text: string;
  }
}

const HeroContainer = styled.section`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  min-height: 90vh;
  gap: 3rem;
  margin-bottom: 10rem;

  @media (min-width: 2000px) {
    padding: 6rem 2rem;
    gap: 4rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Left = styled.div`
  flex: 1;
  min-width: 40%;
  margin-bottom: 4rem;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const Intro = styled.p`
  font-size: 1.2rem;

  color: ${({ theme }) => theme.mutedText};
  margin-bottom: 0.5rem;
  margin-left: 4rem;

  @media (min-width: 2000px) {
    font-size: 1.75rem;
  }
`;

const Title = styled.h1`
  font-size: 5rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  margin-left: 4rem;
  background: ${({ theme }) => theme.titleGradient};
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;

  @media (min-width: 2000px) {
    font-size: 7rem;
  }
`;

const AnimatedTitle = styled(Title)`
  animation: pulseText 3s infinite ease-in-out;

  @keyframes pulseText {
    0% { filter: brightness(1); }
    50% { filter: brightness(1.3); }
    100% { filter: brightness(1); }
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 2rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  min-height: 3rem;
  margin-left: 4rem;

  @media (min-width: 2000px) {
    font-size: 4rem;
  }
`;

const CTAButton = styled.a`
  display: inline-block;
  margin-top: 2rem;
  margin-left: 5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 999px;
  background: ${({ theme }) => theme.primary};
  color: white;
  text-decoration: none;
  transition: background 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.accent};
  }
`;

const Right = styled.div`
  flex: 1;
  min-width: 40%;
  max-width: 100%;
  min-height: 360px;
  margin-bottom: 4rem;

  .slick-slide {
    display: flex !important;
    justify-content: center;
  }

  img {
    width: 80%;
    height: auto;
  }

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const ImageCaption = styled.p`
  text-align: center;
  margin-top: 0.5rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.mutedText};
`;

const roles = [
  'ML/DL Engineer',
  'Developer',
  'Graphic Programmer',
  'AR/VR Developer',
  'Robotics Enthusiast',
  'Computer Vision Architect',
  'IoT Hacker',
  'Creative Technologist',
];

const images = [
  '/hero/Project1.jpg',
  '/hero/Project2.jpg',
  '/hero/Project3.jpg',
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const sliderSettings = {
    infinite: true,
    autoplay: true,
    speed: 1000,
    slidesToShow: 1,
    arrows: false,
    autoplaySpeed: 2000,
    pauseOnHover: false,
  };

  return (
    <HeroContainer id="hero">
      <ScrollCue />
      <Left>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Intro>Welcome to my portfolio</Intro>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <AnimatedTitle>Hi, I&apos;m Sahil Patel</AnimatedTitle>
          <AnimatePresence mode="wait">
            <Subtitle
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
            >
              {roles[index]}
            </Subtitle>
          </AnimatePresence>
        </motion.div>
        <CTAButton href="#projects">View My Work</CTAButton>
      </Left>

      <Right>
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ rotateY: 10, rotateX: 7 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <Slider {...sliderSettings}>
              {images.map((src, idx) => (
                <div key={idx} style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image
                    src={src}
                    alt={`work-${idx}`}
                    layout="responsive"
                    width={4}
                    height={3}
                    style={{ objectFit: 'contain' }}
                    priority
                  />
                  <ImageCaption>Project {idx + 1}</ImageCaption>
                </div>
              ))}
            </Slider>
          </motion.div>
        )}
      </Right>
    </HeroContainer>
  );
}
