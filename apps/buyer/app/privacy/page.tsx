'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, UserCheck, Globe2, Mail, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
    const lastUpdated = 'January 19, 2026';

    const sections = [
        {
            icon: Database,
            title: '1. Information We Collect',
            content: [
                {
                    subtitle: '1.1 Personal Information',
                    text: 'When you register for an account, place an order, or contact us, we may collect: Full name, Email address, Phone number, Billing and shipping address, Payment information (processed securely via Razorpay), Company/organization name (for vendors), Government-issued identification (for vendor verification).'
                },
                {
                    subtitle: '1.2 Automatically Collected Information',
                    text: 'We automatically collect certain information when you visit our platform: IP address, Browser type and version, Device information, Pages visited and time spent, Referring website, Cookies and similar tracking technologies.'
                },
                {
                    subtitle: '1.3 Vendor-Specific Information',
                    text: 'If you register as a vendor/agency, we additionally collect: Business registration documents, PAN/TAN details (for Indian businesses), Portfolio and work samples, Bank account details for payouts.'
                }
            ]
        },
        {
            icon: Eye,
            title: '2. How We Use Your Information',
            content: [
                {
                    subtitle: '2.1 To Provide Services',
                    text: 'We use your information to: Process orders and transactions, Facilitate communication between buyers and vendors, Verify vendor identities and qualifications, Provide customer support, Send order updates and notifications.'
                },
                {
                    subtitle: '2.2 To Improve Our Platform',
                    text: 'We analyze usage data to: Enhance user experience, Develop new features, Optimize platform performance, Personalize content and recommendations.'
                },
                {
                    subtitle: '2.3 Marketing Communications',
                    text: 'With your consent, we may send: Promotional emails about new services, Newsletter updates, Special offers and discounts. You can opt-out of marketing communications at any time.'
                }
            ]
        },
        {
            icon: Lock,
            title: '3. Data Security',
            content: [
                {
                    subtitle: '3.1 Security Measures',
                    text: 'We implement industry-standard security measures including: SSL/TLS encryption for all data transmission, Secure payment processing via Razorpay (PCI-DSS compliant), Regular security audits and vulnerability assessments, Access controls and authentication protocols, Encrypted data storage.'
                },
                {
                    subtitle: '3.2 Data Breach Protocol',
                    text: 'In the unlikely event of a data breach, we will: Notify affected users within 72 hours, Report to relevant authorities as required by law, Take immediate steps to contain and remediate the breach, Provide guidance on protective measures.'
                }
            ]
        },
        {
            icon: UserCheck,
            title: '4. Data Sharing and Disclosure',
            content: [
                {
                    subtitle: '4.1 Third-Party Service Providers',
                    text: 'We may share data with trusted partners who assist us in: Payment processing (Razorpay), Email delivery services, Analytics and performance monitoring, Cloud hosting (Vercel, Supabase). These providers are contractually obligated to protect your data.'
                },
                {
                    subtitle: '4.2 Legal Requirements',
                    text: 'We may disclose information when required by: Court orders or legal process, Government authorities, To protect our rights or safety, To prevent fraud or abuse.'
                },
                {
                    subtitle: '4.3 Business Transfers',
                    text: 'In the event of a merger, acquisition, or sale of assets, user data may be transferred to the acquiring entity with prior notice.'
                }
            ]
        },
        {
            icon: Globe2,
            title: '5. Your Rights',
            content: [
                {
                    subtitle: '5.1 Access and Portability',
                    text: 'You have the right to: Request a copy of your personal data, Export your data in a machine-readable format, Know what information we hold about you.'
                },
                {
                    subtitle: '5.2 Correction and Deletion',
                    text: 'You can: Update or correct inaccurate information, Request deletion of your account and data, Withdraw consent for data processing (where applicable).'
                },
                {
                    subtitle: '5.3 Opt-Out Rights',
                    text: 'You may opt out of: Marketing emails (via unsubscribe link), Cookie tracking (via browser settings), Personalized advertising.'
                }
            ]
        },
        {
            icon: Shield,
            title: '6. Cookies and Tracking',
            content: [
                {
                    subtitle: '6.1 Types of Cookies',
                    text: 'We use: Essential cookies (required for platform functionality), Performance cookies (analytics and optimization), Functional cookies (remember preferences), Marketing cookies (with consent).'
                },
                {
                    subtitle: '6.2 Managing Cookies',
                    text: 'You can manage cookie preferences through your browser settings. Note that disabling essential cookies may affect platform functionality.'
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />

                <div className="container-custom relative z-10 py-16 md:py-24">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                            <Shield className="w-4 h-4 text-primary-400" />
                            <span className="text-sm font-medium">Legal Document</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-gray-300 mb-6">
                            Your privacy is important to us. This policy explains how WENWEX collects, uses, and protects your personal information.
                        </p>
                        <p className="text-sm text-gray-400">
                            Last Updated: {lastUpdated}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="container-custom py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Introduction */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8"
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Introduction</h2>
                        <p className="text-gray-600 leading-relaxed">
                            WENWEX ("we," "our," or "us") operates the WENWEX platform (www.wenwex.online), a global technology services marketplace connecting businesses with verified technology agencies and service providers. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit our website or use our services. By accessing or using WENWEX, you agree to the terms of this Privacy Policy.
                        </p>
                    </motion.div>

                    {/* Sections */}
                    <div className="space-y-8">
                        {sections.map((section, index) => {
                            const Icon = section.icon;
                            return (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                                    </div>

                                    <div className="space-y-6">
                                        {section.content.map((item, i) => (
                                            <div key={i}>
                                                <h3 className="font-semibold text-gray-900 mb-2">{item.subtitle}</h3>
                                                <p className="text-gray-600 leading-relaxed">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 border border-primary-100 mt-8"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Contact Us</h2>
                                <p className="text-gray-600">Questions about this Privacy Policy?</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4">
                            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Email:</strong> privacy@wenwex.online</p>
                            <p><strong>Support:</strong> wenvex19@gmail.com</p>
                            <p><strong>Address:</strong> T-Hub, IIIT Hyderabad Campus, Gachibowli, Hyderabad, Telangana 500032, India</p>
                        </div>
                    </motion.div>

                    {/* Related Links */}
                    <div className="flex flex-wrap gap-4 mt-8 justify-center">
                        <Link href="/terms" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                            Terms & Conditions
                        </Link>
                        <Link href="/refund" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                            Refund Policy
                        </Link>
                        <Link href="/contact" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
