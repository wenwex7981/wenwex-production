import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { NotificationProvider } from '@/components/providers/NotificationProvider';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'WENWEX - Global Tech-Commerce Marketplace',
        template: '%s | WENWEX',
    },
    description: 'WENWEX is the global marketplace where verified agencies and academic service providers sell technology services as structured products. Find IT services, mobile apps, web development, AI solutions, and academic assistance.',
    keywords: ['WENWEX', 'tech marketplace', 'tech services', 'web development', 'mobile apps', 'academic projects', 'IT solutions', 'freelance agencies', 'software development', 'verified agencies'],
    authors: [{ name: 'WENWEX' }],
    creator: 'WENWEX',
    publisher: 'WENWEX',
    applicationName: 'WENWEX',
    metadataBase: new URL('https://www.wenwex.online'),
    alternates: {
        canonical: 'https://www.wenwex.online',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://www.wenwex.online',
        siteName: 'WENWEX',
        title: 'WENWEX - Global Tech-Commerce Marketplace',
        description: 'The marketplace where verified agencies sell technology services as products. Find IT services, web development, mobile apps, and academic projects.',
        images: [
            {
                url: 'https://www.wenwex.online/og-image.png',
                width: 1200,
                height: 630,
                alt: 'WENWEX - Global Tech-Commerce Marketplace',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'WENWEX - Global Tech-Commerce Marketplace',
        description: 'The marketplace where verified agencies sell technology services as products.',
        images: ['https://www.wenwex.online/og-image.png'],
        creator: '@wenwex',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        ],
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    verification: {
        google: 'google1ae5efd42fa3b678',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`scroll-smooth ${inter.variable} ${outfit.variable}`}>
            <GoogleAnalytics />
            <body className="min-h-screen flex flex-col antialiased font-sans">
                <AuthProvider>
                    <NotificationProvider>
                        {/* Toast notifications */}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#1f2937',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    padding: '16px',
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#22c55e',
                                        secondary: '#fff',
                                    },
                                },
                                error: {
                                    iconTheme: {
                                        primary: '#ef4444',
                                        secondary: '#fff',
                                    },
                                },
                            }}
                        />

                        {/* Navigation - wrapped in Suspense for useSearchParams */}
                        <Suspense fallback={<div className="h-16 lg:h-20 bg-white border-b border-gray-100" />}>
                            <Navbar />
                        </Suspense>

                        {/* Main content */}
                        <main className="flex-1">
                            {children}
                        </main>

                        {/* Footer */}
                        <Footer />
                    </NotificationProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
