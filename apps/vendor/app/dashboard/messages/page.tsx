
'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/supabase';
import { fetchConversations, Conversation } from '@/lib/chat-service';
import { ChatWindow } from '@/components/ui/ChatWindow';
import { MessageSquare, User, Loader2, Menu, X, Bell } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function VendorMessagesPage() {
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const { data: { user } } = await getCurrentUser();
                if (!user) return;
                setUser(user);

                // For vendors, role is VENDOR. We need to fetch user metadata if available or just pass 'VENDOR'
                const data = await fetchConversations(user.id, 'VENDOR');
                setConversations(data || []);
            } catch (error) {
                console.error('Error loading conversations:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    // Helper for sidebar links (copied from dashboard page for consistency)
    const sidebarLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: MessageSquare }, // Changed for now
        { href: '/dashboard/services', label: 'My Services', icon: MessageSquare },
        { href: '/dashboard/portfolio', label: 'Portfolio', icon: MessageSquare },
        { href: '/dashboard/shorts', label: 'Shorts', icon: MessageSquare },
        { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Placeholder or reuse layout if possible. 
                For now building a standalone view that looks like the dashboard. */}

            <div className="flex-1 lg:ml-0 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
                            <span className="font-black text-gray-900">MESSAGES</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-500 hidden md:block">Active Conversations: {conversations.length}</span>
                        <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* Conversation List */}
                    <div className="w-full lg:w-96 bg-white border-r border-gray-100 overflow-y-auto h-full p-4 space-y-4">
                        <div className="mb-6 px-2">
                            <h2 className="text-xl font-black text-gray-900">Inbound Queries</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Customer discussions</p>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-20 px-4">
                                <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 text-sm font-medium">No messages from customers yet.</p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setActiveConversation(conv)}
                                    className={`p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300 border ${activeConversation?.id === conv.id
                                        ? 'bg-primary-50 border-primary-100 shadow-md shadow-primary-500/5'
                                        : 'bg-white border-gray-50 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {conv.buyer?.full_name?.charAt(0) || 'C'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h3 className="font-bold text-gray-900 truncate text-sm">
                                                    {conv.buyer?.full_name || 'Anonymous Customer'}
                                                </h3>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(conv.updated_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate font-medium">Click to view discussion</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 relative">
                        {activeConversation ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto mb-6">
                                        <MessageSquare className="w-10 h-10 text-primary-500" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900">Chat with {activeConversation.buyer?.full_name}</h2>
                                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">Open the chat window using the button below or interact directly if a larger interface is implemented.</p>
                                    <button
                                        onClick={() => setActiveConversation(activeConversation)}
                                        className="btn-primary"
                                    >
                                        View Full History
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                                    <MessageSquare className="w-10 h-10 text-gray-200" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900">Your Communication Hub</h2>
                                <p className="text-gray-400 max-w-sm mx-auto font-medium mt-2">Select a customer from the left to start responding to their queries and manage project discussions.</p>
                            </div>
                        )}

                        {/* Chat Overlay for Vendor */}
                        {activeConversation && user && (
                            <ChatWindow
                                conversationId={activeConversation.id}
                                recipientName={activeConversation.buyer?.full_name || 'Customer'}
                                myUserId={user.id}
                                onClose={() => setActiveConversation(null)}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
