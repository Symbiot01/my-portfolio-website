/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const target = process.env.NEXT_PUBLIC_API_URL;
    if (!target) return [];
    const sanitized = target.replace(/\/$/, '');
    return [
      // Proxy backend API through Next to avoid browser CORS in development/production.
      // Client requests hit same-origin `/api/*`, Next forwards to the backend.
      {
        source: '/api/:path*',
        destination: `${sanitized}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;