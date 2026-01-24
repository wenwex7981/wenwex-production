'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    HelpCircle,
    MessageCircle,
    FileText,
    Package,
    CreditCard,
    User,
    ChevronDown,
    ChevronRight,
    Mail,
    Phone,
    ArrowRight,
    ShieldCheck,
    Truck,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// Mock Data for specific page
const categories = [
    {
        icon: Package,
        title: "Orders & Delivery",
        desc: "Track status, shipping info, and delivery timelines",
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        icon: RefreshCw,
        title: "Returns & Refunds",
        desc: "Return policies, refund status, and cancellations",
        color: "text-green-600",
        bg: "bg-green-50"
    },
    {
        icon: User,
        title: "Account & Profile",
        desc: "Login issues, password reset, and profile settings",
        color: "text-purple-600",
        bg: "bg-purple-50"
    },
    {
        icon: CreditCard,
        title: "Payments & Billing",
        desc: "Payment methods, invoices, and billing questions",
        color: "text-orange-600",
        bg: "bg-orange-50"
    },
    {
        icon: ShieldCheck,
        title: "Safety & Privacy",
        desc: "Account security, data privacy, and safe shopping",
        color: "text-red-600",
        bg: "bg-red-50"
    },
    {
        icon: MessageCircle,
        title: "Vendor Support",
        desc: "Contacting vendors, service disputes, and chats",
        color: "text-indigo-600",
        bg: "bg-indigo-50"
    }
];

const faqs = [
    {
        question: "How do I track my order?",
        answer: "You can track your order by going to the 'My Orders' section in your account profile. Click on the specific order to see real-time status updates and delivery estimates."
    },
    {
        question: "What is the refund policy?",
        answer: "We offer a 7-day money-back guarantee for most services if the delivered work does not meet the agreed-upon requirements. Please visit our Refund Policy page for detailed terms."
    },
    {
        question: "How can I contact a vendor directly?",
        answer: "You can chat with any vendor by visiting their profile page and clicking the 'Contact' or 'Message' button. All communication is secure and monitored for your safety."
    },
    {
        question: "Are my payments secure?",
        answer: "Yes, WENWEX uses industry-standard encryption and trusted payment gateways (like Razorpay and Dodo Payments) to ensure your financial data is always protected."
    },
    {
        question: "How do I become a vendor?",
        answer: "To become a vendor, scroll to the bottom of the page and click 'Become a Seller'. You'll need to complete a brief onboarding process and verify your business credentials."
    }
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative bg-primary-900 text-white py-24 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                    <div className="absolute top-[-50%] left-[-20%] w-[1000px] h-[1000px] rounded-full bg-blue-600 blur-[100px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600 blur-[100px]" />
                </div>

                <div className="container-custom relative z-10 text-center max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6">
                            24/7 Support Center
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                            How can we help you?
                        </h1>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            Search our knowledge base or browse common topics below to find the answers you need.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <input
                                type="text"
                                placeholder="Search for answers (e.g., 'refunds', 'delivery')..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 rounded-2xl text-gray-900 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/30 text-lg transition-all"
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="container-custom py-16 -mt-10 relative z-20">
                {/* Features Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <cat.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                {cat.title}
                            </h3>
                            <p className="text-gray-500 leading-relaxed">
                                {cat.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-24">
                    {/* FAQs */}
                    <div className="lg:col-span-8">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-gray-900 mb-3">Frequently Asked Questions</h2>
                            <p className="text-gray-500">Quick answers to the most common questions our users have.</p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <button
                                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <span className={`font-bold text-lg ${openFaqIndex === index ? 'text-primary-600' : 'text-gray-900'}`}>
                                            {faq.question}
                                        </span>
                                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {openFaqIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden bg-gray-50"
                                            >
                                                <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-primary-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-700/50 rounded-bl-full" />

                            <h3 className="text-2xl font-black mb-4 relative z-10">Still need help?</h3>
                            <p className="text-primary-200 mb-8 relative z-10 leading-relaxed">
                                Our support team is available 24/7 to assist you with any issues you might have.
                            </p>

                            <div className="space-y-4 relative z-10">
                                <Link
                                    href="/contact"
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-primary-900" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-medium text-primary-200 uppercase tracking-wider mb-0.5">Email Support</span>
                                        <span className="font-bold">support@wenwex.com</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>

                                <Link
                                    href="/contact"
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-primary-900" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-medium text-primary-200 uppercase tracking-wider mb-0.5">Call Us</span>
                                        <span className="font-bold">+1 (555) 123-4567</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 p-8 rounded-[2.5rem]">
                            <h4 className="font-bold text-gray-900 mb-2">Community Forum</h4>
                            <p className="text-sm text-gray-500 mb-6">Connect with other users and vendors to share experiences and get tips.</p>
                            <button className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-900 font-bold hover:bg-gray-50 transition-colors shadow-sm">
                                Visit Community
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-24 text-center pb-12">
                    <p className="text-gray-400 mb-4 font-medium">Can't find what you're looking for?</p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 text-primary-600 font-black hover:underline text-lg"
                    >
                        Submit a Request <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
