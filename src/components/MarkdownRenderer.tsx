// src/components/MarkdownRenderer.tsx
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // --- THIS IS THE FIX ---
        // We add `ref` to the destructured props here to capture and ignore it.
        code({ node, className, children, ref, ...props }) {
        // --- END OF FIX ---
          const match = /language-(\w+)/.exec(className || '');
          return match ? (
            <SyntaxHighlighter
              style={oneDark as any}
              language={match[1]}
              PreTag="div"
              // The `...props` being spread here no longer contain the problematic `ref`.
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
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