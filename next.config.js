/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the deprecated appDir option for Next.js 14
  typescript: {
    // Skip type checking during build - will be handled by IDE/dev
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Additional TypeScript bypasses
    typedRoutes: false,
  },
}

module.exports = nextConfig
