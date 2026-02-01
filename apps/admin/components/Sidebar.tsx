'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Users, Building2, Package, FolderKanban, Play,
    CreditCard, Globe, BarChart3, Settings, Shield, X, MessageSquare, Database, Palette, Image, FileText, Mail, Newspaper
} from 'lucide-react';

const sidebarLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/access-control', label: 'Access Control', icon: Shield },
    { href: '/admin/vendors', label: 'Vendors', icon: Building2 },
    { href: '/admin/services', label: 'Services', icon: Package },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/team', label: 'Team Management', icon: Users },
    { href: '/admin/categories', label: 'Categories', icon: FolderKanban },
    { href: '/admin/homepage', label: 'Homepage', icon: Globe },
    { href: '/admin/carousels', label: 'Carousels', icon: Image },
    { href: '/admin/content', label: 'Content', icon: Palette },
    { href: '/admin/pages', label: 'Pages', icon: FileText },
    { href: '/admin/contacts', label: 'Contacts', icon: Mail },
    { href: '/admin/shorts', label: 'Shorts', icon: Play },
    { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { href: '/admin/feed', label: 'Feed & Community', icon: Newspaper },
    { href: '/admin/fields', label: 'Dynamic Fields', icon: Database },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const pathname = usePathname();

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-200 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-white text-sm uppercase tracking-tight">WENVEX</span>
                            <span className="text-[10px] text-gray-500 font-bold block -mt-1 uppercase">Super Admin</span>
                        </div>
                    </Link>
                    <button onClick={onClose} className="lg:hidden text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }`}
                                onClick={() => {
                                    if (window.innerWidth < 1024) onClose();
                                }}
                            >
                                <link.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-400' : 'text-gray-500'}`} />
                                <span className="font-medium text-sm">{link.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Component if needed */}
            </div>
        </aside>
    );
}
