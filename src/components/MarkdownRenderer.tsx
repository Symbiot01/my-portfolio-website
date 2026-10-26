// File: src/components/MarkdownRenderer.tsx
// Description: Markdown and raw HTML renderer with syntax highlighting and one-click code copy buttons.
'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styled from '@emotion/styled';

const CodeBlockWrap = styled.div`
  position: relative;
  margin: 1.25rem 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
`;

const CodeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.85rem;
  background: #0d1324;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  font-family: var(--font-mono), monospace;
  font-size: 0.7rem;
  color: #94a3b8;
`;

const CopyCodeBtn = styled.button`
  font-family: var(--font-mono), monospace;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.18rem 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(56, 189, 248, 0.35);
  background: rgba(56, 189, 248, 0.12);
  color: #7dd3fc;
  cursor: pointer;
`;

function HighlightedBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <CodeBlockWrap>
      <CodeHeader>
        <span>{language.toUpperCase()}</span>
        <CopyCodeBtn type="button" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </CopyCodeBtn>
      </CodeHeader>
      <SyntaxHighlighter
        style={oneDark as any}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0 }}
      >
        {code}
      </SyntaxHighlighter>
    </CodeBlockWrap>
  );
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, className, children, ref, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          return match ? (
            <HighlightedBlock language={match[1]} code={codeString} />
          ) : (
            <code
              className={className}
              style={{
                fontFamily: 'var(--font-mono), monospace',
                padding: '0.15rem 0.38rem',
                borderRadius: '4px',
                fontSize: '0.86em',
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
