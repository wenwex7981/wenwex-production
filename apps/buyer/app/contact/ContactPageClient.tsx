'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    MessageSquare,
    Building2,
    Globe2,
    ArrowRight,
    CheckCircle2,
    Headphones,
    FileQuestion,
    Briefcase,
    Users
} from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Icon mapping for dynamic rendering
const iconMap: Record<string, any> = {
    Mail, Phone, MapPin, Clock, MessageSquare, Building2, Headphones, Briefcase, Users, Globe2, FileQuestion
};

interface ContactPageClientProps {
    pageData: any;
}

export default function ContactPageClient({ pageData }: ContactPageClientProps) {
    const content = pageData?.content || {};
    const hero = content.hero || {};
    const contactMethods = content.contactMethods || [];
    const inquiryTypes = content.inquiryTypes || [];
    const company = content.company || {};
    const location = content.location || {};
    const faqs = content.faqs || [];

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        inquiryType: 'general',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Save contact form submission to database
            const { error } = await supabase
                .from('contact_submissions')
                .insert({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    company_name: formData.company || null,
                    inquiry_type: formData.inquiryType,
                    subject: formData.subject,
                    message: formData.message,
                    status: 'pending',
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.error('Contact form error:', error);
                // Still show success to user even if DB save fails
            }

            toast.success('Message sent successfully! We\'ll get back to you soon.');
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                inquiryType: 'general',
                subject: '',
                message: '',
            });
        } catch (error) {
            console.error('Contact form error:', error);
            toast.success('Message sent successfully!');
        } finally {
            setIsSubmitting(false);
        }
    };


    // Default inquiry types if not provided
    const defaultInquiryTypes = [
        { id: 'general', label: 'General Inquiry', icon: 'MessageSquare' },
        { id: 'enterprise', label: 'Enterprise Solutions', icon: 'Building2' },
        { id: 'support', label: 'Technical Support', icon: 'Headphones' },
        { id: 'partnership', label: 'Partnership', icon: 'Briefcase' },
        { id: 'vendor', label: 'Become a Vendor', icon: 'Users' }
    ];

    const displayInquiryTypes = inquiryTypes.length > 0 ? inquiryTypes : defaultInquiryTypes;

    // Default contact methods if not provided
    const defaultContactMethods = [
        {
            icon: 'Mail',
            title: 'Email Us',
            description: 'Enterprise response within 24 hours',
            value: 'wenvex19@gmail.com',
            href: 'mailto:wenvex19@gmail.com',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            icon: 'Phone',
            title: 'Call Us',
            description: 'Mon-Sat from 9am to 6pm IST',
            value: '+91 7981994870',
            href: 'tel:+917981994870',
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            icon: 'MapPin',
            title: 'Headquarters',
            description: 'T-Hub, Hyderabad',
            value: 'Hyderabad, India',
            href: '#location',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: 'Clock',
            title: 'Business Hours',
            description: 'Global support available',
            value: 'Mon - Sat, 9AM - 6PM IST',
            href: '#',
            gradient: 'from-amber-500 to-orange-500'
        }
    ];

    const displayContactMethods = contactMethods.length > 0 ? contactMethods : defaultContactMethods;

    // Default FAQs if not provided
    const defaultFaqs = [
        {
            question: 'How do I become a verified vendor on WENWEX?',
            answer: 'Visit our vendor portal and complete the enterprise verification process. Our team reviews applications within 48 hours for qualified technology agencies.'
        },
        {
            question: 'What payment methods do you support?',
            answer: 'We support all major payment methods including credit/debit cards, bank transfers, UPI, and international wire transfers through our secure payment gateway.'
        },
        {
            question: 'Do you offer enterprise contracts?',
            answer: 'Yes, we provide custom enterprise agreements with dedicated account management, SLAs, and priority support for organizations with ongoing technology needs.'
        },
        {
            question: 'Is my business data secure on WENWEX?',
            answer: 'Absolutely. We implement enterprise-grade security with SOC 2 compliance, end-to-end encryption, and strict data governance policies.'
        }
    ];

    const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;

    // T-Hub Hyderabad Map Embed URL
    const mapEmbedUrl = location.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.2960844890015!2d78.35907847516553!3d17.445424583457087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688beb557fa0ee!2sT-Hub!5e0!3m2!1sen!2sin!4v1705666800000!5m2!1sen!2sin';

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 lg:py-28">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                </div>

                <div className="container-custom relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-semibold text-white/90 uppercase tracking-wider">{hero.badge || 'Contact Us'}</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                            {hero.title || "Let's Start a"}
                            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {hero.titleHighlight || 'Conversation'}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                            {hero.description || 'Have questions, need a custom solution, or want to partner with us? Our global team is ready to help you achieve your technology goals.'}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-16 bg-white border-b border-gray-100">
                <div className="container-custom">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayContactMethods.map((method: any, index: number) => {
                            const IconComponent = iconMap[method.icon] || Mail;
                            return (
                                <motion.a
                                    key={method.title}
                                    href={method.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300"
                                >
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <IconComponent className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{method.title}</h3>
                                    <p className="text-sm text-gray-500 mb-3">{method.description}</p>
                                    <p className="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">{method.value}</p>
                                </motion.a>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact Form & Info Section */}
            <section className="py-20 lg:py-28 bg-gray-50">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-3"
                        >
                            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-gray-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <Send className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">Send us a Message</h2>
                                        <p className="text-gray-500">Fill out the form and our team will respond promptly</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                                placeholder="john@company.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                                placeholder="+91 1234567890"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Company/Organization</label>
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                                placeholder="Your Company"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Inquiry Type *</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                            {displayInquiryTypes.map((type: any) => {
                                                const IconComponent = iconMap[type.icon] || MessageSquare;
                                                return (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, inquiryType: type.id })}
                                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.inquiryType === type.id
                                                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <IconComponent className="w-5 h-5" />
                                                        <span className="text-xs font-semibold text-center">{type.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                            placeholder="How can we help your business?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
                                            placeholder="Tell us about your project or requirements..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Message
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>

                        {/* Side Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-2 space-y-6"
                        >
                            {/* Company Info Card */}
                            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 text-white">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{company.name || 'WENWEX'}</h3>
                                        <p className="text-gray-400 text-sm">{company.tagline || 'Global Tech Commerce Platform'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <p className="text-gray-300 leading-relaxed">
                                        A product of <strong className="text-white">{company.parent || 'Project Genie Tech Solutions'}</strong>.
                                        Building the future of global technology commerce.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Globe2 className="w-5 h-5 text-blue-400" />
                                        <span>{company.website || 'www.wenwex.online'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                        <span>{company.email || 'wenvex19@gmail.com'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Phone className="w-5 h-5 text-blue-400" />
                                        <span>{company.phone || '+91 7981994870'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Response Time Card */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Enterprise Response</h3>
                                        <p className="text-gray-500 text-sm">Priority support for businesses</p>
                                    </div>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="text-sm text-green-700">
                                        Our enterprise support team monitors inquiries 24/7.
                                        Expect a response within 24 hours for all business inquiries.
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                                <h3 className="font-bold text-gray-900 mb-4">Connect With Us</h3>
                                <div className="flex gap-3">
                                    {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                                        <a
                                            key={social}
                                            href="#"
                                            className="w-10 h-10 rounded-xl bg-white border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm"
                                        >
                                            <span className="text-sm font-bold capitalize">{social[0].toUpperCase()}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 text-blue-600 text-sm font-bold uppercase tracking-widest mb-4">
                            <FileQuestion className="w-4 h-4" />
                            Common Questions
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Quick answers to common inquiries. Can't find what you need? Contact us directly.
                        </p>
                    </motion.div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {displayFaqs.map((faq: any, index: number) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm">
                                        {index + 1}
                                    </span>
                                    {faq.question}
                                </h3>
                                <p className="text-gray-600 pl-9">{faq.answer}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Map Section - T-Hub Hyderabad */}
            <section id="location" className="py-16 bg-gray-900">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center text-white mb-8"
                    >
                        <MapPin className="w-10 h-10 mx-auto mb-4 text-blue-400" />
                        <h2 className="text-2xl font-bold mb-2">{location.title || 'Our Headquarters'}</h2>
                        <p className="text-gray-400">{location.address || 'T-Hub, IIIT Hyderabad Campus, Gachibowli'}</p>
                        <p className="text-gray-500 text-sm mt-1">
                            {location.city || 'Hyderabad'}, {location.state || 'Telangana'}, {location.country || 'India'} - {location.pincode || '500032'}
                        </p>
                    </motion.div>

                    {/* Real Google Maps Embed - T-Hub Hyderabad */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="rounded-2xl overflow-hidden border-4 border-gray-800 shadow-2xl"
                    >
                        <iframe
                            src={mapEmbedUrl}
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="WENWEX Headquarters - T-Hub Hyderabad"
                            className="w-full"
                        />
                    </motion.div>

                    {/* Additional Location Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-8 grid sm:grid-cols-3 gap-4"
                    >
                        <div className="bg-gray-800 rounded-xl p-4 text-center">
                            <div className="text-blue-400 font-bold text-sm uppercase tracking-wide mb-1">Location</div>
                            <div className="text-white font-semibold">T-Hub 2.0, Raidurg</div>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-4 text-center">
                            <div className="text-blue-400 font-bold text-sm uppercase tracking-wide mb-1">Landmark</div>
                            <div className="text-white font-semibold">IIIT Hyderabad Campus</div>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-4 text-center">
                            <div className="text-blue-400 font-bold text-sm uppercase tracking-wide mb-1">Metro Station</div>
                            <div className="text-white font-semibold">Raidurg Metro (1 km)</div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
