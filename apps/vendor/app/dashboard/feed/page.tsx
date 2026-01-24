'use client';

import { useState } from 'react';
import {
    Image as ImageIcon,
    Video,
    MoreHorizontal,
    Trash2,
    Send,
    Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function VendorFeedPage() {
    // Mock posts for vendor view
    const [posts, setPosts] = useState([
        {
            id: '1',
            content: 'Just deployed a massive update for our Enterprise CRM clients! 🚀 Reduced query times by 40% using specialized indexing strategies in Postgres. Check out the benchmark results below. #WebDev #Performance #SaaS',
            likes: 124,
            comments: 18,
            timestamp: '2 hours ago',
            status: 'PUBLISHED'
        },
        {
            id: '2',
            content: 'We are hiring new React developers! DM us for more info.',
            likes: 45,
            comments: 12,
            timestamp: '1 day ago',
            status: 'PUBLISHED'
        }
    ]);
    const [isPosting, setIsPosting] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');

    const handlePost = async () => {
        if (!newPostContent.trim()) return;
        setIsPosting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newPost = {
            id: Date.now().toString(),
            content: newPostContent,
            likes: 0,
            comments: 0,
            timestamp: 'Just now',
            status: 'PUBLISHED'
        };

        setPosts([newPost, ...posts]);
        setNewPostContent('');
        setIsPosting(false);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Community Feed</h1>
                    <p className="text-gray-500 font-medium">Engage with the community by posting updates, news, and insights.</p>
                </div>
            </div>

            {/* Create Post Widget */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-black text-xl">
                        V
                    </div>
                    <div className="flex-1">
                        <textarea
                            placeholder="Share your latest updates..."
                            className="w-full bg-gray-50 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all font-medium resize-none min-h-[120px]"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between mt-4 pl-16">
                    <div className="flex gap-2">
                        <button className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-primary-600 transition-colors bg-gray-50/50">
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-primary-600 transition-colors bg-gray-50/50">
                            <Video className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={handlePost}
                        disabled={isPosting || !newPostContent.trim()}
                        className="px-8 py-3 bg-primary-600 text-white rounded-xl text-sm font-black tracking-wide hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Post Update
                    </button>
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
                <h3 className="text-xl font-black text-gray-900">Your Posts</h3>

                {posts.map(post => (
                    <div key={post.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${post.status === 'PUBLISHED' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                                    }`}>
                                    {post.status}
                                </span>
                                <span className="text-xs font-bold text-gray-400">{post.timestamp}</span>
                            </div>
                            <button className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-gray-900 font-medium leading-relaxed mb-6">{post.content}</p>

                        <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                <span className="text-gray-900">{post.likes}</span> Likes
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                <span className="text-gray-900">{post.comments}</span> Comments
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
