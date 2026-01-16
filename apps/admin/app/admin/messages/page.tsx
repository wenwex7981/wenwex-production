
'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/supabase';
import { fetchConversations, Conversation } from '@/lib/chat-service';
import { ChatWindow } from '@/components/ui/ChatWindow';
import { MessageSquare, Shield, Loader2, ArrowRight, Activity, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminMessagesPage() {
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function loadData() {
            try {
                const { data: { user } } = await getCurrentUser();
                if (!user) return;
                setUser(user);

                const data = await fetchConversations();
                setConversations(data || []);
            } catch (error) {
                console.error('Error loading conversations:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    const filteredConversations = conversations.filter(conv =>
        conv.vendor?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.buyer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 h-full bg-gray-900 min-h-screen text-gray-100">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <MessageSquare className="w-10 h-10 text-primary-500" />
                        Platform Messages
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium">Monitoring all active buyer-vendor communications across WENWEX.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl">
                        <Activity className="w-5 h-5 text-green-500 animate-pulse" />
                        <div>
                            <div className="text-xl font-black text-white">{conversations.length}</div>
                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Global Streams</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="relative mb-8 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by vendor or customer name..."
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-[2rem] pl-14 pr-8 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                </div>
            ) : filteredConversations.length === 0 ? (
                <div className="bg-gray-800/30 border border-dashed border-gray-700 rounded-[3rem] py-32 text-center">
                    <MessageSquare className="w-20 h-20 text-gray-700 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-400">No active communication streams found.</h3>
                    <p className="text-gray-600 mt-2 font-medium">Historical logs will appear here as users interact on the platform.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => setActiveConversation(conv)}
                            className={`group relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 cursor-pointer ${activeConversation?.id === conv.id
                                ? 'bg-primary-900/20 border-primary-500/50 shadow-2xl shadow-primary-500/10'
                                : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
                                }`}
                        >
                            <div className="p-8 relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex -space-x-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-700 border-4 border-gray-800 flex items-center justify-center font-bold text-lg overflow-hidden shadow-xl">
                                            <Image
                                                src={conv.vendor?.logo_url || 'https://ui-avatars.com/api/?name=V'}
                                                alt="Vendor"
                                                width={56}
                                                height={56}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-gray-800 flex items-center justify-center font-bold text-white text-lg shadow-xl ring-2 ring-primary-500/20">
                                            {conv.buyer?.full_name?.charAt(0) || 'C'}
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${activeConversation?.id === conv.id ? 'bg-primary-500 text-white' : 'bg-gray-700 text-gray-400'
                                        }`}>
                                        Stream Active
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Participants</p>
                                        <h3 className="font-black text-white truncate text-lg">
                                            {conv.vendor?.company_name} <span className="text-primary-500 mx-2">&</span> {conv.buyer?.full_name}
                                        </h3>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                                        <div className="text-[10px] text-gray-500 font-bold">
                                            Updated: {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-primary-400 group-hover:translate-x-1 transition-transform">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual effect for active item */}
                            {activeConversation?.id === conv.id && (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent pointer-events-none" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Chat Intervention Overlay */}
            {activeConversation && user && (
                <ChatWindow
                    conversationId={activeConversation.id}
                    recipientName={`${activeConversation.vendor?.company_name} vs ${activeConversation.buyer?.full_name}`}
                    myUserId={user.id}
                    buyerId={activeConversation.buyer_id}
                    vendorId={activeConversation.vendor_id}
                    onClose={() => setActiveConversation(null)}
                />
            )}
        </div>
    );
}
