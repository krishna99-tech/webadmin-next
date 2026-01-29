'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import MainLayout from '@/components/Layout/MainLayout';

export default function ProtectedLayout({ children }) {
    const { currentUser, loading } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !currentUser) {
            router.push('/login');
        }
    }, [currentUser, loading, router]);

    // Optional: Render loading state while checking auth
    if (loading) {
        return (
            <div className="loading-container">
                Loading...
            </div>
        );
    }

    // Determine if we should render children (if logged in)
    // If not logged in, the useEffect will redirect, but we return null to avoid flash
    if (!currentUser) return null;

    return <MainLayout>{children}</MainLayout>;
}
