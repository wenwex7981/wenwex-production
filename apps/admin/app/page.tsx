import { redirect } from 'next/navigation';

export default function AdminHomePage() {
    // Redirect to login page for security
    redirect('/login');
}

