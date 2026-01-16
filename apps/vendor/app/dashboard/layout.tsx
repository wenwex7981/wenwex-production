import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard Layout',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // In production, check auth here and redirect if not authenticated
    return <>{children}</>;
}
