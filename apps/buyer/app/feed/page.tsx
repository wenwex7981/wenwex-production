'use client';

import { useState } from 'react';
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
    Calendar,
    MapPin,
    Hash,
    Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Mock Posts Data
const initialPosts = [
    {
        id: '1',
        author: {
            name: 'TechCraft Studios',
            handle: '@techcraft_studios',
            avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100',
            verified: true,
            role: 'Elite Vendor'
        },
        content: 'Just deployed a massive update for our Enterprise CRM clients! 🚀 Reduced query times by 40% using specialized indexing strategies in Postgres. Check out the benchmark results below. #WebDev #Performance #SaaS',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        likes: 124,
        comments: 18,
        shares: 5,
        timestamp: '2 hours ago'
    },
    {
        id: '2',
        author: {
            name: 'Sarah Chen',
            handle: '@sarah_ai_research',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
            verified: false,
            role: 'Academic Expert'
        },
        content: 'Working on a new research paper about "Ethics in Generative AI". Looking for collaborators who have experience with bias detection datasets. DM me if interested! 📚✨',
        likes: 89,
        comments: 32,
        shares: 12,
        timestamp: '5 hours ago'
    },
    {
        id: '3',
        author: {
            name: 'AppForge Inc.',
            handle: '@appforge_team',
            avatar: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100',
            verified: true,
            role: 'Vendor'
        },
        content: 'Our latest Flutter UI kit is now live on WENWEX! Includes 50+ pre-built screens for e-commerce apps. Smooth animations guaranteed. 📱🎨',
        video: 'https://assets.mixkit.co/videos/preview/mixkit-mobile-phone-with-green-screen-at-desk-2965-large.mp4', // Placeholder video link
        likes: 256,
        comments: 45,
        shares: 28,
        timestamp: '1 day ago'
    }
];

export default function FeedPage() {
    const [posts, setPosts] = useState(initialPosts);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

    const toggleLike = (id: string) => {
        const newLiked = new Set(likedPosts);
        if (newLiked.has(id)) {
            newLiked.delete(id);
        } else {
            newLiked.add(id);
        }
        setLikedPosts(newLiked);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container-custom py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Sidebar - Profile & Nav */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-gray-200 mb-4 overflow-hidden">
                                    {/* Placeholder User Avatar */}
                                    <div className="w-full h-full bg-gradient-to-tr from-primary-400 to-indigo-500 flex items-center justify-center text-white font-black text-2xl">
                                        JD
                                    </div>
                                </div>
                                <h3 className="text-lg font-black text-gray-900">John Doe</h3>
                                <p className="text-sm text-gray-500 font-medium mb-4">@johndoe_dev</p>

                                <div className="flex items-center gap-4 text-sm font-bold w-full justify-center py-4 border-t border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-gray-900">1.2k</span>
                                        <span className="text-gray-400 text-xs uppercase tracking-wider">Followers</span>
                                    </div>
                                    <div className="w-[1px] h-8 bg-gray-100" />
                                    <div className="flex flex-col">
                                        <span className="text-gray-900">45</span>
                                        <span className="text-gray-400 text-xs uppercase tracking-wider">Following</span>
                                    </div>
                                </div>

                                <Link href="/account" className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors">
                                    View Profile
                                </Link>
                            </div>
                        </div>

                        {/* Topics / Trending Tags */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-6 sticky top-[420px]">
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

                    {/* Main Feed */}
                    <div className="col-span-1 lg:col-span-6 space-y-6">
                        {/* Create Post Widget */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 bg-gradient-to-tr from-primary-400 to-indigo-500" />
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="What's happening in your tech world?"
                                        className="w-full h-10 bg-gray-50 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-primary-600 transition-colors tooltip" title="Add Image">
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-primary-600 transition-colors" title="Add Video">
                                        <Video className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-primary-600 transition-colors" title="Add Link">
                                        <LinkIcon className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-primary-600 transition-colors" title="Add Emoji">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>
                                <button className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-black tracking-wide hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                                    Post
                                </button>
                            </div>
                        </div>

                        {/* Posts Stream */}
                        {posts.map(post => (
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
                                        <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="font-bold text-gray-900 text-sm">{post.author.name}</h4>
                                                {post.author.verified && <span className="text-primary-500">✓</span>}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 gap-2">
                                                <span className="font-medium">{post.author.handle}</span>
                                                <span>•</span>
                                                <span>{post.timestamp}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Post Content */}
                                <div className="px-4 pb-3">
                                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                </div>

                                {/* Post Media */}
                                {post.image && (
                                    <div className="w-full aspect-video bg-gray-50 overflow-hidden">
                                        <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                {post.video && (
                                    <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
                                        {/* Placeholder for Video Player */}
                                        <span className="text-white text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Video Content</span>
                                    </div>
                                )}

                                {/* Interaction Bar */}
                                <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
                                    <button
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                        onClick={() => toggleLike(post.id)}
                                    >
                                        <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                                        <span>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                                    </button>

                                    <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">
                                        <MessageCircle className="w-5 h-5" />
                                        <span>{post.comments}</span>
                                    </button>

                                    <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600 transition-colors">
                                        <Share2 className="w-5 h-5" />
                                        <span>{post.shares}</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors ml-auto">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Loading Text */}
                        <div className="text-center py-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            You're all caught up!
                        </div>

                    </div>

                    {/* Right Sidebar - Suggestions */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sticky top-24">
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

                        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-primary-900 to-indigo-900 text-white shadow-xl shadow-primary-900/20 sticky top-[300px]">
                            <h4 className="font-black text-lg mb-2">Go Premium</h4>
                            <p className="text-xs text-primary-200 mb-4 leading-relaxed">Unlock exclusive tools and verified badges for your profile.</p>
                            <button className="w-full py-2 bg-white text-primary-900 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary-50 transition-colors">Upgrade Now</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
