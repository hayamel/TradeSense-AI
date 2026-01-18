import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from "@/api/base44Client";
import {
    LayoutDashboard,
    TrendingUp,
    Newspaper,
    Users,
    Trophy,
    GraduationCap,
    Settings,
    LogOut,
    Menu,
    X,
    Moon,
    Sun
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('dark');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        loadUserAndTheme();
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const loadUserAndTheme = async () => {
        try {
            const userData = await base44.auth.me();
            setUser(userData);

            const prefs = await base44.entities.UserPreference.filter({ user_email: userData.email });
            if (prefs.length > 0) {
                setTheme(prefs[0].theme || 'dark');
                setSidebarOpen(!prefs[0].sidebar_collapsed);
            }
        } catch (error) {
            console.error('Error loading user:', error);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        if (user) {
            try {
                const prefs = await base44.entities.UserPreference.filter({ user_email: user.email });
                if (prefs.length > 0) {
                    await base44.entities.UserPreference.update(prefs[0].id, { theme: newTheme });
                } else {
                    await base44.entities.UserPreference.create({ user_email: user.email, theme: newTheme });
                }
            } catch (error) {
                console.error('Error saving theme:', error);
            }
        }
    };

    const handleLogout = () => {
        base44.auth.logout();
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: 'Dashboard' },
        { name: 'Trading', icon: TrendingUp, path: 'Dashboard' },
        { name: 'News Hub', icon: Newspaper, path: 'NewsHub' },
        { name: 'Community', icon: Users, path: 'Community' },
        { name: 'Leaderboard', icon: Trophy, path: 'Leaderboard' },
        { name: 'MasterClass', icon: GraduationCap, path: 'MasterClass' },
        { name: 'Settings', icon: Settings, path: 'Settings' }
    ];

    const isActive = (pageName) => currentPageName === pageName;

    // Public pages without sidebar
    const publicPages = ['Home', 'Pricing', 'Checkout'];
    const isPublicPage = publicPages.includes(currentPageName);

    if (!user || isPublicPage) {
        return <div className="min-h-screen bg-background">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
                        TradeSense AI
                    </h1>
                    <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X /> : <Menu />}
                    </Button>
                </div>
            </div>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full bg-card border-r border-border z-40 transition-all duration-300 ${
                sidebarOpen ? 'w-64' : 'w-20'
            } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-border">
                        {sidebarOpen ? (
                            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
                                TradeSense AI
                            </h1>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500" />
                        )}
                    </div>

                    {/* Theme Toggle */}
                    <div className="p-4 border-b border-border">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={toggleTheme}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            {sidebarOpen && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link key={item.name} to={createPageUrl(item.path)}>
                                <Button
                                    variant={isActive(item.path) ? 'secondary' : 'ghost'}
                                    className={`w-full justify-start gap-3 ${
                                        isActive(item.path) ? 'bg-primary/10 text-primary' : ''
                                    }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {sidebarOpen && <span>{item.name}</span>}
                                </Button>
                            </Link>
                        ))}
                    </nav>

                    {/* User & Logout */}
                    <div className="p-4 border-t border-border space-y-2">
                        {sidebarOpen && (
                            <div className="px-3 py-2 text-sm">
                                <div className="font-semibold truncate">{user?.full_name || user?.email}</div>
                                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-5 h-5" />
                            {sidebarOpen && <span>Logout</span>}
                        </Button>
                    </div>

                    {/* Desktop Toggle */}
                    <div className="hidden lg:block p-4 border-t border-border">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu className="w-5 h-5" />
                            {sidebarOpen && <span>Collapse</span>}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-300 lg:pt-0 pt-16 ${
                sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
            }`}>
                {children}
            </main>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </div>
    );
}