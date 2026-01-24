import { Suspense } from 'react';
import { Newspaper, ArrowRight, Calendar, User, Tag, Clock } from 'lucide-react';
import Link from 'next/link';

// Mock Blog Data
const blogPosts = [
    {
        id: '1',
        title: 'The Future of AI in Enterprise Solutions',
        slug: 'future-of-ai-enterprise',
        excerpt: 'Discover how artificial intelligence is reshaping business operations and decision-making processes across global industries.',
        author: 'Sarah Chen',
        date: 'Oct 15, 2025',
        readTime: '5 min read',
        category: 'Technology',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'
    },
    {
        id: '2',
        title: 'Top 10 Web Development Trends for 2026',
        slug: 'web-dev-trends-2026',
        excerpt: 'Stay ahead of the curve with our comprehensive guide to the latest frameworks, tools, and design patterns dominating the web.',
        author: 'Michael Ross',
        date: 'Nov 02, 2025',
        readTime: '8 min read',
        category: 'Development',
        imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'
    },
    {
        id: '3',
        title: 'Maximizing ROI with Custom CRM Solutions',
        slug: 'crm-roi-guide',
        excerpt: 'Why off-the-shelf software might be costing you more than you think. A deep dive into custom CRM benefits.',
        author: 'Jessica Lee',
        date: 'Dec 10, 2025',
        readTime: '6 min read',
        category: 'Business',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'
    },
    {
        id: '4',
        title: 'Cybersecurity Best Practices for Startups',
        slug: 'startup-security-guide',
        excerpt: 'Essential security protocols every new business must implement to protect sensitive data and build trust.',
        author: 'David Kumar',
        date: 'Jan 05, 2026',
        readTime: '7 min read',
        category: 'Security',
        imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800'
    },
    {
        id: '5',
        title: 'The Rise of Low-Code Development Platforms',
        slug: 'low-code-revolution',
        excerpt: 'How low-code and no-code platforms are democratizing software creation and accelerating digital transformation.',
        author: 'Emily White',
        date: 'Jan 12, 2026',
        readTime: '4 min read',
        category: 'Innovation',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'
    },
    {
        id: '6',
        title: 'Optimizing educational workflows with LMS',
        slug: 'education-lms-workflows',
        excerpt: 'Streamlining academic processes and student engagement through advanced Learning Management Systems.',
        author: 'Dr. Alan Grant',
        date: 'Jan 20, 2026',
        readTime: '6 min read',
        category: 'Education',
        imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800'
    }
];

export default function BlogsPage() {
    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <section className="relative pt-24 pb-20 overflow-hidden bg-white border-b border-gray-100">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />
                <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-xs font-black uppercase tracking-widest mb-6">
                        <Newspaper className="w-4 h-4" />
                        WENWEX Insights
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight mb-6 tracking-tight">
                        Latest News & <span className="text-primary-600">Tech Insights.</span>
                    </h1>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        Stay updated with the latest trends in technology, business, and innovation from our expert community.
                    </p>
                </div>
            </section>

            {/* Blogs Grid */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post) => (
                            <article key={post.id} className="group flex flex-col bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-primary-100 transition-all duration-500">
                                {/* Image */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                    <img
                                        src={post.imageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-lg">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-8 flex flex-col">
                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {post.date}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {post.readTime}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-primary-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {post.excerpt}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-900">{post.author}</span>
                                        </div>
                                        <button className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Load More */}
                    <div className="mt-16 text-center">
                        <button className="px-8 py-4 rounded-2xl bg-white border border-gray-200 text-gray-900 font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                            Load More Articles
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
