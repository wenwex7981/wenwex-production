'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, Users, CreditCard, ShieldCheck, AlertTriangle, Scale, Globe2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function TermsConditionsPage() {
    const lastUpdated = 'January 19, 2026';
    const effectiveDate = 'January 19, 2026';

    const sections = [
        {
            icon: Users,
            title: '1. User Accounts',
            content: [
                {
                    subtitle: '1.1 Account Registration',
                    text: 'To access certain features of WENWEX, you must create an account. You agree to: Provide accurate, current, and complete information during registration, Maintain and update your information to keep it accurate, Maintain the security of your account credentials, Accept responsibility for all activities under your account, Notify us immediately of any unauthorized access.'
                },
                {
                    subtitle: '1.2 Account Types',
                    text: 'WENWEX offers two primary account types: Buyer Accounts (for individuals and businesses seeking services) and Vendor/Agency Accounts (for service providers). Vendor accounts require additional verification and are subject to subscription fees.'
                },
                {
                    subtitle: '1.3 Account Termination',
                    text: 'We reserve the right to suspend or terminate accounts that: Violate these Terms, Engage in fraudulent activities, Provide false information, Harass other users, Fail to pay applicable fees.'
                }
            ]
        },
        {
            icon: CreditCard,
            title: '2. Payments and Fees',
            content: [
                {
                    subtitle: '2.1 Service Payments',
                    text: 'All payments for services are processed through our secure payment gateway powered by Razorpay. By making a purchase, you agree to: Pay all charges at the prices listed, Provide valid payment information, Authorize us to charge your payment method.'
                },
                {
                    subtitle: '2.2 Vendor Subscriptions',
                    text: 'Vendors must maintain an active subscription to list services on WENWEX. Subscription fees are: Billed monthly or annually based on selected plan, Non-refundable except as specified in our Refund Policy, Subject to change with 30 days notice.'
                },
                {
                    subtitle: '2.3 Platform Fees',
                    text: 'WENWEX may charge platform fees on transactions. These fees help maintain and improve our services. Fee structures are disclosed before transactions are completed.'
                },
                {
                    subtitle: '2.4 Taxes',
                    text: 'Prices may not include applicable taxes. You are responsible for paying any taxes associated with your purchases. Vendors are responsible for their own tax obligations.'
                }
            ]
        },
        {
            icon: ShieldCheck,
            title: '3. Service Transactions',
            content: [
                {
                    subtitle: '3.1 Service Listings',
                    text: 'Vendors are responsible for the accuracy of their service listings. WENWEX does not guarantee the quality, safety, or legality of services listed. We act as a marketplace facilitator, not a party to transactions between buyers and vendors.'
                },
                {
                    subtitle: '3.2 Order Process',
                    text: 'When you place an order: You are making a binding offer to purchase, The vendor has the right to accept or decline, Acceptance creates a contract between you and the vendor, WENWEX facilitates but is not a party to this contract.'
                },
                {
                    subtitle: '3.3 Delivery and Completion',
                    text: 'Vendors must deliver services as described in their listings. Delivery timelines are estimates unless otherwise specified. Disputes regarding delivery should be reported within 7 days of the expected completion date.'
                },
                {
                    subtitle: '3.4 Reviews and Ratings',
                    text: 'Users may leave reviews and ratings for completed transactions. Reviews must be honest, accurate, and not defamatory. We reserve the right to remove reviews that violate these terms.'
                }
            ]
        },
        {
            icon: AlertTriangle,
            title: '4. Prohibited Activities',
            content: [
                {
                    subtitle: '4.1 You May Not:',
                    text: 'Use the platform for illegal purposes, Post false, misleading, or fraudulent content, Infringe upon intellectual property rights, Harass, abuse, or threaten other users, Attempt to circumvent platform fees, Use automated systems to access the platform, Interfere with platform security or functionality, Collect user data without authorization, Resell or redistribute platform access.'
                },
                {
                    subtitle: '4.2 Content Standards',
                    text: 'All content posted must: Be accurate and not misleading, Not contain malware or harmful code, Not infringe third-party rights, Comply with applicable laws, Not contain offensive or inappropriate material.'
                }
            ]
        },
        {
            icon: Scale,
            title: '5. Intellectual Property',
            content: [
                {
                    subtitle: '5.1 Platform Content',
                    text: 'WENWEX and its licensors own all rights to the platform, including: Trademarks, logos, and branding, Website design and functionality, Software and code, Documentation and content created by us.'
                },
                {
                    subtitle: '5.2 User Content',
                    text: 'You retain ownership of content you post. By posting, you grant WENWEX: A non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on the platform, The right to sublicense these rights to vendors and buyers as necessary for transactions.'
                },
                {
                    subtitle: '5.3 Vendor Portfolios',
                    text: 'Vendors represent that they have rights to all portfolio content uploaded. Vendors indemnify WENWEX against claims arising from their content.'
                }
            ]
        },
        {
            icon: Globe2,
            title: '6. Limitation of Liability',
            content: [
                {
                    subtitle: '6.1 Platform Disclaimer',
                    text: 'WENWEX is provided "as is" without warranties of any kind. We do not guarantee: Uninterrupted or error-free service, Accuracy of information provided by users, Quality of services from vendors, Specific outcomes from using our platform.'
                },
                {
                    subtitle: '6.2 Liability Cap',
                    text: 'To the maximum extent permitted by law, WENWEX\'s liability is limited to the fees paid by you in the 12 months preceding any claim. We are not liable for indirect, incidental, special, or consequential damages.'
                },
                {
                    subtitle: '6.3 Indemnification',
                    text: 'You agree to indemnify and hold harmless WENWEX, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the platform or violation of these terms.'
                }
            ]
        },
        {
            icon: FileText,
            title: '7. Dispute Resolution',
            content: [
                {
                    subtitle: '7.1 Between Buyers and Vendors',
                    text: 'We encourage users to resolve disputes directly. WENWEX may assist in mediation but is not obligated to resolve disputes. Our decisions in dispute resolution are final and binding.'
                },
                {
                    subtitle: '7.2 With WENWEX',
                    text: 'Any disputes with WENWEX shall be: First addressed through our support team, Governed by the laws of India, Subject to exclusive jurisdiction of courts in Hyderabad, Telangana.'
                },
                {
                    subtitle: '7.3 Arbitration',
                    text: 'For claims exceeding ₹5,00,000, disputes shall be resolved through binding arbitration in accordance with the Arbitration and Conciliation Act, 1996 of India.'
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
                            <FileText className="w-4 h-4 text-primary-400" />
                            <span className="text-sm font-medium">Legal Document</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black mb-4">
                            Terms & Conditions
                        </h1>
                        <p className="text-xl text-gray-300 mb-6">
                            Please read these terms carefully before using WENWEX. By accessing or using our platform, you agree to be bound by these terms.
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <p>Effective Date: {effectiveDate}</p>
                            <span>•</span>
                            <p>Last Updated: {lastUpdated}</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="container-custom py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Acceptance Notice */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8"
                    >
                        <div className="flex items-start gap-4">
                            <CheckCircle2 className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-amber-900 mb-2">Agreement to Terms</h3>
                                <p className="text-amber-800 text-sm">
                                    By accessing or using WENWEX (www.wenwex.online), you agree to be bound by these Terms and Conditions, our Privacy Policy, and our Refund Policy. If you disagree with any part of these terms, you may not access our services.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Introduction */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8"
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Introduction</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Welcome to WENWEX, a global technology services marketplace operated by Project Genie Tech Solutions. These Terms and Conditions ("Terms") govern your access to and use of the WENWEX platform, including our website, mobile applications, and all related services.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            WENWEX connects businesses and individuals seeking technology services ("Buyers") with verified agencies and freelancers offering those services ("Vendors"). Our platform facilitates transactions but is not a party to contracts between Buyers and Vendors.
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

                    {/* Changes to Terms */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mt-8"
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-4">8. Changes to Terms</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We reserve the right to modify these Terms at any time. Changes will be effective upon posting to our website. Material changes will be communicated via email or prominent notice on our platform.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Your continued use of WENWEX after changes constitutes acceptance of the modified Terms. We encourage you to review these Terms periodically.
                        </p>
                    </motion.div>

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
                                <h2 className="text-xl font-bold text-gray-900">Questions?</h2>
                                <p className="text-gray-600">Contact our legal team</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Email:</strong> legal@wenwex.online</p>
                            <p><strong>Support:</strong> wenvex19@gmail.com</p>
                            <p><strong>Address:</strong> T-Hub, IIIT Hyderabad Campus, Gachibowli, Hyderabad, Telangana 500032, India</p>
                        </div>
                    </motion.div>

                    {/* Related Links */}
                    <div className="flex flex-wrap gap-4 mt-8 justify-center">
                        <Link href="/privacy" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                            Privacy Policy
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
