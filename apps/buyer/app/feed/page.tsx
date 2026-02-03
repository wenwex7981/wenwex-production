'use client';

import { useState, useEffect } from 'react';
import {
    Image as ImageIcon,
    Video,
    Link as LinkIcon,
    MoreHorizontal,
    Heart,
    MessageCircle,
    Share2,
    Send,
    Smile,
    Loader2,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'react-hot-toast';

// Maximum characters before showing "Read more"
const MAX_CONTENT_LENGTH = 280;

export default function FeedPage() {
    const supabase = getSupabaseClient();
    const { user, isAuthenticated } = useAuthStore();
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

    // Toggle expanded state for a post
    const toggleExpanded = (postId: string) => {
        setExpandedPosts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        loadPosts();

        // Realtime subscription
        const channel = supabase
            .channel('public:feed_posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_posts' }, () => {
                loadPosts(); // Reload on any change for simplicity, optimize later
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('feed_posts')
                .select(`
                    *,
                    vendor:vendors(id, company_name, slug, logo_url, is_verified)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);

            // Check liked status if logged in
            if (isAuthenticated && user) {
                const { data: likes } = await supabase
                    .from('feed_likes')
                    .select('post_id')
                    .eq('user_id', user.id);

                if (likes) {
                    setLikedPosts(new Set(likes.map(l => l.post_id)));
                }
            }
        } catch (error) {
            console.error('Error loading feed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleLike = async (postId: string) => {
        if (!isAuthenticated || !user) {
            toast.error('Please sign in to like posts');
            return;
        }

        const isLiked = likedPosts.has(postId);
        const newLiked = new Set(likedPosts);

        // Optimistic update
        if (isLiked) newLiked.delete(postId);
        else newLiked.add(postId);
        setLikedPosts(newLiked);

        try {
            if (isLiked) {
                await supabase.from('feed_likes').delete().match({ post_id: postId, user_id: user.id });
                // Decrease count locally
                setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count - 1) } : p));
            } else {
                await supabase.from('feed_likes').insert({ post_id: postId, user_id: user.id });
                // Increase count locally
                setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setLikedPosts(likedPosts);
            toast.error('Failed to update like');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container-custom py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Sidebar - Premium & Who to Follow */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-5">Who to follow</h4>
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gray-100" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-900">Tech Daily</span>
                                                    <span className="text-[10px] text-gray-500">@tech_daily</span>
                                                </div>
                                            </div>
                                            <button className="text-primary-600 text-xs font-black uppercase hover:underline">Follow</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <Link href="/vendors" className="text-xs text-gray-400 font-bold hover:text-primary-600 transition-colors">Find more experts →</Link>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-gradient-to-br from-primary-900 to-indigo-900 text-white shadow-xl shadow-primary-900/20">
                                <h4 className="font-black text-lg mb-2">Go Premium</h4>
                                <p className="text-xs text-primary-200 mb-4 leading-relaxed">Unlock exclusive tools and verified badges for your profile.</p>
                                <button className="w-full py-2 bg-white text-primary-900 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary-50 transition-colors">Upgrade Now</button>
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="col-span-1 lg:col-span-6 space-y-6">

                        {/* Only Vendors can post - buyers just see feed */}

                        {isLoading ? (
                            <div className="py-20 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="py-20 text-center bg-white rounded-[2rem] border border-gray-200">
                                <p className="text-gray-400 font-medium">No posts yet. Be the first!</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                                >
                                    {/* Post Header */}
                                    <div className="p-4 flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <Link href={`/vendors/${post.vendor?.slug}`} className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                                                <img src={post.vendor?.logo_url || `https://ui-avatars.com/api/?name=${post.vendor?.company_name}`} alt="" className="w-full h-full object-cover" />
                                            </Link>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <Link href={`/vendors/${post.vendor?.slug}`} className="font-bold text-gray-900 text-sm hover:underline">{post.vendor?.company_name}</Link>
                                                    {post.vendor?.is_verified && <span className="text-primary-500 text-xs">✓</span>}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500 gap-2">
                                                    <span className="font-medium">Vendor</span>
                                                    <span>•</span>
                                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Post Content */}
                                    <div className="px-4 pb-3">
                                        {post.content && post.content.length > MAX_CONTENT_LENGTH && !expandedPosts.has(post.id) ? (
                                            <>
                                                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {post.content.slice(0, MAX_CONTENT_LENGTH)}...
                                                </p>
                                                <button
                                                    onClick={() => toggleExpanded(post.id)}
                                                    className="mt-2 text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1"
                                                >
                                                    Read more <ChevronDown className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                                {post.content && post.content.length > MAX_CONTENT_LENGTH && (
                                                    <button
                                                        onClick={() => toggleExpanded(post.id)}
                                                        className="mt-2 text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1"
                                                    >
                                                        Read less <ChevronUp className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Post Media */}
                                    {post.media_url && (
                                        <div className="w-full bg-gray-50 overflow-hidden">
                                            {post.media_type === 'VIDEO' ? (
                                                <video src={post.media_url} controls className="w-full max-h-[500px]" />
                                            ) : (
                                                <img src={post.media_url} alt="Post content" className="w-full object-cover" />
                                            )}
                                        </div>
                                    )}

                                    {/* Interaction Bar */}
                                    <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
                                        <button
                                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                            onClick={() => toggleLike(post.id)}
                                        >
                                            <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                                            <span>{post.likes_count || 0}</span>
                                        </button>

                                        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">
                                            <MessageCircle className="w-5 h-5" />
                                            <span>{post.comments_count || 0}</span>
                                        </button>

                                        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600 transition-colors">
                                            <Share2 className="w-5 h-5" />
                                            <span>{post.shares_count || 0}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors ml-auto">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}

                        {/* Loading Text */}
                        {!isLoading && posts.length > 0 && (
                            <div className="text-center py-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                You're all caught up!
                            </div>
                        )}

                    </div>

                    {/* Right Sidebar - Profile & Nav */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                {isAuthenticated && user ? (
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-20 h-20 rounded-full bg-gray-200 mb-4 overflow-hidden">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-tr from-primary-400 to-indigo-500 flex items-center justify-center text-white font-black text-2xl">
                                                    {user.fullName?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900">{user.fullName}</h3>
                                        <p className="text-sm text-gray-500 font-medium mb-4">{user.email}</p>
                                        <Link href="/account" className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors text-center block">
                                            View Profile
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="font-bold text-gray-900 mb-4">Join the community</p>
                                        <Link href="/auth/login" className="block w-full py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors">
                                            Sign In
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Topics */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Trending Topics</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['#GenerativeAI', '#ReactJS', '#FreelanceLife', '#TechNews', '#Startup'].map(tag => (
                                        <span key={tag} className="px-3 py-1.5 rounded-lg bg-gray-50 text-xs font-bold text-gray-600 hover:text-primary-600 hover:bg-primary-50 cursor-pointer transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
