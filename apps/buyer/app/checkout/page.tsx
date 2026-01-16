'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    ChevronLeft, Shield, Lock, CreditCard, Clock, Check,
    AlertCircle, BadgeCheck, Star
} from 'lucide-react';
import { useCurrencyStore } from '@/lib/currency-store';

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

const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'upi', name: 'UPI (India)', icon: null },
    { id: 'paypal', name: 'PayPal', icon: null },
];

export default function CheckoutPage() {
    const formatPrice = useCurrencyStore((state) => state.formatPrice);
    const [step, setStep] = useState(1);
    const [selectedPayment, setSelectedPayment] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        requirements: '',
        email: '',
        phone: '',
    });

    const handleSubmit = async () => {
        setIsProcessing(true);
        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            setStep(3);
        }, 2000);
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
                                <span className="text-gray-500">Order Total</span>
                                <span className="font-bold text-gray-900">{formatPrice(service.price)}</span>
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
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email Address
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
                                                    placeholder="+1 (555) 000-0000"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="input"
                                                />
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
                                    {/* Payment Method */}
                                    <div className="card">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                            Payment Method
                                        </h2>
                                        <div className="space-y-3">
                                            {paymentMethods.map((method) => (
                                                <label
                                                    key={method.id}
                                                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${selectedPayment === method.id
                                                        ? 'border-primary-500 bg-primary-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value={method.id}
                                                        checked={selectedPayment === method.id}
                                                        onChange={(e) => setSelectedPayment(e.target.value)}
                                                        className="w-5 h-5 text-primary-500"
                                                    />
                                                    <span className="font-medium text-gray-900">{method.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Card Details (if card selected) */}
                                    {selectedPayment === 'card' && (
                                        <div className="card">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                                Card Details
                                            </h2>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Card Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="4242 4242 4242 4242"
                                                        className="input"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Expiry Date
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="MM/YY"
                                                            className="input"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            CVC
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="123"
                                                            className="input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button onClick={() => setStep(1)} className="btn-secondary">
                                            Back
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isProcessing}
                                            className="btn-primary flex-1 py-4"
                                        >
                                            {isProcessing ? 'Processing...' : `Pay ${formatPrice(service.price)}`}
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
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-900">{formatPrice(service.price)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-500">Service Fee</span>
                                        <span className="text-gray-900">$0</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold text-gray-900">{formatPrice(service.price)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Shield className="w-5 h-5 text-green-500" />
                                    <span>Secure payment processing</span>
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
