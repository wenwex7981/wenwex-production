'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { RefreshCw, Clock, XCircle, CreditCard, AlertCircle, CheckCircle2, HelpCircle, Mail, ArrowLeft, Banknote } from 'lucide-react';

export default function RefundPolicyPage() {
    const lastUpdated = 'January 19, 2026';

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
                            <RefreshCw className="w-4 h-4 text-primary-400" />
                            <span className="text-sm font-medium">Legal Document</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black mb-4">
                            Refund & Cancellation Policy
                        </h1>
                        <p className="text-xl text-gray-300 mb-6">
                            Understand our policies regarding refunds, cancellations, and dispute resolution for services purchased through WENWEX.
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
                    {/* Important Notice */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8"
                    >
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-blue-900 mb-2">Important Notice</h3>
                                <p className="text-blue-800 text-sm">
                                    WENWEX acts as a marketplace connecting buyers with service providers (vendors). Refund eligibility depends on the nature of the service, delivery status, and compliance with agreed terms. Please read this policy carefully before making a purchase.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 1: Service Refunds */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <Banknote className="w-6 h-6 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">1. Service Purchase Refunds</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">1.1 Eligibility for Full Refund</h3>
                                <p className="text-gray-600 mb-4">You may be eligible for a full refund in the following cases:</p>
                                <ul className="space-y-2">
                                    {[
                                        'Vendor fails to deliver the service within the agreed timeframe (plus 7-day grace period)',
                                        'Service delivered is significantly different from the description',
                                        'Vendor is unable to complete the project and mutually agrees to cancel',
                                        'Technical error resulted in duplicate payment',
                                        'Vendor account is suspended or terminated before project completion'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">1.2 Eligibility for Partial Refund</h3>
                                <p className="text-gray-600 mb-4">Partial refunds may be issued when:</p>
                                <ul className="space-y-2">
                                    {[
                                        'Work has been partially completed before cancellation request',
                                        'Minor discrepancies exist between delivered work and description',
                                        'Project scope was reduced by mutual agreement',
                                        'Vendor delivers late but work meets quality standards'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">1.3 Non-Refundable Situations</h3>
                                <p className="text-gray-600 mb-4">Refunds will NOT be provided for:</p>
                                <ul className="space-y-2">
                                    {[
                                        'Change of mind after work has commenced',
                                        'Failure to provide required information or materials to vendor',
                                        'Dissatisfaction based on subjective preferences (not objective defects)',
                                        'Services already delivered and accepted',
                                        'Requests made more than 30 days after delivery',
                                        'Disputes arising from buyer\'s own delays or non-cooperation'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 2: Vendor Subscriptions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">2. Vendor Subscription Refunds</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">2.1 Subscription Policy</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Vendor subscription fees are generally <strong>non-refundable</strong> as they provide immediate access to platform features. However, the following exceptions apply:
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6">
                                <h4 className="font-medium text-gray-900 mb-3">Refund Eligibility:</h4>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span><strong>Within 48 hours:</strong> Full refund if vendor application is rejected</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span><strong>Within 7 days:</strong> Full refund if platform features are unavailable for more than 72 continuous hours</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                        <span><strong>Pro-rated refund:</strong> If cancelling annual plan mid-term (subject to 20% cancellation fee)</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">2.2 Subscription Cancellation</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Vendors may cancel their subscription at any time. Cancellation takes effect at the end of the current billing period. No refund is provided for the remaining period of monthly subscriptions.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 3: Cancellation Process */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">3. Cancellation Process</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">3.1 Buyer-Initiated Cancellation</h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Buyers may request cancellation through their order dashboard. Cancellation approval depends on project status:
                                </p>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                        <h4 className="font-bold text-green-900 mb-2">Before Start</h4>
                                        <p className="text-sm text-green-700">Full refund within 3-5 business days</p>
                                    </div>
                                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                                        <h4 className="font-bold text-yellow-900 mb-2">In Progress</h4>
                                        <p className="text-sm text-yellow-700">Partial refund based on work completed</p>
                                    </div>
                                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                        <h4 className="font-bold text-red-900 mb-2">Near Completion</h4>
                                        <p className="text-sm text-red-700">No refund; negotiate with vendor</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">3.2 Vendor-Initiated Cancellation</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Vendors may cancel orders only under exceptional circumstances (illness, emergency, inability to meet requirements). Vendor-initiated cancellations result in full buyer refund. Repeated cancellations may result in account penalties.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 4: Refund Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">4. Refund Process & Timeline</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">4.1 How to Request a Refund</h3>
                                <ol className="space-y-3 text-gray-600">
                                    <li className="flex items-start gap-3">
                                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                                        <span>Log in to your WENWEX account and go to "My Orders"</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                                        <span>Select the order and click "Request Refund/Cancellation"</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                                        <span>Select reason and provide supporting details/evidence</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                                        <span>Our team will review and respond within 2-3 business days</span>
                                    </li>
                                </ol>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6">
                                <h4 className="font-medium text-gray-900 mb-3">Refund Processing Time:</h4>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Review Period:</span>
                                        <span className="font-medium text-gray-900">2-3 business days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">UPI/Wallets:</span>
                                        <span className="font-medium text-gray-900">1-2 business days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Credit/Debit Cards:</span>
                                        <span className="font-medium text-gray-900">5-7 business days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Net Banking:</span>
                                        <span className="font-medium text-gray-900">5-10 business days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 5: Disputes */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                                <HelpCircle className="w-6 h-6 text-amber-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">5. Dispute Resolution</h2>
                        </div>

                        <div className="space-y-4 text-gray-600">
                            <p>
                                If you disagree with a refund decision, you may escalate the dispute:
                            </p>
                            <ol className="space-y-2 list-decimal list-inside">
                                <li><strong>Internal Review:</strong> Request a review by our senior support team within 7 days of the initial decision</li>
                                <li><strong>Mediation:</strong> We will attempt to mediate between buyer and vendor for mutually acceptable resolution</li>
                                <li><strong>Final Decision:</strong> WENWEX's final decision on disputes is binding for transactions under ₹50,000</li>
                                <li><strong>External Resolution:</strong> For larger amounts, disputes may be referred to arbitration as per our Terms & Conditions</li>
                            </ol>
                        </div>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 border border-primary-100"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Need Help?</h2>
                                <p className="text-gray-600">Contact our support team</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4">
                            For refund requests, cancellations, or disputes, please contact:
                        </p>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Email:</strong> refunds@wenwex.online</p>
                            <p><strong>Support:</strong> wenvex19@gmail.com</p>
                            <p><strong>Response Time:</strong> Within 24-48 hours</p>
                        </div>
                    </motion.div>

                    {/* Related Links */}
                    <div className="flex flex-wrap gap-4 mt-8 justify-center">
                        <Link href="/privacy" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                            Terms & Conditions
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
