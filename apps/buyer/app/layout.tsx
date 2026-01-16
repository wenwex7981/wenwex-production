import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';

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
    description: 'Where verified agencies and academic service providers sell services as structured products. Find IT services, mobile apps, web development, AI solutions, and academic assistance.',
    keywords: ['tech services', 'web development', 'mobile apps', 'academic projects', 'IT solutions', 'freelance agencies', 'software development'],
    authors: [{ name: 'Project Genie Tech Solutions' }],
    creator: 'WENWEX',
    publisher: 'Project Genie Tech Solutions',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://wenwex.online'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://wenwex.online',
        siteName: 'WENWEX',
        title: 'WENWEX - Global Tech-Commerce Marketplace',
        description: 'Find verified agencies for IT services, web development, mobile apps, and academic projects.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'WENWEX - Tech-Commerce Marketplace',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'WENWEX - Global Tech-Commerce Marketplace',
        description: 'Find verified agencies for IT services and academic projects.',
        images: ['/og-image.png'],
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
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`scroll-smooth ${inter.variable} ${outfit.variable}`}>
            <body className="min-h-screen flex flex-col antialiased font-sans">
                <AuthProvider>
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

                    {/* Navigation */}
                    <Navbar />

                    {/* Main content */}
                    <main className="flex-1">
                        {children}
                    </main>

                    {/* Footer */}
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    );
}
