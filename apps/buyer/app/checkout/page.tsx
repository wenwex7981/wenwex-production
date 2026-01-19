'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    ChevronLeft, Shield, Lock, CreditCard, Clock, Check,
    AlertCircle, BadgeCheck, Star, Loader2, Wallet, Smartphone
} from 'lucide-react';
import { useCurrencyStore } from '@/lib/currency-store';
import { initializeRazorpayPayment, toPaise, convertUSDToINR, PaymentResponse } from '@/lib/razorpay';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock service data - in real app, fetch from API based on query params
const service = {
    id: '1',
    title: 'Full-Stack E-commerce Platform Development',
    slug: 'full-stack-ecommerce-platform',
    price: 2499,
    currency: 'USD',
    deliveryDays: 14,
    imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400',
    vendor: {
        name: 'TechCraft Studios',
        slug: 'techcraft-studios',
        logoUrl: 'https://ui-avatars.com/api/?name=TechCraft&background=0c8bff&color=fff',
        isVerified: true,
        rating: 4.9,
        reviewCount: 234,
    },
    features: [
        'Custom responsive design',
        'Payment integration',
        'Admin dashboard',
        'Inventory management',
        'Email notifications',
        '3 months support',
    ],
};

export default function CheckoutPage() {
    const formatPrice = useCurrencyStore((state) => state.formatPrice);
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        requirements: '',
        email: '',
        phone: '',
        name: '',
    });

    // Calculate INR price
    const priceInINR = convertUSDToINR(service.price);
    const priceInPaise = toPaise(priceInINR);

    const handlePayment = async () => {
        if (!formData.requirements || !formData.email) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsProcessing(true);

        try {
            // Initialize Razorpay payment
            await initializeRazorpayPayment(
                {
                    amount: priceInPaise,
                    currency: 'INR',
                    name: 'WENWEX',
                    description: service.title,
                    prefill: {
                        name: formData.name,
                        email: formData.email,
                        contact: formData.phone,
                    },
                    notes: {
                        service_id: service.id,
                        service_title: service.title,
                        vendor_name: service.vendor.name,
                    },
                },
                async (response: PaymentResponse) => {
                    // Payment successful
                    await handlePaymentSuccess(response);
                },
                (error: any) => {
                    // Payment failed or cancelled
                    setIsProcessing(false);
                    if (error.message !== 'Payment cancelled by user') {
                        toast.error(error.message || 'Payment failed');
                    }
                }
            );
        } catch (error: any) {
            setIsProcessing(false);
            toast.error(error.message || 'Failed to initiate payment');
        }
    };

    const handlePaymentSuccess = async (response: PaymentResponse) => {
        try {
            // Save order to database
            const { data: userData } = await supabase.auth.getUser();

            const { error } = await supabase.from('orders').insert({
                user_id: userData?.user?.id || null,
                service_id: service.id,
                vendor_id: service.vendor.slug,
                amount: priceInINR,
                currency: 'INR',
                payment_id: response.razorpay_payment_id,
                payment_status: 'paid',
                order_status: 'confirmed',
                requirements: formData.requirements,
                customer_email: formData.email,
                customer_phone: formData.phone,
                customer_name: formData.name,
                created_at: new Date().toISOString(),
            });

            if (error) {
                console.error('Order save error:', error);
            }

            setIsProcessing(false);
            setStep(3);
            toast.success('Payment successful! Order confirmed.');
        } catch (error) {
            console.error('Error saving order:', error);
            setIsProcessing(false);
            setStep(3);
            toast.success('Payment successful!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom py-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/services/${service.slug}`} className="btn-icon border border-gray-200">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
                            <p className="text-sm text-gray-500">Complete your order</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {step === 3 ? (
                    /* Success State */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-lg mx-auto text-center py-16"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                        <p className="text-gray-500 mb-8">
                            Your order has been placed successfully. The vendor will contact you shortly.
                        </p>
                        <div className="card mb-6">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 mb-4">
                                <Image
                                    src={service.imageUrl}
                                    alt={service.title}
                                    width={80}
                                    height={60}
                                    className="rounded-lg object-cover"
                                />
                                <div className="text-left">
                                    <h3 className="font-medium text-gray-900">{service.title}</h3>
                                    <p className="text-sm text-gray-500">by {service.vendor.name}</p>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Order Total (Paid)</span>
                                <span className="font-bold text-gray-900">₹{priceInINR.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <Link href="/account/orders" className="btn-primary">
                                View Order
                            </Link>
                            <Link href="/" className="btn-secondary">
                                Back to Home
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Progress Steps */}
                            <div className="flex items-center gap-4 mb-8">
                                {['Requirements', 'Payment'].map((label, idx) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step > idx + 1 ? 'bg-green-500 text-white' :
                                            step === idx + 1 ? 'bg-primary-500 text-white' :
                                                'bg-gray-200 text-gray-500'
                                            }`}>
                                            {step > idx + 1 ? <Check className="w-5 h-5" /> : idx + 1}
                                        </div>
                                        <span className={step === idx + 1 ? 'font-medium text-gray-900' : 'text-gray-500'}>
                                            {label}
                                        </span>
                                        {idx < 1 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
                                    </div>
                                ))}
                            </div>

                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Requirements */}
                                    <div className="card">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                            Project Requirements
                                        </h2>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Describe your project in detail so the vendor can understand your needs.
                                        </p>
                                        <textarea
                                            rows={6}
                                            placeholder="Tell us about your project, goals, timeline, and any specific requirements..."
                                            value={formData.requirements}
                                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                            className="input resize-none"
                                        />
                                    </div>

                                    {/* Contact Info */}
                                    <div className="card">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                            Contact Information
                                        </h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="input"
                                                />
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Email Address *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        placeholder="you@example.com"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="input"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Phone Number
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        placeholder="+91 9876543210"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="input"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!formData.requirements || !formData.email}
                                        className="btn-primary w-full py-4"
                                    >
                                        Continue to Payment
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Razorpay Payment */}
                                    <div className="card">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                            Secure Payment
                                        </h2>

                                        {/* Payment Methods Banner */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                                    <Shield className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">Powered by Razorpay</h3>
                                                    <p className="text-sm text-gray-500">100% Secure Payment</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {['Cards', 'UPI', 'Wallets', 'Net Banking'].map((method) => (
                                                    <span key={method} className="px-3 py-1 bg-white rounded-lg text-xs font-medium text-gray-600 border border-gray-200">
                                                        {method}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Supported Payment Methods */}
                                        <div className="grid grid-cols-4 gap-3 mb-6">
                                            <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                                <CreditCard className="w-6 h-6 text-gray-600" />
                                                <span className="text-xs font-medium text-gray-600">Cards</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                                <Smartphone className="w-6 h-6 text-gray-600" />
                                                <span className="text-xs font-medium text-gray-600">UPI</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                                <Wallet className="w-6 h-6 text-gray-600" />
                                                <span className="text-xs font-medium text-gray-600">Wallets</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                                <Lock className="w-6 h-6 text-gray-600" />
                                                <span className="text-xs font-medium text-gray-600">Banking</span>
                                            </div>
                                        </div>

                                        {/* Order Summary in Payment Step */}
                                        <div className="p-4 bg-gray-50 rounded-xl mb-6">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">Service Amount</span>
                                                <span className="font-medium">{formatPrice(service.price)}</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">Amount in INR</span>
                                                <span className="font-medium">₹{priceInINR.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                <span className="font-semibold text-gray-900">Total to Pay</span>
                                                <span className="text-xl font-bold text-green-600">₹{priceInINR.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button onClick={() => setStep(1)} className="btn-secondary">
                                            Back
                                        </button>
                                        <button
                                            onClick={handlePayment}
                                            disabled={isProcessing}
                                            className="btn-primary flex-1 py-4 gap-2"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-5 h-5" />
                                                    Pay ₹{priceInINR.toLocaleString('en-IN')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="space-y-6">
                            <div className="card sticky top-24">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                                {/* Service */}
                                <div className="flex gap-4 pb-4 border-b border-gray-100">
                                    <Image
                                        src={service.imageUrl}
                                        alt={service.title}
                                        width={80}
                                        height={60}
                                        className="rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                                            {service.title}
                                        </h3>
                                        <Link href={`/vendors/${service.vendor.slug}`} className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            {service.vendor.name}
                                            {service.vendor.isVerified && <BadgeCheck className="w-3 h-3 text-primary-500" />}
                                        </Link>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="py-4 border-b border-gray-100">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Includes:</h4>
                                    <ul className="space-y-2">
                                        {service.features.slice(0, 4).map((feature) => (
                                            <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                                                <Check className="w-4 h-4 text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Delivery */}
                                <div className="py-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        <span>Delivery in {service.deliveryDays} days</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-500">Subtotal (USD)</span>
                                        <span className="text-gray-900">{formatPrice(service.price)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-500">In INR</span>
                                        <span className="text-gray-900">₹{priceInINR.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-500">Service Fee</span>
                                        <span className="text-gray-900">₹0</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold text-gray-900">₹{priceInINR.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Shield className="w-5 h-5 text-green-500" />
                                    <span>Secure payment via Razorpay</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Lock className="w-5 h-5 text-green-500" />
                                    <span>Money-back guarantee</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
