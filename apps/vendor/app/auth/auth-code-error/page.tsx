'use client';

import Link from 'next/link';

export default function AuthError() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
            <p className="text-gray-600 mb-8">There was an error signing you in. Please try again.</p>
            <Link
                href="/auth/login"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
                Return to Login
            </Link>
        </div>
    );
}
