import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

export const metadata: Metadata = {
    title: { default: 'Super Admin | WENWEX', template: '%s | WENWEX Admin' },
    description: 'WENWEX Platform Administration Panel - Manage vendors, services, and platform content.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`}>
            <body className="font-sans">
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: { background: '#1f2937', color: '#fff', borderRadius: '12px', border: '1px solid #374151' }
                    }}
                />
                <AdminAuthGuard>
                    {children}
                </AdminAuthGuard>
            </body>
        </html>
    );
}

