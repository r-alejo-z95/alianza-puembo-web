/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gxziassnnbwnbzfrzcnx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/event-posters/**',
      },
      {
        protocol: 'https',
        hostname: 'gxziassnnbwnbzfrzcnx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/public-images/**',
      },
    ],
  },
};

export default nextConfig;
