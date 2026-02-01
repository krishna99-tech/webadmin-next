'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { IoTProvider } from '@/context/IoTContext';
import MainLayout from '@/components/Layout/MainLayout';

export default function ProtectedLayout({ children }) {
    const { currentUser, loading } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !currentUser) {
            router.push('/login');
        }
    }, [currentUser, loading, router]);

    if (loading) {
        return (
            <div className="loading-container flex min-h-screen items-center justify-center bg-[var(--bg-dark)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-dim text-sm">Loading IoT Console...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) return null;

    const isAdmin = currentUser?.is_admin ?? currentUser?.role === 'Admin';

    return (
        <IoTProvider isAdmin={isAdmin}>
            <MainLayout>{children}</MainLayout>
        </IoTProvider>
    );
}
