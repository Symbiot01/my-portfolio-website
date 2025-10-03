// File: src/sections/About.tsx
// Description: About section with code-style biography and education details.
'use client';
import styled from '@emotion/styled';

declare module '@emotion/react' {
  export interface Theme {
    cardBg: string;
    mutedText: string;
    titleGradient: string;
    primary: string;
    accent: string;
    text: string;
    toggleBg: string;
    background: string;

  }
}
const Section = styled.section`
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.surface};
`;

const CodeContainer = styled.div`
  display: flex;
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  overflow: hidden;
  font-family: 'Fira Code', monospace;
  font-size: 0.95rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  color: ${({ theme }) => theme.text};
`;

const LineNumbers = styled.pre`
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.mutedText};
  padding: 1.5rem 1rem;
  text-align: right;
  user-select: none;
`;

const CodeBlock = styled.pre`
  padding: 1.5rem 1rem;
  overflow-x: auto;
  white-space: pre;
`;

const Title = styled.h2`
  font-size: 6rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  margin-left: 4rem;
  background: ${({ theme }) => theme.titleGradient};
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;

  @media (max-width: 1024px) {
    font-size: 3.5rem;
    margin-left: 2rem;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-left: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
    margin-left: 0.5rem;
  }
`;

export default function About() {
  const codeLines = [
    '// Bridging AI, Robotics, and Creative Technology',
    '',
    'class SahilPatel {',
    '  constructor() {',
    '    this.name = "Sahil Patel";',
    '    this.basedIn = "India";',
    '    this.email = "sahil9439patel@gmail.com";',
    '    this.interests = ["AI", "GameDev", "Computer Vision", "Creative Coding"];',
    '  }',
    '',
    '  education() {',
    '    return [',
    '      { "2022-2027": "B.Tech + M. Tech — Ocean Engineering and Naval Architecture" },',
    '      { "2021-2022": "Springer Public School" },',
    '      { "2019-2020": "Kendriya Vidyalya" },',
    '      { "Certifications and Coursework": [',
    '          "Deep Learning Specialization",',
    '          "Machine Learning Foundations and Application",',
    '          "AI/ML in Robot Autonomy",',
    '          "Probability and Statistics",',
    '          "Programming and Data Structures",',
    '          "Algorithms",',
    '          "Computer Graphics",',
    '          "Computer Organisation and Architecture",',
    '          "File Organization and Database Management Systems",',
    '          "Optimization Techniques",',
    '          "Intro to Cloud Computing"',
    '        ]',
    '      }',
    '    ];',
    '  }',
    '',
    '  skills() {',
    '    return [',
    '      "Python", "PyTorch", "TensorFlow", "OpenCV", "ROS",',
    '      "GLSL", "OpenGL", "C", "C#", "CSS",',
    '      "Unity", "ML-Agents", "AR Foundation", "Shader Programming",',
    '      "OpenXR","React", "Next.js", "MongoDB",',
    '      "Figma", "Blender", "Photoshop", "Premiere Pro",',
    '      "Git", "Docker", "Firebase", "Linux",',
    '      "NumPy", "Pandas", "Matplotlib", "Scikit-learn", "Keras"',
    '    ];',
    '  }',
    '',
    '  hobbies() {',
    '    return ["Football", "Drawing", "3D Art", "Design", "Tech Experiments", "Mountain Biking"];',
    '  }',
    '}',
  ];

  return (
    <Section id="about">
      <Title>About Me</Title>
      <CodeContainer>
        <LineNumbers>
          {codeLines.map((_, i) => String(i + 1).padStart(2, ' ') + '\n')}
        </LineNumbers>
        <CodeBlock>
          {codeLines.join('\n')}
        </CodeBlock>
      </CodeContainer>
    </Section>
  );
}
