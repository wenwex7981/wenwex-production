'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star, Clock, Heart, Share2, BadgeCheck, ChevronRight,
    Check, Play, FileText, Users, MessageSquare, Shield, Award, Loader2,
    Mail, Phone, Globe, Download, ExternalLink, Sparkles,
    Send, Calendar, X, ClipboardList, Video
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useCurrencyStore } from '@/lib/currency-store';
import { fetchServiceBySlug } from '@/lib/data-service';
import { DynamicFieldsDisplay } from '@/lib/dynamic-fields';
import { useAuthStore } from '@/lib/auth-store';
import { getOrCreateConversation } from '@/lib/chat-service';
import { ChatWindow } from '@/components/ui/ChatWindow';
import toast from 'react-hot-toast';

// Mock service data - used as fallback
const mockService = {
    id: '1',
    title: 'Full-Stack E-commerce Platform Development',
    slug: 'full-stack-ecommerce-platform',
    description: `Transform your business with our comprehensive e-commerce solution. We build custom online stores that convert visitors into customers with seamless shopping experiences.

Our full-stack e-commerce platforms include:
- Modern, responsive storefront design
- Secure payment gateway integration (Stripe, PayPal, etc.)
- Inventory management system
- Order tracking and notifications
- Customer account management
- Admin dashboard with analytics
- SEO optimization
- Mobile-first approach

We use cutting-edge technologies including React/Next.js, Node.js, PostgreSQL, and AWS to ensure your platform is fast, secure, and scalable.`,
    shortDescription: 'Custom e-commerce solutions with payment integration, admin panel, and mobile-responsive design.',
    price: 2499,
    currency: 'USD',
    deliveryDays: 14,
    rating: 4.9,
    totalReviews: 127,
    viewCount: 3245,
    techStack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Stripe', 'AWS'],
    features: [
        'Custom responsive design',
        'Payment integration',
        'Admin dashboard',
        'Inventory management',
        'Email notifications',
        'SEO optimized',
        '3 months support',
        'Source code included',
    ],
    media: [
        { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=1200' },
        { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200' },
        { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200' },
    ],
    vendor: {
        id: 'v1',
        name: 'TechCraft Studios',
        slug: 'techcraft-studios',
        logo: 'https://ui-avatars.com/api/?name=TechCraft&background=0c8bff&color=fff&size=200',
        description: 'Full-stack development agency specializing in enterprise solutions.',
        isVerified: true,
        rating: 4.9,
        totalReviews: 234,
        followersCount: 1250,
        servicesCount: 15,
        memberSince: 'Jan 2024',
        email: 'contact@techcraft.com',
        whatsappNumber: '+1234567890',
        website: 'https://techcraft.io',
    },
    category: { name: 'Web Development', slug: 'web-development' },
    subCategory: { name: 'E-commerce', slug: 'ecommerce' },
    reviews: [
        { id: '1', user: { name: 'John D.', avatar: null }, rating: 5, title: 'Excellent work!', comment: 'The team delivered exactly what we needed. Great communication throughout.', date: '2 weeks ago' },
        { id: '2', user: { name: 'Sarah M.', avatar: null }, rating: 5, title: 'Highly recommend', comment: 'Professional, fast, and the quality exceeded our expectations.', date: '1 month ago' },
        { id: '3', user: { name: 'Mike R.', avatar: null }, rating: 4, title: 'Great service', comment: 'Very happy with the result. Minor revisions were handled quickly.', date: '1 month ago' },
    ],
};

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
    const formatPrice = useCurrencyStore((state) => state.formatPrice);
    const { user, isAuthenticated } = useAuthStore();
    const [service, setService] = useState<any>(mockService);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isStartingChat, setIsStartingChat] = useState(false);

    // Request Quote Modal States
    const [showRequestQuoteModal, setShowRequestQuoteModal] = useState(false);
    const [showBookDemoModal, setShowBookDemoModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quoteFormData, setQuoteFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        budget: '',
        message: '',
        preferred_date: '',
        preferred_time: '',
    });
    const supabase = getSupabaseClient();

    useEffect(() => {
        async function loadService() {
            try {
                const dbService = await fetchServiceBySlug(params.slug);
                if (dbService) {
                    // Map database fields to component expected structure
                    setService({
                        id: dbService.id,
                        title: dbService.title || dbService.name || 'Service',
                        slug: dbService.slug,
                        description: dbService.description || 'Professional service on WENWEX marketplace.',
                        shortDescription: dbService.description?.substring(0, 200) || '',
                        price: dbService.price || 0,
                        currency: 'USD',
                        deliveryDays: dbService.delivery_days || 7,
                        rating: dbService.rating || 0,
                        totalReviews: dbService.rating_count || 0,
                        viewCount: dbService.view_count || 0,
                        techStack: dbService.tech_stack || [],
                        features: dbService.features || ['Professional delivery', 'Quality assured'],
                        media: [
                            ...(dbService.project_photos || []).map((url: string) => ({ type: 'IMAGE', url })),
                            ...(dbService.project_videos || []).map((url: string) => ({ type: 'VIDEO', url })),
                            ...(dbService.images || []).map((url: string) => ({ type: 'IMAGE', url })),
                            ...(dbService.project_photos?.length || dbService.project_videos?.length || dbService.images?.length ? [] : [{ type: 'IMAGE', url: dbService.main_image_url || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=1200' }])
                        ],
                        project_documents: dbService.project_documents || [],
                        vendor: dbService.vendor ? {
                            id: dbService.vendor.id,
                            name: dbService.vendor.company_name,
                            slug: dbService.vendor.slug || dbService.vendor.id,
                            logo: dbService.vendor.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(dbService.vendor.company_name || 'V')}&background=0c8bff&color=fff&size=200`,
                            description: dbService.vendor.description || 'Professional service provider.',
                            isVerified: dbService.vendor.is_verified || false,
                            rating: dbService.vendor.rating || 4.5,
                            totalReviews: dbService.vendor.total_reviews || 0,
                            followersCount: dbService.vendor.followers_count || 0,
                            servicesCount: dbService.vendor.services_count || 0,
                            memberSince: dbService.vendor.created_at ? new Date(dbService.vendor.created_at).getFullYear().toString() : '2024',
                            email: dbService.vendor.email || null,
                            whatsappNumber: dbService.vendor.whatsapp_number || null,
                            website: dbService.vendor.website_url || null,
                        } : mockService.vendor,
                        category: dbService.category ? {
                            name: dbService.category.name,
                            slug: dbService.category.slug
                        } : { name: 'Services', slug: 'services' },
                        subCategory: { name: 'General', slug: 'general' },
                        custom_fields: dbService.custom_fields || {},
                        reviews: [],
                    });
                }
            } catch (error) {
                console.error('Error fetching service:', error);
                // Keep mock service on error
            } finally {
                setIsLoading(false);
            }
        }
        loadService();
    }, [params.slug]);

    // Check if service is saved
    useEffect(() => {
        async function checkSavedStatus() {
            if (!isAuthenticated || !user || !service?.id) return;

            try {
                const { data, error } = await supabase
                    .from('saved_services')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('service_id', service.id)
                    .single();

                if (data && !error) {
                    setIsSaved(true);
                }
            } catch (error) {
                // Not saved or error - ignore
            }
        }
        checkSavedStatus();
    }, [isAuthenticated, user, service?.id]);

    // Handle save/unsave service
    const handleSaveToggle = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to save services');
            return;
        }
        if (!user || !service?.id) return;

        try {
            if (isSaved) {
                // Unsave
                const { error } = await supabase
                    .from('saved_services')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('service_id', service.id);

                if (error) throw error;
                setIsSaved(false);
                toast.success('Service removed from saved');
            } else {
                // Save
                const { error } = await supabase
                    .from('saved_services')
                    .insert({
                        user_id: user.id,
                        service_id: service.id,
                    });

                if (error) throw error;
                setIsSaved(true);
                toast.success('Service saved!');
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            toast.error('Failed to update saved status');
        }
    };

    // Handle starting chat
    const handleStartChat = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to chat with the seller');
            return;
        }
        if (!user || !service.vendor?.id) return;

        setIsStartingChat(true);
        try {
            const conversation = await getOrCreateConversation(user.id, service.vendor.id, service.id);
            setActiveConversationId(conversation.id);
            toast.success('Chat started!');
        } catch (error) {
            console.error('Error starting chat:', error);
            toast.error('Failed to start chat');
        } finally {
            setIsStartingChat(false);
        }
    };

    // Handle WhatsApp click
    const handleWhatsAppClick = () => {
        if (service.vendor?.whatsappNumber) {
            const cleanNumber = service.vendor.whatsappNumber.replace(/[^0-9]/g, '');
            const message = encodeURIComponent(`Hi, I'm interested in your service: ${service.title}`);
            window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
        } else {
            toast.error('WhatsApp number not available');
        }
    };

    // Handle Email click
    const handleEmailClick = () => {
        if (service.vendor?.email) {
            const subject = encodeURIComponent(`Inquiry about: ${service.title}`);
            const body = encodeURIComponent(`Hi,\n\nI'm interested in your service "${service.title}" on WENWEX.\n\nPlease let me know more details.\n\nThank you!`);
            window.open(`mailto:${service.vendor.email}?subject=${subject}&body=${body}`, '_blank');
        } else {
            toast.error('Email not available');
        }
    };

    // Handle Website click
    const handleWebsiteClick = () => {
        if (service.vendor?.website) {
            window.open(service.vendor.website, '_blank');
        } else {
            toast.error('Website not available');
        }
    };

    // Handle Request Quote Submission
    const handleRequestQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quoteFormData.name || !quoteFormData.email || !quoteFormData.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('service_inquiries')
                .insert([{
                    service_id: service.id,
                    vendor_id: service.vendor?.id,
                    user_id: user?.id || null,
                    inquiry_type: 'quote',
                    name: quoteFormData.name,
                    email: quoteFormData.email,
                    phone: quoteFormData.phone,
                    company: quoteFormData.company,
                    budget: quoteFormData.budget,
                    message: quoteFormData.message,
                    service_title: service.title,
                }]);

            if (error) throw error;

            toast.success('Quote request submitted successfully! The vendor will contact you soon.');
            setShowRequestQuoteModal(false);
            setQuoteFormData({ name: '', email: '', phone: '', company: '', budget: '', message: '', preferred_date: '', preferred_time: '' });
        } catch (error: any) {
            console.error('Error submitting quote:', error);
            toast.error(error.message || 'Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Book Demo Submission
    const handleBookDemo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quoteFormData.name || !quoteFormData.email || !quoteFormData.preferred_date) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('service_inquiries')
                .insert([{
                    service_id: service.id,
                    vendor_id: service.vendor?.id,
                    user_id: user?.id || null,
                    inquiry_type: 'demo',
                    name: quoteFormData.name,
                    email: quoteFormData.email,
                    phone: quoteFormData.phone,
                    company: quoteFormData.company,
                    preferred_date: quoteFormData.preferred_date,
                    preferred_time: quoteFormData.preferred_time,
                    message: quoteFormData.message || 'Demo request',
                    service_title: service.title,
                }]);

            if (error) throw error;

            toast.success('Demo booked successfully! The vendor will confirm the schedule.');
            setShowBookDemoModal(false);
            setQuoteFormData({ name: '', email: '', phone: '', company: '', budget: '', message: '', preferred_date: '', preferred_time: '' });
        } catch (error: any) {
            console.error('Error booking demo:', error);
            toast.error(error.message || 'Failed to book demo. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-gray-500 hover:text-primary-600">Home</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link href="/services" className="text-gray-500 hover:text-primary-600">Services</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link href={`/categories/${service.category.slug}`} className="text-gray-500 hover:text-primary-600">
                            {service.category.name}
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-medium truncate max-w-xs">{service.title}</span>
                    </nav>
                </div>
            </div>

            <div className="container-custom py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Gallery */}
                        <div className="card p-0 overflow-hidden bg-gray-100">
                            <div className="relative aspect-video">
                                <img
                                    src={service.media[selectedImage].url}
                                    alt={service.title}
                                    className="w-full h-full object-cover transition-all duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                            </div>
                            <div className="p-4 flex gap-3 overflow-x-auto scrollbar-hide">
                                {service.media.map((item: { type: string; url: string }, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`relative w-24 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-primary-500 scale-95 shadow-lg' : 'border-transparent hover:border-gray-200'
                                            } bg-white`}
                                    >
                                        <img
                                            src={item.url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title & Actions */}
                        <div>
                            <div className="flex items-start justify-between gap-4">
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                    {service.title}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSaveToggle}
                                        className={`btn-icon border ${isSaved ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200'}`}
                                    >
                                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500' : ''}`} />
                                    </button>
                                    <button
                                        className="btn-icon border border-gray-200"
                                        onClick={async () => {
                                            const shareUrl = window.location.href;
                                            const shareText = `Check out this service: ${service.title} on WENWEX`;

                                            // Try native share first (mobile)
                                            if (navigator.share) {
                                                try {
                                                    await navigator.share({
                                                        title: service.title,
                                                        text: shareText,
                                                        url: shareUrl
                                                    });
                                                    toast.success('Shared successfully!');
                                                } catch (err) {
                                                    // User cancelled share
                                                }
                                            } else {
                                                // Fallback: Copy to clipboard
                                                try {
                                                    await navigator.clipboard.writeText(shareUrl);
                                                    toast.success('Link copied to clipboard!');
                                                } catch (err) {
                                                    toast.error('Failed to copy link');
                                                }
                                            }
                                        }}
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                    <span className="font-semibold text-gray-900">{service.rating}</span>
                                    <span className="text-gray-500">({service.totalReviews} reviews)</span>
                                </div>
                                <span className="text-gray-300">|</span>
                                <div className="flex items-center gap-1 text-gray-500">
                                    <Users className="w-4 h-4" />
                                    {service.viewCount.toLocaleString()} views
                                </div>
                                <span className="text-gray-300">|</span>
                                <Link href={`/categories/${service.category.slug}`} className="badge-primary">
                                    {service.category.name}
                                </Link>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="card">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Service</h2>
                            <div className="prose prose-gray max-w-none">
                                {service.description.split('\n\n').map((para: string, idx: number) => (
                                    <p key={idx} className="text-gray-600 mb-4 whitespace-pre-line">{para}</p>
                                ))}
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div className="card">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Technologies Used</h2>
                            <div className="flex flex-wrap gap-2">
                                {service.techStack.map((tech: string) => (
                                    <span key={tech} className="badge-gray">{tech}</span>
                                ))}
                            </div>
                        </div>

                        {/* Custom Dynamic Fields */}
                        {service.custom_fields && Object.keys(service.custom_fields).length > 0 && (
                            <div className="card">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                    Performance Specifications
                                </h2>
                                <DynamicFieldsDisplay
                                    entityType="services"
                                    values={service.custom_fields}
                                />
                            </div>
                        )}

                        {/* Features */}
                        <div className="card">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {service.features.map((feature: any) => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <span className="text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Project Documentation */}
                        {service.project_documents && service.project_documents.length > 0 && (
                            <div className="card">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    Resource Specifications
                                </h2>
                                <div className="grid gap-3">
                                    {service.project_documents.map((url: string, i: number) => (
                                        <a
                                            key={i}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Download className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {url.split('/').pop() || `Document ${i + 1}`}
                                                </p>
                                                <p className="text-xs text-gray-500">PDF / Documentation Resource</p>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                    See All Reviews
                                </button>
                            </div>

                            {/* Rating Summary */}
                            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl mb-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-gray-900">{service.rating}</div>
                                    <div className="flex items-center gap-0.5 my-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className={`w-4 h-4 ${i <= Math.floor(service.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <div className="text-sm text-gray-500">{service.totalReviews} reviews</div>
                                </div>
                            </div>

                            {/* Review List */}
                            <div className="space-y-6">
                                {service.reviews.map((review: { id: string; user: { name: string; avatar: string | null }; rating: number; title: string; comment: string; date: string }) => (
                                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                                                {review.user.name[0]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-gray-900">{review.user.name}</span>
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="font-medium text-gray-800 mb-1">{review.title}</p>
                                                <p className="text-gray-600 text-sm">{review.comment}</p>
                                                <p className="text-gray-400 text-xs mt-2">{review.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Pricing Card */}
                            <div className="card">
                                <div className="text-center pb-6 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Starting at</span>
                                    <div className="text-4xl font-bold text-gray-900 mt-1">
                                        {formatPrice(service.price)}
                                    </div>
                                </div>

                                <div className="py-6 space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Delivery Time</span>
                                        <span className="font-medium text-gray-900 flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {service.deliveryDays} days
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Revisions</span>
                                        <span className="font-medium text-gray-900">3 included</span>
                                    </div>
                                </div>

                                <Link href={`/checkout?service=${service.slug}`} className="btn-primary w-full text-lg py-4">
                                    Continue ({formatPrice(service.price)})
                                </Link>

                                {/* Request Quote & Book Demo Buttons */}
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button
                                        onClick={() => setShowRequestQuoteModal(true)}
                                        className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-2xl border border-orange-100 transition-all group"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                                            <ClipboardList className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-orange-700">Request Quote</span>
                                    </button>

                                    <button
                                        onClick={() => setShowBookDemoModal(true)}
                                        className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-2xl border border-indigo-100 transition-all group"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
                                            <Video className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-indigo-700">Book Demo</span>
                                    </button>
                                </div>

                                {/* Contact Options */}
                                <div className="mt-4 space-y-3">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Contact Seller</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {/* Chat Button */}
                                        <button
                                            onClick={handleStartChat}
                                            disabled={isStartingChat}
                                            className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-gray-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                {isStartingChat ? (
                                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                ) : (
                                                    <MessageSquare className="w-5 h-5 text-white" />
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Chat</span>
                                        </button>

                                        {/* WhatsApp Button */}
                                        <button
                                            onClick={handleWhatsAppClick}
                                            className="flex flex-col items-center gap-1.5 p-3 bg-green-50 hover:bg-green-100 rounded-2xl border border-green-100 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                </svg>
                                            </div>
                                            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">WhatsApp</span>
                                        </button>

                                        {/* Email Button */}
                                        <button
                                            onClick={handleEmailClick}
                                            className="flex flex-col items-center gap-1.5 p-3 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-100 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Mail className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Email</span>
                                        </button>

                                        {/* Website Button */}
                                        <button
                                            onClick={handleWebsiteClick}
                                            className="flex flex-col items-center gap-1.5 p-3 bg-purple-50 hover:bg-purple-100 rounded-2xl border border-purple-100 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Globe className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">Website</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Vendor Card */}
                            <div className="card">
                                <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">About the Seller</h3>
                                <Link href={`/vendors/${service.vendor.slug}`} className="flex items-start gap-4 mb-6 group">
                                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 bg-blue-50/50 flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <Image
                                            src={service.vendor.logo}
                                            alt={service.vendor.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                                                {service.vendor.name}
                                            </span>
                                            {service.vendor.isVerified && (
                                                <BadgeCheck className="w-5 h-5 text-primary-500 fill-primary-500/10 flex-shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                                <span className="text-xs font-bold text-yellow-700">{service.vendor.rating}</span>
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium truncate">
                                                ({service.vendor.totalReviews} reviews)
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                                <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">{service.vendor.description}</p>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/50 text-center">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Services</div>
                                        <div className="text-lg font-black text-gray-900">{service.vendor.servicesCount}</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/50 text-center">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Followers</div>
                                        <div className="text-lg font-black text-gray-900">{service.vendor.followersCount}</div>
                                    </div>
                                </div>
                                <Link href={`/vendors/${service.vendor.slug}`} className="w-full py-3.5 rounded-xl bg-gray-900 text-white text-sm font-black flex items-center justify-center hover:bg-primary-600 transition-all shadow-lg active:scale-95">
                                    View Profile
                                </Link>
                            </div>

                            {/* Trust Badges */}
                            <div className="card">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Secure Payment</div>
                                            <div className="text-sm text-gray-500">Protected transactions</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                            <Award className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Verified Seller</div>
                                            <div className="text-sm text-gray-500">Identity confirmed</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            <AnimatePresence>
                {activeConversationId && user && (
                    <ChatWindow
                        conversationId={activeConversationId}
                        recipientName={service.vendor.name}
                        myUserId={user.id}
                        onClose={() => setActiveConversationId(null)}
                    />
                )}
            </AnimatePresence>

            {/* Request Quote Modal */}
            <AnimatePresence>
                {showRequestQuoteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowRequestQuoteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                                            <ClipboardList className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Request a Quote</h2>
                                            <p className="text-sm text-gray-500">Get a customized price for your project</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowRequestQuoteModal(false)}
                                        className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <form onSubmit={handleRequestQuote} className="p-6 space-y-5">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Name *</label>
                                        <input
                                            type="text"
                                            value={quoteFormData.name}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, name: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Email *</label>
                                        <input
                                            type="email"
                                            value={quoteFormData.email}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, email: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                                        <input
                                            type="tel"
                                            value={quoteFormData.phone}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, phone: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Company</label>
                                        <input
                                            type="text"
                                            value={quoteFormData.company}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, company: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                                            placeholder="Your Company"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Budget Range</label>
                                    <select
                                        value={quoteFormData.budget}
                                        onChange={(e) => setQuoteFormData({ ...quoteFormData, budget: e.target.value })}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                                    >
                                        <option value="">Select budget range</option>
                                        <option value="under-1000">Under $1,000</option>
                                        <option value="1000-5000">$1,000 - $5,000</option>
                                        <option value="5000-10000">$5,000 - $10,000</option>
                                        <option value="10000-25000">$10,000 - $25,000</option>
                                        <option value="25000-50000">$25,000 - $50,000</option>
                                        <option value="50000+">$50,000+</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Project Details *</label>
                                    <textarea
                                        rows={4}
                                        value={quoteFormData.message}
                                        onChange={(e) => setQuoteFormData({ ...quoteFormData, message: e.target.value })}
                                        className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium resize-none"
                                        placeholder="Describe your project requirements, timeline, and any specific features you need..."
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                    {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Book Demo Modal */}
            <AnimatePresence>
                {showBookDemoModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowBookDemoModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                                            <Video className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Book a Demo</h2>
                                            <p className="text-sm text-gray-500">Schedule a call with the vendor</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowBookDemoModal(false)}
                                        className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <form onSubmit={handleBookDemo} className="p-6 space-y-5">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Name *</label>
                                        <input
                                            type="text"
                                            value={quoteFormData.name}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, name: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Email *</label>
                                        <input
                                            type="email"
                                            value={quoteFormData.email}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, email: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                                        <input
                                            type="tel"
                                            value={quoteFormData.phone}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, phone: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Company</label>
                                        <input
                                            type="text"
                                            value={quoteFormData.company}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, company: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                                            placeholder="Your Company"
                                        />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Preferred Date *</label>
                                        <input
                                            type="date"
                                            value={quoteFormData.preferred_date}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, preferred_date: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Preferred Time</label>
                                        <select
                                            value={quoteFormData.preferred_time}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, preferred_time: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                                        >
                                            <option value="">Select time</option>
                                            <option value="09:00">9:00 AM</option>
                                            <option value="10:00">10:00 AM</option>
                                            <option value="11:00">11:00 AM</option>
                                            <option value="12:00">12:00 PM</option>
                                            <option value="14:00">2:00 PM</option>
                                            <option value="15:00">3:00 PM</option>
                                            <option value="16:00">4:00 PM</option>
                                            <option value="17:00">5:00 PM</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Additional Notes</label>
                                    <textarea
                                        rows={3}
                                        value={quoteFormData.message}
                                        onChange={(e) => setQuoteFormData({ ...quoteFormData, message: e.target.value })}
                                        className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium resize-none"
                                        placeholder="Any specific topics you'd like to discuss..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Calendar className="w-5 h-5" />
                                    )}
                                    {isSubmitting ? 'Booking...' : 'Book Demo Call'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
