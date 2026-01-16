'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="text-center max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative inline-block mb-8">
                        <span className="text-[120px] font-black text-gray-100 leading-none select-none">
                            404
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center animate-pulse">
                                <Search className="w-10 h-10 text-primary-600" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        Oops! Content Not Found
                    </h1>
                    <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="btn-primary w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-2 group shadow-xl shadow-primary-500/20"
                        >
                            <Home className="w-5 h-5" />
                            <span>Return to Dashboard</span>
                        </Link>
                        <Link
                            href="/services"
                            className="btn-secondary w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-2 border-2"
                        >
                            <Search className="w-5 h-5" />
                            <span>Browse Services</span>
                        </Link>
                    </div>
                </motion.div>

                {/* Rich Dummy Data - Suggested Services */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="mt-20 pt-12 border-t border-gray-100"
                >
                    <div className="text-left mb-8">
                        <h3 className="text-xl font-black text-gray-900 mb-2">You might be interested in...</h3>
                        <p className="text-gray-500 text-sm font-medium">Top rated services available right now</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'Cloud Infrastructure Setup', cat: 'DevOps', price: '$2,499', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400' },
                            { title: 'Enterprise UI/UX Design', cat: 'Design', price: '$1,899', img: 'https://images.unsplash.com/photo-1586717791821-3f44a563cc4c?w=400' },
                            { title: 'Full Stack App Development', cat: 'Tech', price: '$4,500', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400' },
                        ].map((s, i) => (
                            <div key={i} className="group bg-white p-4 rounded-3xl border border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-500 text-left">
                                <div className="aspect-video rounded-2xl overflow-hidden mb-4 bg-gray-50">
                                    <img src={s.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{s.cat}</span>
                                <h4 className="font-bold text-gray-900 mt-1 line-clamp-1">{s.title}</h4>
                                <p className="text-gray-900 font-black mt-2">{s.price}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-6">
                            Trending Categories
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['Web Development', 'Mobile Apps', 'AI & Data', 'UI/UX Design', 'Cloud Solutions', 'Cyber Security'].map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/services?category=${cat}`}
                                    className="px-6 py-3 bg-white hover:bg-primary-50 hover:border-primary-200 border border-gray-200 rounded-2xl text-[13px] font-bold text-gray-700 transition-all shadow-sm hover:shadow-md"
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
