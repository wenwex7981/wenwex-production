'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star, BadgeCheck, Users, MapPin, Calendar, Globe,
    ArrowRight, Package, Play, FolderOpen, Heart,
    FileText, Award, Download, ShieldCheck, Mail,
    ExternalLink, BookOpen, CheckCircle2, Loader2,
    Camera, Video, MessageSquare, ThumbsUp, Clock,
    Briefcase, Phone, Send, ChevronRight, Quote,
    ImageIcon, Film, X, ChevronLeft, Sparkles
} from 'lucide-react';
import { useCurrencyStore } from '@/lib/currency-store';
import { useState, useEffect } from 'react';
import { fetchVendorBySlug, checkIsFollowing, followVendor, unfollowVendor, getFollowerCount } from '@/lib/data-service';
import { DynamicFieldsDisplay, DynamicFieldsForm } from '@/lib/dynamic-fields';
import { useAuthStore } from '@/lib/auth-store';
import { getOrCreateConversation } from '@/lib/chat-service';
import { ChatWindow } from '@/components/ui/ChatWindow';
import { toast } from 'react-hot-toast';

// Tab Type
type TabType = 'overview' | 'portfolio' | 'photos' | 'videos' | 'reviews';

// Media Modal Component
function MediaModal({ isOpen, onClose, media, type }: {
    isOpen: boolean;
    onClose: () => void;
    media: string;
    type: 'image' | 'video';
}) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="max-w-5xl max-h-[90vh] w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    {type === 'image' ? (
                        <Image
                            src={media}
                            alt="Media"
                            width={1200}
                            height={800}
                            className="w-full h-auto rounded-2xl object-contain"
                        />
                    ) : (
                        <video
                            src={media}
                            controls
                            autoPlay
                            className="w-full h-auto rounded-2xl max-h-[80vh]"
                        />
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Review Card Component
function ReviewCard({ review }: { review: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card group hover:shadow-lg transition-all duration-300"
        >
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {review.userName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h4 className="font-semibold text-gray-900">{review.userName || 'Anonymous User'}</h4>
                            <p className="text-xs text-gray-500">{review.date || 'Recently'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>

                    {review.custom_fields && Object.keys(review.custom_fields).length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            <DynamicFieldsDisplay
                                entityType="reviews"
                                values={review.custom_fields}
                                variant="tags"
                            />
                        </div>
                    )}

                    {review.serviceTitle && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                            <Package className="w-3 h-3" />
                            {review.serviceTitle}
                        </div>
                    )}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 text-sm transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            Helpful ({review.helpfulCount || 0})
                        </button>
                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 text-sm transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            Reply
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function VendorProfilePage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const [vendor, setVendor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const { user, isAuthenticated } = useAuthStore();
    const formatPrice = useCurrencyStore((state) => state.formatPrice);

    // Review form state
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewCustomFields, setReviewCustomFields] = useState<Record<string, any>>({});


    // Complete mock vendor data for all agencies
    const mockVendors: Record<string, any> = {
        'techcraft-studios': {
            id: '1',
            slug: 'techcraft-studios',
            companyName: 'TechCraft Studios',
            logoUrl: 'https://ui-avatars.com/api/?name=TechCraft&background=0c8bff&color=fff&size=200',
            bannerUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920',
            description: 'Full-stack development agency specializing in enterprise solutions and e-commerce platforms. We build scalable, secure, and high-performance applications.',
            fullDescription: `TechCraft Studios is a leading full-stack development agency with over 8 years of experience delivering enterprise-grade solutions. Our team of 45+ developers, designers, and project managers work together to create exceptional digital products.

We specialize in building complex e-commerce platforms, SaaS applications, and custom enterprise software. Our technology stack includes React, Next.js, Node.js, Python, and cloud platforms like AWS and Google Cloud.

What sets us apart is our commitment to quality, transparent communication, and on-time delivery. We've successfully completed 500+ projects for clients across 30+ countries.`,
            location: 'San Francisco, USA',
            country: 'US',
            isVerified: true,
            rating: 4.9,
            totalReviews: 234,
            followersCount: 1250,
            memberSince: '2018',
            avgResponseTime: '1 hour',
            website: 'https://techcraft-studios.com',
            email: 'contact@techcraft-studios.com',
            phone: '+1 (415) 555-0123',
            founded: '2018',
            teamSize: '45-60',
            projectsCompleted: '500+',
            satisfactionRate: '99%',
            categories: ['Web Development', 'Mobile Apps', 'E-commerce'],
            services: [
                { id: 1, slug: 'enterprise-web-development', title: 'Enterprise Web Development', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', rating: 4.9, reviewCount: 89, price: 35 },
                { id: 2, slug: 'ecommerce-platform', title: 'E-commerce Platform Development', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', rating: 4.8, reviewCount: 67, price: 60 },
                { id: 3, slug: 'custom-crm', title: 'Custom CRM Solutions', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', rating: 5.0, reviewCount: 45, price: 42 },
                { id: 4, slug: 'api-development', title: 'API Development & Integration', imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400', rating: 4.9, reviewCount: 33, price: 24 },
            ],
            portfolio: [
                { id: 1, title: 'Global E-commerce Platform', thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', category: 'E-commerce' },
                { id: 2, title: 'FinTech Dashboard', thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', category: 'SaaS' },
                { id: 3, title: 'Healthcare Management System', thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', category: 'Healthcare' },
                { id: 4, title: 'Real Estate Marketplace', thumbnailUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800', category: 'Marketplace' },
                { id: 5, title: 'Food Delivery App', thumbnailUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', category: 'Mobile' },
                { id: 6, title: 'Learning Management System', thumbnailUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800', category: 'EdTech' },
            ],
            shorts: [],
            certifications: [
                { name: 'AWS Partner', issuer: 'Amazon', year: '2024' },
                { name: 'Google Cloud Partner', issuer: 'Google', year: '2023' },
                { name: 'ISO 27001', issuer: 'ISO', year: '2022' },
            ],
        },
        'appforge-inc': {
            id: '2',
            slug: 'appforge-inc',
            companyName: 'AppForge Inc',
            logoUrl: 'https://ui-avatars.com/api/?name=AppForge&background=22c55e&color=fff&size=200',
            bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920',
            description: 'Mobile-first development studio creating beautiful and performant applications for iOS, Android, and cross-platform solutions.',
            fullDescription: `AppForge Inc is a mobile-first development studio dedicated to creating exceptional mobile experiences. Founded in 2019, we've grown to become one of the most trusted names in mobile app development.

Our expertise spans native iOS (Swift), native Android (Kotlin), and cross-platform development using React Native and Flutter. We've launched over 200 apps with a combined 10M+ downloads on the App Store and Google Play.

We believe in user-centric design and pixel-perfect implementation. Every app we build is optimized for performance, accessibility, and user engagement.`,
            location: 'Toronto, Canada',
            country: 'CA',
            isVerified: true,
            rating: 4.8,
            totalReviews: 189,
            followersCount: 980,
            memberSince: '2019',
            avgResponseTime: '2 hours',
            website: 'https://appforge.io',
            email: 'hello@appforge.io',
            phone: '+1 (416) 555-0456',
            founded: '2019',
            teamSize: '30-45',
            projectsCompleted: '200+',
            satisfactionRate: '98%',
            categories: ['Mobile Apps', 'React Native', 'Flutter'],
            services: [
                { id: 1, slug: 'ios-app-development', title: 'iOS App Development', imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400', rating: 4.9, reviewCount: 72, price: 48 },
                { id: 2, slug: 'android-app-development', title: 'Android App Development', imageUrl: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400', rating: 4.8, reviewCount: 58, price: 42 },
                { id: 3, slug: 'react-native-development', title: 'React Native Development', imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', rating: 4.8, reviewCount: 41, price: 36 },
                { id: 4, slug: 'flutter-development', title: 'Flutter App Development', imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400', rating: 4.7, reviewCount: 28, price: 33 },
            ],
            portfolio: [
                { id: 1, title: 'Fitness Tracker Pro', thumbnailUrl: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800', category: 'Health & Fitness' },
                { id: 2, title: 'Social Media App', thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800', category: 'Social' },
                { id: 3, title: 'Banking Mobile App', thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800', category: 'Finance' },
                { id: 4, title: 'Food Ordering App', thumbnailUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', category: 'Food & Drink' },
            ],
            shorts: [],
            certifications: [
                { name: 'Apple Developer Enterprise', issuer: 'Apple', year: '2023' },
                { name: 'Google Play Partner', issuer: 'Google', year: '2024' },
            ],
        },
        'ai-solutions-lab': {
            id: '3',
            slug: 'ai-solutions-lab',
            companyName: 'AI Solutions Lab',
            logoUrl: 'https://ui-avatars.com/api/?name=AI+Lab&background=d946ef&color=fff&size=200',
            bannerUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1920',
            description: 'Cutting-edge AI/ML solutions for modern businesses and startups. We transform data into intelligent, actionable insights.',
            fullDescription: `AI Solutions Lab is at the forefront of artificial intelligence and machine learning innovation. Our team of PhD researchers and experienced engineers specializes in developing custom AI solutions that drive real business value.

From computer vision and natural language processing to predictive analytics and recommendation systems, we help businesses leverage the power of AI to automate processes, gain insights, and create competitive advantages.

We've worked with Fortune 500 companies and innovative startups alike, delivering solutions that have processed billions of data points and saved hundreds of thousands of hours.`,
            location: 'London, UK',
            country: 'UK',
            isVerified: true,
            rating: 4.9,
            totalReviews: 156,
            followersCount: 820,
            memberSince: '2020',
            avgResponseTime: '4 hours',
            website: 'https://ai-solutions-lab.com',
            email: 'research@ai-solutions-lab.com',
            phone: '+44 20 7946 0958',
            founded: '2020',
            teamSize: '25-40',
            projectsCompleted: '150+',
            satisfactionRate: '97%',
            categories: ['AI & ML', 'Data Science', 'Automation'],
            services: [
                { id: 1, slug: 'machine-learning-models', title: 'Custom ML Model Development', imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400', rating: 5.0, reviewCount: 54, price: 72 },
                { id: 2, slug: 'computer-vision', title: 'Computer Vision Solutions', imageUrl: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400', rating: 4.9, reviewCount: 38, price: 96 },
                { id: 3, slug: 'nlp-solutions', title: 'NLP & Chatbot Development', imageUrl: 'https://images.unsplash.com/photo-1676299081847-824916de030a?w=400', rating: 4.8, reviewCount: 42, price: 60 },
                { id: 4, slug: 'predictive-analytics', title: 'Predictive Analytics', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', rating: 4.9, reviewCount: 22, price: 48 },
            ],
            portfolio: [
                { id: 1, title: 'Fraud Detection System', thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800', category: 'Finance' },
                { id: 2, title: 'Medical Image Analysis', thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', category: 'Healthcare' },
                { id: 3, title: 'Smart Recommendation Engine', thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', category: 'E-commerce' },
                { id: 4, title: 'Autonomous Drone Navigation', thumbnailUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800', category: 'Robotics' },
            ],
            shorts: [],
            certifications: [
                { name: 'NVIDIA Partner', issuer: 'NVIDIA', year: '2024' },
                { name: 'Google AI Partner', issuer: 'Google', year: '2023' },
                { name: 'Microsoft AI Partner', issuer: 'Microsoft', year: '2023' },
            ],
        },
        'pixelperfect-design': {
            id: '4',
            slug: 'pixelperfect-design',
            companyName: 'PixelPerfect Design',
            logoUrl: 'https://ui-avatars.com/api/?name=PixelPerfect&background=f59e0b&color=fff&size=200',
            bannerUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1920',
            description: 'Premium UI/UX design agency serving global clients with top-tier designs that captivate users and drive conversions.',
            fullDescription: `PixelPerfect Design is a premium design agency that believes great design is not just about aesthetics—it's about creating meaningful experiences that connect with users on a deeper level.

Our multidisciplinary team includes UI/UX designers, brand strategists, motion designers, and front-end developers who collaborate to deliver cohesive, impactful designs. We follow a human-centered design approach, conducting thorough user research and testing to ensure our designs meet real user needs.

We've won multiple design awards including Awwwards, CSS Design Awards, and Webby Awards. Our work has been featured in design publications worldwide.`,
            location: 'Berlin, Germany',
            country: 'DE',
            isVerified: true,
            rating: 5.0,
            totalReviews: 312,
            followersCount: 1560,
            memberSince: '2017',
            avgResponseTime: '30 minutes',
            website: 'https://pixelperfect-design.de',
            email: 'studio@pixelperfect-design.de',
            phone: '+49 30 12345678',
            founded: '2017',
            teamSize: '35-50',
            projectsCompleted: '600+',
            satisfactionRate: '100%',
            categories: ['UI/UX Design', 'Branding', 'Web Design'],
            services: [
                { id: 1, slug: 'ui-ux-design', title: 'UI/UX Design', imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', rating: 5.0, reviewCount: 128, price: 30 },
                { id: 2, slug: 'brand-identity', title: 'Brand Identity Design', imageUrl: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=400', rating: 5.0, reviewCount: 95, price: 48 },
                { id: 3, slug: 'web-design', title: 'Website Design', imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400', rating: 4.9, reviewCount: 67, price: 24 },
                { id: 4, slug: 'motion-design', title: 'Motion & Animation Design', imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400', rating: 4.9, reviewCount: 22, price: 18 },
            ],
            portfolio: [
                { id: 1, title: 'Luxury Fashion Brand', thumbnailUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800', category: 'Branding' },
                { id: 2, title: 'Tech Startup Website', thumbnailUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800', category: 'Web Design' },
                { id: 3, title: 'Mobile Banking UX', thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800', category: 'UI/UX' },
                { id: 4, title: 'SaaS Dashboard Design', thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', category: 'UI/UX' },
                { id: 5, title: 'Restaurant Brand Identity', thumbnailUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', category: 'Branding' },
                { id: 6, title: 'E-commerce Redesign', thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', category: 'Web Design' },
            ],
            shorts: [],
            certifications: [
                { name: 'Awwwards Winner', issuer: 'Awwwards', year: '2024' },
                { name: 'CSS Design Awards', issuer: 'CSSDA', year: '2023' },
                { name: 'Webby Award', issuer: 'The Webby Awards', year: '2022' },
            ],
        },
        'cloudnine-devops': {
            id: '5',
            slug: 'cloudnine-devops',
            companyName: 'CloudNine DevOps',
            logoUrl: 'https://ui-avatars.com/api/?name=CloudNine&background=06b6d4&color=fff&size=200',
            bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920',
            description: 'Cloud infrastructure specialists helping companies scale with confidence. AWS, Azure, and GCP experts.',
            fullDescription: `CloudNine DevOps is your trusted partner for cloud infrastructure and DevOps excellence. We help organizations of all sizes modernize their infrastructure, implement CI/CD pipelines, and achieve true cloud-native operations.

Our team holds multiple certifications across AWS, Azure, and Google Cloud Platform. We specialize in Kubernetes, Docker, Terraform, and modern observability solutions. Whether you're migrating to the cloud or optimizing your existing infrastructure, we've got you covered.

We've helped clients reduce infrastructure costs by an average of 40% while improving reliability and deployment frequency by 10x.`,
            location: 'Seattle, USA',
            country: 'US',
            isVerified: true,
            rating: 4.7,
            totalReviews: 98,
            followersCount: 540,
            memberSince: '2021',
            avgResponseTime: '1 hour',
            website: 'https://cloudnine-devops.com',
            email: 'ops@cloudnine-devops.com',
            phone: '+1 (206) 555-0789',
            founded: '2021',
            teamSize: '20-30',
            projectsCompleted: '120+',
            satisfactionRate: '96%',
            categories: ['Cloud', 'DevOps', 'AWS'],
            services: [
                { id: 1, slug: 'aws-infrastructure', title: 'AWS Infrastructure Setup', imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', rating: 4.8, reviewCount: 42, price: 35 },
                { id: 2, slug: 'kubernetes-deployment', title: 'Kubernetes Deployment', imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400', rating: 4.7, reviewCount: 28, price: 42 },
                { id: 3, slug: 'cicd-pipeline', title: 'CI/CD Pipeline Setup', imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400', rating: 4.9, reviewCount: 19, price: 24 },
                { id: 4, slug: 'cloud-migration', title: 'Cloud Migration Services', imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400', rating: 4.6, reviewCount: 9, price: 60 },
            ],
            portfolio: [
                { id: 1, title: 'Enterprise Cloud Migration', thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800', category: 'Cloud' },
                { id: 2, title: 'Kubernetes Cluster Setup', thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800', category: 'DevOps' },
                { id: 3, title: 'Multi-Region Architecture', thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800', category: 'AWS' },
            ],
            shorts: [],
            certifications: [
                { name: 'AWS Solutions Architect', issuer: 'AWS', year: '2024' },
                { name: 'Google Cloud Professional', issuer: 'Google', year: '2023' },
                { name: 'Kubernetes Administrator', issuer: 'CNCF', year: '2023' },
            ],
        },
        'secureshield-cyber': {
            id: '6',
            slug: 'secureshield-cyber',
            companyName: 'SecureShield Cyber',
            logoUrl: 'https://ui-avatars.com/api/?name=SecureShield&background=ef4444&color=fff&size=200',
            bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920',
            description: 'Enterprise cybersecurity solutions protecting businesses worldwide. Penetration testing, compliance, and security audits.',
            fullDescription: `SecureShield Cyber is a leading cybersecurity firm dedicated to protecting organizations from evolving digital threats. Our team of certified ethical hackers and security consultants brings decades of combined experience in defending against cyberattacks.

We offer comprehensive security services including penetration testing, vulnerability assessments, security audits, compliance consulting (SOC 2, ISO 27001, GDPR), and incident response. Our 24/7 Security Operations Center monitors threats in real-time.

We've helped organizations across finance, healthcare, and technology sectors achieve robust security postures and maintain compliance with industry regulations.`,
            location: 'Sydney, Australia',
            country: 'AU',
            isVerified: true,
            rating: 4.8,
            totalReviews: 145,
            followersCount: 720,
            memberSince: '2019',
            avgResponseTime: '15 minutes',
            website: 'https://secureshield-cyber.com.au',
            email: 'security@secureshield-cyber.com.au',
            phone: '+61 2 8000 1234',
            founded: '2019',
            teamSize: '40-55',
            projectsCompleted: '300+',
            satisfactionRate: '99%',
            categories: ['Cybersecurity', 'Penetration Testing', 'Compliance'],
            services: [
                { id: 1, slug: 'penetration-testing', title: 'Penetration Testing', imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400', rating: 4.9, reviewCount: 67, price: 60 },
                { id: 2, slug: 'security-audit', title: 'Security Audit & Assessment', imageUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400', rating: 4.8, reviewCount: 45, price: 42 },
                { id: 3, slug: 'compliance-consulting', title: 'Compliance Consulting', imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400', rating: 4.7, reviewCount: 23, price: 35 },
                { id: 4, slug: 'incident-response', title: '24/7 Incident Response', imageUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400', rating: 5.0, reviewCount: 10, price: 120 },
            ],
            portfolio: [
                { id: 1, title: 'Banking Security Audit', thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800', category: 'Finance' },
                { id: 2, title: 'Healthcare Data Protection', thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', category: 'Healthcare' },
                { id: 3, title: 'E-commerce Security Review', thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', category: 'Retail' },
                { id: 4, title: 'Government Compliance', thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800', category: 'Government' },
            ],
            shorts: [],
            certifications: [
                { name: 'CISSP', issuer: 'ISC²', year: '2024' },
                { name: 'CEH', issuer: 'EC-Council', year: '2023' },
                { name: 'ISO 27001 Lead Auditor', issuer: 'PECB', year: '2022' },
            ],
        },
    };

    useEffect(() => {
        async function loadVendor() {
            // First check if slug matches a mock vendor
            if (mockVendors[slug]) {
                setVendor(mockVendors[slug]);
                setFollowerCount(mockVendors[slug].followersCount || 0);
                setIsLoading(false);
                return;
            }

            // Otherwise try to fetch from database
            try {
                const data = await fetchVendorBySlug(slug);
                if (data) {
                    setVendor(data);
                    setFollowerCount(data.followersCount || 0);

                    // Check if current user is following this vendor
                    if (user?.id && data.id) {
                        const following = await checkIsFollowing(data.id, user.id);
                        setIsFollowing(following);
                    }
                } else {
                    // Check if any mock vendor ID matches
                    const mockByIdVendor = Object.values(mockVendors).find((v: any) => v.id === slug);
                    if (mockByIdVendor) {
                        setVendor(mockByIdVendor);
                        setFollowerCount(mockByIdVendor.followersCount || 0);
                    }
                }
            } catch (error) {
                console.error('Error fetching vendor:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadVendor();
    }, [slug, user?.id]);

    const handleContact = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to contact the vendor');
            return;
        }
        if (!user || !vendor) return;

        try {
            const conversation = await getOrCreateConversation(user.id, vendor.id);
            setActiveConversationId(conversation.id);
            toast.success('Chat initiated!');
        } catch (error) {
            console.error('Error initiating chat:', error);
            toast.error('Failed to start chat');
        }
    };

    // Handle WhatsApp click
    const handleWhatsAppClick = () => {
        const whatsappNumber = vendor?.whatsapp_number || vendor?.phone;
        if (whatsappNumber) {
            const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
            const message = encodeURIComponent(`Hi, I'm interested in your services on WENWEX.`);
            window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
        } else {
            toast.error('WhatsApp number not available');
        }
    };

    // Handle Email click
    const handleEmailClick = () => {
        const vendorEmail = vendor?.email;
        if (vendorEmail) {
            const subject = encodeURIComponent(`Inquiry about services on WENWEX`);
            const body = encodeURIComponent(`Hi ${vendor?.companyName || 'there'},\n\nI'm interested in your services on WENWEX.\n\nPlease let me know more details.\n\nThank you!`);
            window.open(`mailto:${vendorEmail}?subject=${subject}&body=${body}`, '_blank');
        } else {
            toast.error('Email not available');
        }
    };

    // Handle review submission
    const handleSubmitReview = async () => {
        if (!isAuthenticated || !user) {
            toast.error('Please sign in to leave a review');
            return;
        }
        if (!reviewComment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        setIsSubmittingReview(true);
        try {
            const { getSupabaseClient } = await import('@/lib/supabase');
            const supabase = getSupabaseClient();

            const { error } = await supabase.from('reviews').insert({
                vendor_id: vendor.id,
                user_id: user.id,
                user_name: user.email?.split('@')[0] || 'Anonymous',
                rating: reviewRating,
                comment: reviewComment,
                custom_fields: reviewCustomFields,
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            toast.success('Review submitted successfully!');
            setReviewComment('');
            setReviewRating(5);
        } catch (error: any) {
            toast.error('Failed to submit review: ' + error.message);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // Mock data for demo purposes

    const mockReviews = [
        {
            id: 1,
            userName: 'Sarah Johnson',
            rating: 5,
            comment: 'Absolutely fantastic work! The team delivered beyond my expectations. Their attention to detail and professional approach made the entire process smooth and enjoyable.',
            date: 'Dec 15, 2025',
            serviceTitle: 'Web Development',
            helpfulCount: 24
        },
        {
            id: 2,
            userName: 'Michael Chen',
            rating: 4,
            comment: 'Great communication throughout the project. They were responsive to feedback and made adjustments quickly. Would definitely work with them again.',
            date: 'Dec 10, 2025',
            serviceTitle: 'Mobile App Design',
            helpfulCount: 18
        },
        {
            id: 3,
            userName: 'Emily Davis',
            rating: 5,
            comment: 'Professional, timely, and excellent quality. The final product exceeded all our requirements. Highly recommended for anyone looking for top-tier services.',
            date: 'Dec 5, 2025',
            serviceTitle: 'UI/UX Design',
            helpfulCount: 31
        },
        {
            id: 4,
            userName: 'Robert Wilson',
            rating: 5,
            comment: 'This vendor is incredible! They transformed our brand identity completely. The creativity and professionalism shown throughout the project were exceptional.',
            date: 'Nov 28, 2025',
            serviceTitle: 'Brand Identity',
            helpfulCount: 15
        }
    ];

    const mockPhotos = [
        { id: 1, url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', title: 'Project Alpha' },
        { id: 2, url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800', title: 'Design Work' },
        { id: 3, url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800', title: 'Team Meeting' },
        { id: 4, url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', title: 'Office Space' },
        { id: 5, url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800', title: 'Collaboration' },
        { id: 6, url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800', title: 'Workshop' },
        { id: 7, url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800', title: 'Presentation' },
        { id: 8, url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', title: 'Results' },
    ];

    const mockVideos = [
        { id: 1, url: '#', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', title: 'Company Introduction', duration: '2:45', views: 1250 },
        { id: 2, url: '#', thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', title: 'Project Showcase', duration: '5:30', views: 856 },
        { id: 3, url: '#', thumbnail: 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=800', title: 'Client Testimonial', duration: '3:15', views: 2100 },
        { id: 4, url: '#', thumbnail: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800', title: 'Behind the Scenes', duration: '4:20', views: 645 },
    ];

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: Briefcase },
        { id: 'portfolio' as TabType, label: 'Portfolio', icon: FolderOpen },
        { id: 'photos' as TabType, label: 'Photos', icon: Camera },
        { id: 'videos' as TabType, label: 'Videos', icon: Video },
        { id: 'reviews' as TabType, label: 'Reviews', icon: MessageSquare },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading vendor profile...</p>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                    <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Found</h1>
                <p className="text-gray-500 text-center max-w-md mb-6">
                    The vendor you're looking for doesn't exist or may have been removed.
                </p>
                <Link href="/vendors" className="btn-primary">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Browse All Vendors
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Media Modal */}
            <MediaModal
                isOpen={!!selectedMedia}
                onClose={() => setSelectedMedia(null)}
                media={selectedMedia?.url || ''}
                type={selectedMedia?.type || 'image'}
            />

            {/* Hero Banner */}
            <div className="relative h-56 md:h-72 lg:h-80 overflow-hidden">
                <Image
                    src={vendor.bannerUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920'}
                    alt="Banner"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />

                {/* Floating Stats on Banner */}
                <div className="absolute bottom-6 right-6 hidden lg:flex items-center gap-3">
                    <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-white">{vendor.rating || '4.9'}</span>
                        <span className="text-white/70 text-sm">({vendor.totalReviews || 128} reviews)</span>
                    </div>
                    <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="font-bold text-white">{followerCount.toLocaleString()}</span>
                        <span className="text-white/70 text-sm">followers</span>
                    </div>
                </div>
            </div>

            <div className="container-custom">
                {/* Profile Header Card */}
                <div className="relative -mt-20 md:-mt-24 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card shadow-xl border-0 p-6 md:p-8"
                    >
                        <div className="flex flex-col lg:flex-row items-start gap-6">
                            {/* Logo */}
                            <div className="relative">
                                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-white -mt-16 md:-mt-20">
                                    <Image
                                        src={vendor.logoUrl || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200'}
                                        alt={vendor.companyName}
                                        width={144}
                                        height={144}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {vendor.isVerified && (
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                        <BadgeCheck className="w-6 h-6 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                        {vendor.companyName || 'Premium Vendor'}
                                    </h1>
                                    {vendor.isVerified && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            VERIFIED
                                        </span>
                                    )}
                                </div>

                                <p className="text-gray-600 mb-4 max-w-2xl leading-relaxed">
                                    {vendor.description || 'A professional service provider delivering exceptional quality and results for clients worldwide.'}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span>{vendor.location || 'United States'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span>Member since {vendor.memberSince || '2023'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-green-600 font-medium">Usually responds within {vendor.avgResponseTime || '2 hours'}</span>
                                    </div>
                                </div>

                                {/* Mobile Stats */}
                                <div className="flex items-center gap-4 mt-4 lg:hidden">
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        <span className="font-bold text-gray-900">{vendor.rating || '4.9'}</span>
                                        <span className="text-gray-500 text-sm">({vendor.totalReviews || 128})</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-5 h-5 text-blue-500" />
                                        <span className="font-bold text-gray-900">{followerCount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 w-full lg:w-auto">
                                <button
                                    onClick={async () => {
                                        if (!isAuthenticated) {
                                            toast.error('Please sign in to follow this vendor');
                                            return;
                                        }
                                        if (!user?.id || !vendor?.id) return;

                                        setIsFollowLoading(true);
                                        try {
                                            if (isFollowing) {
                                                const success = await unfollowVendor(vendor.id, user.id);
                                                if (success) {
                                                    setIsFollowing(false);
                                                    setFollowerCount(prev => Math.max(0, prev - 1));
                                                    // Fetch real count from database
                                                    const realCount = await getFollowerCount(vendor.id);
                                                    if (realCount >= 0) setFollowerCount(realCount);
                                                    toast.success('Unfollowed successfully');
                                                }
                                            } else {
                                                const success = await followVendor(vendor.id, user.id);
                                                if (success) {
                                                    setIsFollowing(true);
                                                    setFollowerCount(prev => prev + 1);
                                                    // Fetch real count from database
                                                    const realCount = await getFollowerCount(vendor.id);
                                                    if (realCount >= 0) setFollowerCount(realCount);
                                                    toast.success('Now following ' + vendor.companyName);
                                                }
                                            }
                                        } catch (error) {
                                            toast.error('Action failed');
                                        } finally {
                                            setIsFollowLoading(false);
                                        }
                                    }}
                                    disabled={isFollowLoading}
                                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${isFollowing
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                                        } ${isFollowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isFollowLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Heart className={`w-5 h-5 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                                    )}
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>

                                {/* Contact Options */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Contact Seller</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {/* Chat Button */}
                                        <button
                                            onClick={handleContact}
                                            className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-gray-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <MessageSquare className="w-5 h-5 text-white" />
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
                                        <a
                                            href={vendor.website || '#'}
                                            target="_blank"
                                            rel="noopener"
                                            onClick={(e) => {
                                                if (!vendor.website) {
                                                    e.preventDefault();
                                                    toast.error('Website not available');
                                                }
                                            }}
                                            className="flex flex-col items-center gap-1.5 p-3 bg-purple-50 hover:bg-purple-100 rounded-2xl border border-purple-100 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Globe className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">Website</span>
                                        </a>
                                    </div>

                                    {/* Share Profile Button */}
                                    <button
                                        onClick={async () => {
                                            const shareUrl = window.location.href;
                                            const shareText = `Check out ${vendor.companyName} on WENWEX - Professional service provider`;

                                            // Try native share first (mobile)
                                            if (navigator.share) {
                                                try {
                                                    await navigator.share({
                                                        title: vendor.companyName,
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
                                                    toast.success('Profile link copied to clipboard!');
                                                } catch (err) {
                                                    toast.error('Failed to copy link');
                                                }
                                            }
                                        }}
                                        className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all text-gray-700 font-semibold"
                                    >
                                        <Send className="w-4 h-4" />
                                        Share Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {
                        [
                            { label: 'Services', value: vendor.services?.length || 12, icon: Package, color: 'blue' },
                            { label: 'Portfolio', value: vendor.portfolio?.length || 48, icon: FolderOpen, color: 'purple' },
                            { label: 'Photos', value: mockPhotos.length, icon: Camera, color: 'pink' },
                            { label: 'Reviews', value: vendor.totalReviews || 128, icon: Star, color: 'yellow' },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className="card hover:shadow-lg transition-all duration-300 group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                        stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                            stat.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                                                'bg-yellow-100 text-yellow-600'
                                        }`}>
                                        <stat.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                                        <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    }
                </motion.div >

                {/* Tabs Navigation */}
                < motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 mb-8 overflow-x-auto"
                >
                    <div className="flex items-center gap-2 min-w-max">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </motion.div >

                {/* Tab Content */}
                < AnimatePresence mode="wait" >
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid lg:grid-cols-3 gap-8"
                        >
                            {/* Left Column */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* About Section */}
                                <section className="card">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-blue-500" />
                                        About
                                    </h2>
                                    {vendor.custom_fields && Object.keys(vendor.custom_fields).length > 0 && (
                                        <div className="mb-6 bg-purple-50/50 rounded-2xl p-4 border border-purple-100/50">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles className="w-4 h-4 text-purple-600" />
                                                <span className="text-xs font-black text-purple-600 uppercase tracking-widest">Premium Specifications</span>
                                            </div>
                                            <DynamicFieldsDisplay
                                                entityType="vendors"
                                                values={vendor.custom_fields}
                                            />
                                        </div>
                                    )}
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        {vendor.fullDescription || vendor.description || `We are a passionate team of professionals dedicated to delivering exceptional services to our clients. With years of experience in the industry, we have successfully completed numerous projects across various domains.

Our commitment to quality, innovation, and customer satisfaction has earned us a reputation as a trusted partner for businesses of all sizes. We believe in building long-term relationships with our clients through transparent communication and consistent delivery of results.`}
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { label: 'Founded', value: vendor.founded || '2020' },
                                            { label: 'Team Size', value: vendor.teamSize || '15-30' },
                                            { label: 'Projects Done', value: vendor.projectsCompleted || '250+' },
                                            { label: 'Satisfaction Rate', value: vendor.satisfactionRate || '98%' },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                <div>
                                                    <span className="text-gray-500 text-sm">{item.label}:</span>
                                                    <span className="text-gray-900 font-semibold ml-2">{item.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Services Preview */}
                                <section className="card">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <Package className="w-5 h-5 text-blue-500" />
                                            Popular Services
                                        </h2>
                                        <Link href={`/vendors/${vendor.slug}/services`} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                                            View All <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {(vendor.services?.slice(0, 4) || []).map((service: any) => (
                                            <Link
                                                key={service.id}
                                                href={`/services/${service.slug}`}
                                                className="group flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300"
                                            >
                                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                                    <Image
                                                        src={service.imageUrl || service.main_image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200'}
                                                        alt={service.title}
                                                        width={64}
                                                        height={64}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                        {service.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm mt-1">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="font-medium text-gray-900">{service.rating}</span>
                                                        <span className="text-gray-400">({service.reviewCount || 0})</span>
                                                    </div>
                                                    <p className="text-blue-600 font-bold mt-1">From {formatPrice(service.price)}</p>
                                                </div>
                                            </Link>
                                        ))}
                                        {(!vendor.services || vendor.services.length === 0) && (
                                            <div className="col-span-2 text-center py-8 text-gray-500">
                                                No services available yet
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Latest Reviews Preview */}
                                <section className="card">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-blue-500" />
                                            Recent Reviews
                                        </h2>
                                        <button
                                            onClick={() => setActiveTab('reviews')}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                        >
                                            View All <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {mockReviews.slice(0, 2).map((review) => (
                                            <div key={review.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                        {review.userName.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{review.date}</span>
                                                </div>
                                                <p className="text-gray-600 text-sm line-clamp-2">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Right Sidebar */}
                            <div className="space-y-6">
                                {/* Certifications */}
                                <div className="card">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-blue-500" />
                                        Certifications
                                    </h3>
                                    <div className="space-y-3">
                                        {(vendor.certifications || [
                                            { name: 'ISO 9001:2015', issuer: 'SGS', year: '2024' },
                                            { name: 'AWS Partner', issuer: 'Amazon', year: '2023' },
                                            { name: 'Google Cloud', issuer: 'Google', year: '2024' },
                                        ]).map((cert: any, index: number) => (
                                            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <BadgeCheck className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 text-sm">{cert.name}</div>
                                                    <div className="text-xs text-gray-500">{cert.issuer} • {cert.year}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="card">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        Documents
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { title: 'Company Profile', type: 'PDF', size: '2.5 MB' },
                                            { title: 'Portfolio Presentation', type: 'PDF', size: '8.2 MB' },
                                            { title: 'Price Catalog', type: 'PDF', size: '1.1 MB' },
                                        ].map((doc, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:shadow-md transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-red-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 text-sm">{doc.title}</div>
                                                        <div className="text-xs text-gray-500">{doc.type} • {doc.size}</div>
                                                    </div>
                                                </div>
                                                <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact Card */}
                                <div className="card bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl -ml-12 -mb-12" />
                                    <h3 className="text-lg font-bold mb-4 relative z-10">Quick Contact</h3>
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email</div>
                                                <div className="text-sm">{vendor.email || 'contact@vendor.com'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Phone</div>
                                                <div className="text-sm">{vendor.phone || '+1 (555) 123-4567'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-full mt-6 py-3 rounded-xl bg-white text-gray-900 font-bold hover:bg-blue-50 transition-colors relative z-10 shadow-xl">
                                        Send Message
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {
                        activeTab === 'portfolio' && (
                            <motion.div
                                key="portfolio"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(vendor.portfolio?.length > 0 ? vendor.portfolio : [
                                        { id: 1, title: 'E-Commerce Platform', thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', category: 'Web Development' },
                                        { id: 2, title: 'Mobile Banking App', thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800', category: 'Mobile App' },
                                        { id: 3, title: 'Brand Identity Design', thumbnailUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800', category: 'Branding' },
                                        { id: 4, title: 'SaaS Dashboard', thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', category: 'UI/UX Design' },
                                        { id: 5, title: 'Marketing Website', thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800', category: 'Web Development' },
                                        { id: 6, title: 'Healthcare Portal', thumbnailUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800', category: 'Web Development' },
                                    ]).map((item: any, index: number) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group cursor-pointer"
                                            onClick={() => setSelectedMedia({ url: item.thumbnailUrl, type: 'image' })}
                                        >
                                            <div className="card-interactive p-0 overflow-hidden">
                                                <div className="relative aspect-video overflow-hidden">
                                                    <Image
                                                        src={item.thumbnailUrl}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                            <ExternalLink className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">{item.category || 'Project'}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'photos' && (
                            <motion.div
                                key="photos"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {mockPhotos.map((photo, index) => (
                                        <motion.div
                                            key={photo.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="group cursor-pointer"
                                            onClick={() => setSelectedMedia({ url: photo.url, type: 'image' })}
                                        >
                                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                                                <Image
                                                    src={photo.url}
                                                    alt={photo.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                                                        <ImageIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2 font-medium text-center">{photo.title}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'videos' && (
                            <motion.div
                                key="videos"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {/* Vendor Shorts */}
                                    {vendor.shorts?.length > 0 && (
                                        <div className="col-span-full mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <Play className="w-5 h-5 text-blue-500" />
                                                Shorts
                                            </h3>
                                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                                {vendor.shorts.map((short: any) => (
                                                    <Link
                                                        key={short.id}
                                                        href={`/shorts?id=${short.id}`}
                                                        className="relative flex-shrink-0 w-44 aspect-[9/16] rounded-2xl overflow-hidden bg-black group"
                                                    >
                                                        <Image
                                                            src={short.thumbnailUrl}
                                                            alt={short.title}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                                            <p className="text-white text-xs font-bold line-clamp-2">{short.title}</p>
                                                            <p className="text-white/70 text-xs mt-1">{(short.viewCount / 1000).toFixed(1)}K views</p>
                                                        </div>
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                                <Play className="w-6 h-6 text-white fill-white ml-1" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Video Grid */}
                                    {mockVideos.map((video, index) => (
                                        <motion.div
                                            key={video.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group cursor-pointer"
                                        >
                                            <div className="card-interactive p-0 overflow-hidden">
                                                <div className="relative aspect-video overflow-hidden">
                                                    <Image
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                                            <Play className="w-7 h-7 text-blue-600 fill-blue-600 ml-1" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/70 text-white text-xs font-medium">
                                                        {video.duration}
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{video.title}</h3>
                                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {video.views.toLocaleString()} views
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'reviews' && (
                            <motion.div
                                key="reviews"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                {/* Review Stats */}
                                <div className="card mb-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                                                <span className="text-5xl font-bold text-gray-900">{vendor.rating || '4.9'}</span>
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-6 h-6 ${i < Math.round(vendor.rating || 4.9) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">{vendor.totalReviews || 128} reviews</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { stars: 5, percent: 78 },
                                                { stars: 4, percent: 15 },
                                                { stars: 3, percent: 5 },
                                                { stars: 2, percent: 1 },
                                                { stars: 1, percent: 1 },
                                            ].map((item) => (
                                                <div key={item.stars} className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-600 w-12">{item.stars} star</span>
                                                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-yellow-400"
                                                            style={{ width: `${item.percent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-500 w-10">{item.percent}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Reviews List */}
                                <div className="space-y-4">
                                    {mockReviews.map((review) => (
                                        <ReviewCard key={review.id} review={review} />
                                    ))}
                                </div>

                                {/* Write a Review */}
                                <div className="card mt-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-blue-500" />
                                        Write a Review
                                    </h3>

                                    {/* Rating Selector */}
                                    <div className="mb-4">
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Your Rating</label>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        className={`w-8 h-8 transition-colors ${star <= reviewRating
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300 hover:text-yellow-300'
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                            <span className="ml-3 text-sm text-gray-600 font-medium">
                                                {reviewRating === 5 ? 'Excellent' : reviewRating === 4 ? 'Very Good' : reviewRating === 3 ? 'Good' : reviewRating === 2 ? 'Fair' : 'Poor'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Comment Box */}
                                    <div className="mb-4">
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Your Comment</label>
                                        <textarea
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Share your experience with this agency..."
                                            className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[120px] resize-none text-gray-800"
                                        />
                                    </div>

                                    {/* Custom Review Fields */}
                                    <div className="mb-6">
                                        <DynamicFieldsForm
                                            entityType="reviews"
                                            values={reviewCustomFields}
                                            onChange={(name, value) => setReviewCustomFields(prev => ({
                                                ...prev,
                                                [name]: value
                                            }))}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleSubmitReview}
                                        disabled={isSubmittingReview || !reviewComment.trim()}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmittingReview ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Submit Review
                                            </>
                                        )}
                                    </button>

                                    {!isAuthenticated && (
                                        <p className="text-sm text-gray-500 mt-3">
                                            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Sign in</Link> to leave a review
                                        </p>
                                    )}
                                </div>

                                {/* Load More */}
                                <div className="text-center mt-8">
                                    <button className="btn-outline px-8">
                                        Load More Reviews
                                    </button>
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence >

                {/* Bottom Spacer */}
                < div className="h-16" />
            </div >

            {/* Chat Window */}
            <AnimatePresence>
                {
                    activeConversationId && user && (
                        <ChatWindow
                            conversationId={activeConversationId}
                            recipientName={vendor.companyName}
                            myUserId={user.id}
                            onClose={() => setActiveConversationId(null)}
                        />
                    )
                }
            </AnimatePresence >
        </div >
    );
}
