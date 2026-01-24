'use client';

import { useState } from 'react';
import {
    Trash2,
    Eye,
    EyeOff,
    Flag,
    MoreHorizontal,
    Search,
    Filter,
    ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Mock posts for admin moderation
const initialPosts = [
    {
        id: '1',
        author: {
            name: 'TechCraft Studios',
            type: 'VENDOR',
            email: 'contact@techcraft.com'
        },
        content: 'Just deployed a massive update for our Enterprise CRM clients! 🚀 Reduced query times by 40% using specialized indexing strategies in Postgres.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        likes: 124,
        reports: 0,
        timestamp: '2 hours ago',
        status: 'PUBLISHED'
    },
    {
        id: '2',
        author: {
            name: 'Spam Bot One',
            type: 'VENDOR',
            email: 'spam@bot.com'
        },
        content: 'BUY CRYPTO NOW!!! 100x RETURNS GUARANTEED CLICK HERE >>> http://scam.link',
        likes: 0,
        reports: 15,
        timestamp: '1 day ago',
        status: 'FLAGGED'
    }
];

export default function FeedModerationPage() {
    const [posts, setPosts] = useState(initialPosts);
    const [filter, setFilter] = useState('ALL');

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            setPosts(posts.filter(p => p.id !== id));
            toast.success('Post deleted successfully');
        }
    };

    const handleStatusChange = (id: string, newStatus: string) => {
        setPosts(posts.map(p => p.id === id ? { ...p, status: newStatus } : p));
        toast.success(`Post marked as ${newStatus}`);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Feed Moderation</h1>
                    <p className="text-gray-500 font-medium">Monitor and moderate community content.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        Filter: {filter}
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-100">
                        <ShieldAlert className="w-4 h-4" />
                        Reported (1)
                    </button>
                </div>
            </div>

            {/* Posts Table/List */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Author</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest w-1/2">Content</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {posts.map(post => (
                            <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                            {post.author.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{post.author.name}</p>
                                            <p className="text-xs text-gray-400 font-medium">{post.author.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600 leading-relaxed mb-2 line-clamp-2">{post.content}</p>
                                    {post.image && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md w-fit">
                                            <Eye className="w-3 h-3" /> Includes Media
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${post.status === 'PUBLISHED' ? 'bg-green-50 text-green-600' :
                                            post.status === 'HIDDEN' ? 'bg-gray-100 text-gray-500' :
                                                'bg-red-50 text-red-600'
                                        }`}>
                                        {post.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {post.status !== 'HIDDEN' ? (
                                            <button
                                                onClick={() => handleStatusChange(post.id, 'HIDDEN')}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
                                                title="Hide Post"
                                            >
                                                <EyeOff className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleStatusChange(post.id, 'PUBLISHED')}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl"
                                                title="Publish Post"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                            title="Delete Permanently"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
