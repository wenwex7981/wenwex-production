
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchConversations, Conversation } from '@/lib/chat-service';
import { ChatWindow } from '@/components/ui/ChatWindow';
import { MessageSquare, User, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function MessagesPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        async function loadConversations() {
            if (!user) return;
            try {
                const data = await fetchConversations(user.id, user.role);
                setConversations(data || []);
            } catch (error) {
                console.error('Error loading conversations:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadConversations();
    }, [isAuthenticated, user]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <MessageSquare className="w-16 h-16 text-gray-300 mb-6" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h1>
                <p className="text-gray-500 mb-8 text-center max-w-md">
                    You need to be signed in to access your messages and communicate with vendors.
                </p>
                <Link href="/auth/login" className="btn-primary">
                    Sign In to Continue
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Messages</h1>
                        <p className="text-gray-500 font-medium">Your private discussions with vendors and partners.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="card text-center py-20 bg-white">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Conversations Yet</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Start exploring services and reach out to vendors to begin your first discussion.
                        </p>
                        <Link href="/services" className="btn-primary inline-flex">
                            Explore Services
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => setActiveConversation(conv)}
                                className="card group hover:scale-[1.02] transition-all duration-300 cursor-pointer border-transparent hover:border-primary-500/30 overflow-hidden bg-white"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                                            <Image
                                                src={conv.vendor?.logo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(conv.vendor?.company_name || 'V')}
                                                alt={conv.vendor?.company_name || ''}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">
                                            {conv.vendor?.company_name}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium mb-2">
                                            Last active: {new Date(conv.updated_at).toLocaleDateString()}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat Window Overlay */}
            {activeConversation && user && (
                <ChatWindow
                    conversationId={activeConversation.id}
                    recipientName={activeConversation.vendor?.company_name || 'Vendor'}
                    myUserId={user.id}
                    onClose={() => setActiveConversation(null)}
                />
            )}
        </div>
    );
}
