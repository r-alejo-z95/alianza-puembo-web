/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  reactStrictMode: true,
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
      {
        protocol: 'https',
        hostname: 'gxziassnnbwnbzfrzcnx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/form-images/**',
      },
    ],
  },
};

export default nextConfig;
