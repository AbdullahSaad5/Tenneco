/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three"],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        hostname: "localhost",
        protocol: "http",
      },
      {
        hostname: "tenneco-admin.vercel.app",
        protocol: "https",
      },
      {
        hostname: "images.unsplash.com",
        protocol: "https",
      },
      {
        // S3 bucket for media storage
        hostname: "tenneco-test.s3.eu-central-1.amazonaws.com",
        protocol: "https",
      },
      {
        // Wildcard for any S3 bucket (fallback)
        hostname: "*.s3.*.amazonaws.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
