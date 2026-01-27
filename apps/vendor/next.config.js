/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**.supabase.co' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'ui-avatars.com' },
        ],
    },
    env: {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    }
};
module.exports = nextConfig;
