import { logout } from '@/app/services/authService';
import { User } from '@/app/types';
import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { SITE_NAME, SITE_ABBREVIATION } from '@/app/lib/constants';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    user: User;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'journal', label: 'Journal', icon: '📓' },
        { id: 'behavior', label: 'Behavior', icon: '🧠' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    const handleLogout = () => {
        logout();
        onLogout();
    };

    return (
        <aside className="w-64 border-r border-border bg-card/10 backdrop-blur-xl flex flex-col fixed h-full z-50">
            <div className="p-6">
                {/* Logo Section */}
                <div
                    className="flex items-center gap-2 mb-8 cursor-pointer"
                    onClick={() => setActiveTab('dashboard')}
                >
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-primary-foreground">
                        {SITE_ABBREVIATION}
                    </div>
                    <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {SITE_NAME}
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === item.id
                                ? 'bg-accent/20 text-accent border border-accent/30 shadow-lg shadow-accent/10'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                                }`}
                        >
                            <span>{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* User & Logout Section */}
            <div className="mt-auto p-6 border-t border-border space-y-4">
                <ThemeSwitcher />

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white uppercase">
                        {user.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate text-foreground">{user.name}</p>
                        <p className="text-[10px] text-accent uppercase tracking-widest font-bold">Pro Trader</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-border text-muted-foreground text-sm hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all font-medium"
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
