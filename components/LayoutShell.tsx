"use client";

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { RootState } from '@/app/store';
import { logout as logoutAction } from '@/app/store/slices/authSlice';
import Sidebar from './Sidebar';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const { user, loading } = useSelector((state: RootState) => state.auth);
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();

    // Mapping current path to active tab
    const getActiveTab = (path: string) => {
        if (path.startsWith('/dashboard')) return 'dashboard';
        if (path.startsWith('/journal')) return 'journal';
        if (path.startsWith('/behavior')) return 'behavior';
        if (path.startsWith('/settings')) return 'settings';
        return 'dashboard';
    };

    const [activeTab, setActiveTab] = useState(getActiveTab(pathname));

    useEffect(() => {
        setActiveTab(getActiveTab(pathname));
    }, [pathname]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (tab === 'dashboard') router.push('/dashboard');
        else if (tab === 'journal') router.push('/journal');
        // Add more routing logic as pages are created
    };

    const handleLogout = () => {
        dispatch(logoutAction());
        router.push('/login');
    };

    // Don't show sidebar on login page or when loading
    const isLoginPage = pathname === '/login';
    const showSidebar = user && !isLoginPage;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
            {showSidebar && (
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={handleTabChange}
                    user={user}
                    onLogout={handleLogout}
                />
            )}
            <main className={`flex-1 overflow-y-auto ${showSidebar ? 'ml-64' : ''}`}>
                <div className={showSidebar ? 'p-8 max-w-7xl mx-auto' : ''}>
                    {children}
                </div>
            </main>
        </div>
    );
}
