import { redirect } from 'next/navigation';

export default function AdminHomePage() {
    // Redirect to admin dashboard - in production, check auth first
    redirect('/admin');
}
