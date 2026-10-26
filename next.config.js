/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compiler: {
    emotion: true,
  },
};

module.exports = nextConfig;