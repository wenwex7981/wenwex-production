
'use client';

import { useState, useEffect, useRef } from 'react';
import { Message, sendMessage, fetchMessages, subscribeToMessages } from '@/lib/chat-service';
import { Send, X, Loader2, User, Building2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatWindowProps {
    conversationId: string;
    recipientName: string;
    myUserId: string; // Admin's auth ID
    buyerId?: string; // The buyer's ID in this conversation
    vendorId?: string; // The vendor's ID in this conversation
    onClose: () => void;
}

export function ChatWindow({ conversationId, recipientName, myUserId, buyerId, vendorId, onClose }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadMessages() {
            try {
                const data = await fetchMessages(conversationId);
                setMessages(data || []);
            } catch (error) {
                console.error('Error loading messages:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadMessages();

        const subscription = subscribeToMessages(conversationId, (msg) => {
            setMessages((prev) => {
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [conversationId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !myUserId || isSending) return;

        try {
            setIsSending(true);
            const msg = await sendMessage(conversationId, myUserId, newMessage.trim());
            setMessages((prev) => [...prev, msg]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    // Determine message sender type
    const getSenderType = (senderId: string): 'admin' | 'vendor' | 'buyer' => {
        if (senderId === myUserId) return 'admin';
        // Note: In admin view, we can't easily distinguish vendor from buyer
        // without having those IDs. For now, just show as "participant"
        return 'buyer'; // Default to buyer styling for non-admin messages
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[420px] h-[550px] bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-[100] border border-gray-700 overflow-hidden"
        >
            {/* Header - Purple theme for admin */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="font-bold text-sm truncate max-w-[250px]">{recipientName}</div>
                        <div className="text-[10px] text-purple-200 font-bold uppercase tracking-widest">Admin Monitoring</div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-sm font-medium">No messages in this conversation</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const senderType = getSenderType(msg.sender_id);
                        const isAdmin = senderType === 'admin';

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                            >
                                {/* Avatar for participant messages */}
                                {!isAdmin && (
                                    <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center mr-2 flex-shrink-0">
                                        <User className="w-4 h-4 text-blue-400" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isAdmin
                                            ? 'bg-purple-600 text-white rounded-br-md'
                                            : 'bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700'
                                        }`}
                                >
                                    {!isAdmin && (
                                        <p className="text-[10px] font-bold text-blue-400 mb-1">Participant</p>
                                    )}
                                    {isAdmin && (
                                        <p className="text-[10px] font-bold text-purple-200 mb-1">Admin</p>
                                    )}
                                    <p>{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${isAdmin ? 'text-purple-200' : 'text-gray-500'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {/* Avatar for admin messages */}
                                {isAdmin && (
                                    <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center ml-2 flex-shrink-0">
                                        <Shield className="w-4 h-4 text-purple-400" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Send admin message..."
                        className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
                    >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
