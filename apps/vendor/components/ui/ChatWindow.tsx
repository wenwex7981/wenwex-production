
'use client';

import { useState, useEffect, useRef } from 'react';
import { Message, sendMessage, fetchMessages, subscribeToMessages } from '@/lib/chat-service';
import { Send, X, Loader2, User, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatWindowProps {
    conversationId: string;
    recipientName: string;
    myUserId: string; // The current vendor's auth ID - passed from parent
    onClose: () => void;
}

export function ChatWindow({ conversationId, recipientName, myUserId, onClose }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadMessages() {
            try {
                const data = await fetchMessages(conversationId);
                console.log('Vendor - Loaded messages:', data);
                console.log('Vendor - My User ID:', myUserId);
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
    }, [conversationId, myUserId]);

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-[100] border border-gray-100 overflow-hidden"
        >
            {/* Header - Green theme for vendor */}
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="font-bold text-sm truncate max-w-[200px]">{recipientName}</div>
                        <div className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest">Customer</div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">No messages yet</p>
                        <p className="text-gray-400 text-xs mt-1">Waiting for customer messages...</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        // Compare sender_id with myUserId to determine alignment
                        // If sender_id === myUserId, it's the vendor's message (RIGHT)
                        // Otherwise it's the customer's message (LEFT)
                        const isMine = msg.sender_id === myUserId;

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                                {/* Avatar for customer messages (left side) */}
                                {!isMine && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                                        <User className="w-4 h-4 text-blue-600" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMine
                                            ? 'bg-emerald-600 text-white rounded-br-md'
                                            : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                                        }`}
                                >
                                    {!isMine && (
                                        <p className="text-[10px] font-bold text-blue-600 mb-1">Customer</p>
                                    )}
                                    <p>{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${isMine ? 'text-emerald-200' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {/* Avatar for vendor messages (right side) */}
                                {isMine && (
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center ml-2 flex-shrink-0">
                                        <Building2 className="w-4 h-4 text-emerald-600" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Reply to customer..."
                        className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
