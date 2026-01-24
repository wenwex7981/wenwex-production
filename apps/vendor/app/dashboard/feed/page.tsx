'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Image as ImageIcon,
    Video,
    Trash2,
    Send,
    Loader2,
    X as XIcon
} from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { getCurrentVendor } from '@/lib/vendor-service';

export default function VendorFeedPage() {
    const supabase = getSupabaseClient();
    const [posts, setPosts] = useState<any[]>([]);
    const [vendorId, setVendorId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Posting State
    const [isPosting, setIsPosting] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const vendor = await getCurrentVendor();
            if (vendor) {
                setVendorId(vendor.id);
                fetchPosts(vendor.id);
            }
        } catch (error) {
            console.error('Error loading vendor data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPosts = async (vId: string) => {
        const { data, error } = await supabase
            .from('feed_posts')
            .select('*')
            .eq('vendor_id', vId)
            .order('created_at', { ascending: false });

        if (data) setPosts(data);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePost = async () => {
        if (!newPostContent.trim() && !selectedFile) return;
        if (!vendorId) return;

        setIsPosting(true);
        try {
            let mediaUrl = null;
            let mediaType = 'NONE';

            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${vendorId}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('feed-media')
                    .upload(fileName, selectedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('feed-media')
                    .getPublicUrl(fileName);

                mediaUrl = publicUrl;
                mediaType = selectedFile.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
            }

            const { error: insertError } = await supabase
                .from('feed_posts')
                .insert({
                    vendor_id: vendorId,
                    content: newPostContent,
                    media_url: mediaUrl,
                    media_type: mediaType,
                });

            if (insertError) throw insertError;

            toast.success('Post published successfully!');
            setNewPostContent('');
            clearFile();
            fetchPosts(vendorId); // Refresh

        } catch (error: any) {
            console.error('Error creating post:', error);
            toast.error('Failed to post update');
        } finally {
            setIsPosting(false);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const { error } = await supabase.from('feed_posts').delete().eq('id', postId);
            if (error) throw error;
            setPosts(posts.filter(p => p.id !== postId));
            toast.success('Post deleted');
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Could not delete post');
        }
    };

    if (isLoading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

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
                    <div className="flex-1 space-y-4">
                        <textarea
                            placeholder="Share your latest updates..."
                            className="w-full bg-gray-50 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all font-medium resize-none min-h-[120px]"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                        />

                        {/* File Preview */}
                        {previewUrl && (
                            <div className="relative w-fit">
                                {selectedFile?.type.startsWith('video/') ? (
                                    <video src={previewUrl} className="h-40 rounded-xl" controls />
                                ) : (
                                    <img src={previewUrl} alt="Preview" className="h-40 rounded-xl object-cover" />
                                )}
                                <button
                                    onClick={clearFile}
                                    className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                />

                <div className="flex items-center justify-between mt-4 pl-16">
                    <div className="flex gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-primary-600 transition-colors bg-gray-50/50 flex items-center gap-2"
                        >
                            <ImageIcon className="w-5 h-5" />
                            <span className="text-xs font-bold">Media</span>
                        </button>
                    </div>
                    <button
                        onClick={handlePost}
                        disabled={isPosting || (!newPostContent.trim() && !selectedFile)}
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

                {posts.length === 0 && (
                    <p className="text-gray-400 italic">No posts yet. Start sharing!</p>
                )}

                {posts.map(post => (
                    <div key={post.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    Published
                                </span>
                                <span className="text-xs font-bold text-gray-400">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <button
                                onClick={() => handleDelete(post.id)}
                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-gray-900 font-medium leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>

                        {post.media_url && (
                            <div className="mb-6 rounded-xl overflow-hidden bg-gray-50">
                                {post.media_type === 'VIDEO' ? (
                                    <video src={post.media_url} controls className="w-full max-h-[400px]" />
                                ) : (
                                    <img src={post.media_url} alt="Post media" className="w-full object-cover max-h-[400px]" />
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                <span className="text-gray-900">{post.likes_count || 0}</span> Likes
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                <span className="text-gray-900">{post.comments_count || 0}</span> Comments
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
