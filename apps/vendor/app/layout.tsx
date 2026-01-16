import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

export const metadata: Metadata = {
    title: 'Vendor Dashboard | WENWEX',
    description: 'Manage your services and grow your business on WENWEX.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body className="font-sans">
                <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1f2937', color: '#fff', borderRadius: '12px' } }} />
                {children}
            </body>
        </html>
    );
}
