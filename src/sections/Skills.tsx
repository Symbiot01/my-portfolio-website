'use client';

import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import {
  SiPytorch, SiTensorflow, SiScikitlearn, SiOpencv,
  SiArduino, SiRaspberrypi, SiRos,
  SiUnity, SiDotnet,
  SiReact, SiNextdotjs, SiExpress, SiMongodb,
  SiBlender, SiFigma, SiAdobephotoshop, SiAdobecreativecloud,
  SiGit, SiDocker, SiLinux, SiFirebase,
} from 'react-icons/si';

import { IconType } from 'react-icons';

const Section = styled.section`
  padding: 4rem 2rem;
`;

const Title = styled.h2`
  font-size: 4rem;
  margin-bottom: 3rem;
  font-weight: 800;
  background: ${({ theme }) => theme.titleGradient};
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  text-align: center;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;


const Category = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border: 1px solid transparent;
  transition: border 0.3s ease;

  &:hover {
    border: 1px solid ${({ theme }) => theme.accent};
  }
`;


const CatTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.accent};
`;

const SkillsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SkillItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text};
  transition: all 0.2s ease-in-out;

  svg {
    width: 1.5rem;
    height: 1.5rem;
    transition: transform 0.3s, color 0.3s;
  }

  &:hover svg {
    transform: scale(1.2);
    color: ${({ theme }) => theme.accent};
  }

  &:hover {
    font-weight: 600;
  }
`;


type Skill = {
  name: string;
  icon: IconType;
};

type SkillCategory = {
  title: string;
  skills: Skill[];
};

const data: SkillCategory[] = [
  {
    title: 'AI & ML',
    skills: [
      { name: 'PyTorch', icon: SiPytorch },
      { name: 'TensorFlow', icon: SiTensorflow },
      { name: 'scikit-learn', icon: SiScikitlearn },
      { name: 'OpenCV', icon: SiOpencv },
    ],
  },
  {
    title: 'Robotics & Embedded',
    skills: [
      { name: 'Arduino', icon: SiArduino },
      { name: 'Raspberry Pi', icon: SiRaspberrypi },
      { name: 'ROS', icon: SiRos },
      { name: 'Sensors', icon: SiArduino },
    ],
  },
  {
    title: 'GameDev & XR',
    skills: [
      { name: 'Unity', icon: SiUnity },
      { name: 'C#', icon: SiDotnet },
      { name: 'AR Foundation', icon: SiUnity },
      { name: 'ML-Agents', icon: SiPytorch },
    ],
  },  
  {
    title: 'Web Dev',
    skills: [
      { name: 'React', icon: SiReact },
      { name: 'Next.js', icon: SiNextdotjs },
      { name: 'Express', icon: SiExpress },
      { name: 'MongoDB', icon: SiMongodb },
    ],
  },
  {
    title: 'Creative',
    skills: [
      { name: 'Blender', icon: SiBlender },
      { name: 'Figma', icon: SiFigma },
      { name: 'Photoshop', icon: SiAdobephotoshop },
      { name: 'Premiere Pro', icon: SiAdobecreativecloud },
    ],
  },
  {
    title: 'Tools',
    skills: [
      { name: 'Git', icon: SiGit },
      { name: 'Docker', icon: SiDocker },
      { name: 'Linux', icon: SiLinux },
      { name: 'Firebase', icon: SiFirebase },
    ],
  },
];

export default function Skills() {
  return (
    <Section id="skills">
      <Title>Skills Overview</Title>
      <Grid>
        {data.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4, delay: index * 0.1,  stiffness: 100 }}
          >
            <Category key={category.title}>
              <CatTitle>{category.title}</CatTitle>
              <SkillsList>
                {category.skills.map((skill) => (
                  <SkillItem key={skill.name}>
                    <skill.icon />
                    {skill.name}
                  </SkillItem>
                ))}
              </SkillsList>
            </Category>
          </motion.div>
        ))}
      </Grid>
    </Section>
  );
}
