import { Html, Head, Main, NextScript } from 'next/document';

// Minimal custom Document to satisfy Next.js build-time checks in some environments.
// (Does not affect App Router rendering under `src/app/*`.)
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}


