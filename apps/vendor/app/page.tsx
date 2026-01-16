import { redirect } from 'next/navigation';

export default function VendorHomePage() {
    // Redirect to dashboard - in production, check auth first
    redirect('/dashboard');
}
