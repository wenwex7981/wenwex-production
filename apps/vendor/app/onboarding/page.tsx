'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, ShieldCheck, FileText, Upload, CheckCircle2, AlertCircle,
    ArrowRight, ArrowLeft, Briefcase, Clock, Lock, Loader2, CreditCard,
    Sparkles, Check, Star, Zap, Crown, Users, BarChart3, Headphones,
    BadgeCheck, Rocket, Image as ImageIcon, Shield
} from 'lucide-react';
import Link from 'next/link';
import { createVendor, getCurrentVendor, uploadMedia } from '@/lib/vendor-service';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { initializeDodoPayment, toPaise, PaymentResponse } from '@/lib/dodo-payments';

// Initialize Supabase client
const supabase = getSupabaseClient();

interface SubscriptionPlan {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    billing_period: string;
    services_limit: number;
    features: string[];
    is_popular: boolean;
    badge_text: string | null;
    badge_color: string | null;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0); // 0: Welcome, 1: Pricing, 2: Onboarding Form, 3: Verification/Pending
    const [isVerifying, setIsVerifying] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [paymentId, setPaymentId] = useState<string>('');

    const [formData, setFormData] = useState<any>({
        company_name: '',
        email: '',
        pan_number: '',
        tan_number: '',
        country: 'India',
        pan_image_url: '',
        tan_image_url: '',
        payment_proof_url: '',
        description: '',
        website_url: '',
        founded_year: '2020',
        team_size: '15-30',
        projects_done: '250+',
        satisfaction_rate: '98%',
        social_links: { linkedin: '', twitter: '', instagram: '', facebook: '' },
    });

    useEffect(() => {
        Promise.all([checkExistingVendor(), loadSubscriptionPlans()]);
    }, []);

    const loadSubscriptionPlans = async () => {
        try {
            const { data, error } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            setPlans(data || []);
        } catch (error) {
            console.error('Error loading plans:', error);
            // Set default plans if database fetch fails
            setPlans([
                { id: '1', name: 'Starter', slug: 'starter', description: 'Perfect for individuals', price: 1580.80, currency: 'INR', billing_period: 'monthly', services_limit: 5, features: ['Up to 5 services', 'Basic analytics', 'Email support'], is_popular: false, badge_text: null, badge_color: null },
                { id: '2', name: 'Professional', slug: 'professional', description: 'Best for growing agencies', price: 4076.80, currency: 'INR', billing_period: 'monthly', services_limit: 25, features: ['Up to 25 services', 'Advanced analytics', 'Priority support', 'Verified badge'], is_popular: true, badge_text: 'Popular', badge_color: 'yellow' },
                { id: '3', name: 'Enterprise', slug: 'enterprise', description: 'For large agencies', price: 8236.80, currency: 'INR', billing_period: 'monthly', services_limit: -1, features: ['Unlimited services', 'Premium analytics', 'Dedicated support', 'API access'], is_popular: false, badge_text: 'Best Value', badge_color: 'green' },
            ]);
        }
    };

    const handleFileUpload = async (file: File, type: 'pan' | 'tan' | 'payment') => {
        const toastId = toast.loading(`Uploading ${type === 'payment' ? 'Payment Proof' : type.toUpperCase()}...`);
        try {
            const bucket = 'onboarding';
            const folder = formData.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'temp';
            const url = await uploadMedia(bucket, file, folder);

            if (type === 'payment') {
                setFormData((prev: any) => ({ ...prev, payment_proof_url: url }));
            } else {
                setFormData((prev: any) => ({ ...prev, [`${type}_image_url`]: url }));
            }
            toast.success(`${type === 'payment' ? 'Payment Proof' : type.toUpperCase()} uploaded successfully`, { id: toastId });
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        }
    };

    const checkExistingVendor = async () => {
        try {
            // Check auth first
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Please sign in to continue');
                router.push('/auth/login?next=/onboarding');
                return;
            }

            const vendor = await getCurrentVendor();
            if (vendor) {
                if (vendor.status === 'APPROVED') {
                    router.push('/dashboard');
                } else {
                    setIsPending(true);
                    setStep(3);
                }
            }
        } catch (error) {
            console.error('Error checking vendor:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDodoPayment = async () => {
        if (!selectedPlan) {
            toast.error('Please select a subscription plan');
            return;
        }

        if (!formData.company_name || !formData.email) {
            toast.error('Please fill in company name and email first');
            return;
        }

        setIsVerifying(true);

        try {
            const amountInPaise = toPaise(selectedPlan.price);

            await initializeDodoPayment(
                {
                    amount: amountInPaise,
                    currency: selectedPlan.currency || 'INR',
                    productName: 'WENWEX Partner Subscription',
                    productDescription: `${selectedPlan.name} Plan - ${selectedPlan.billing_period}`,
                    customerName: formData.company_name,
                    customerEmail: formData.email,
                    metadata: {
                        plan_id: selectedPlan.id,
                        plan_name: selectedPlan.name,
                        company_name: formData.company_name,
                    },
                },
                async (response: PaymentResponse) => {
                    // Payment successful
                    setPaymentId(response.payment_id);
                    setPaymentCompleted(true);
                    toast.success('Payment successful! Completing registration...');

                    // Auto-submit the application
                    await submitApplication(response.payment_id);
                },
                (error: any) => {
                    setIsVerifying(false);
                    if (error.message !== 'Payment cancelled by user') {
                        toast.error(error.message || 'Payment failed');
                    }
                }
            );
        } catch (error: any) {
            setIsVerifying(false);
            toast.error(error.message || 'Failed to initiate payment');
        }
    };

    const submitApplication = async (dodoPaymentId: string) => {
        try {
            const slug = formData.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const { pan_image_url, tan_image_url, payment_proof_url, ...submitData } = formData;
            const verification_documents = [
                ...(pan_image_url ? [pan_image_url] : []),
                ...(tan_image_url ? [tan_image_url] : [])
            ];

            await createVendor({
                ...submitData,
                verification_documents,
                slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
                subscription_plan_id: selectedPlan?.id,
                subscription_status: 'active',
                dodo_payment_id: dodoPaymentId,
                payment_status: 'paid',
            });

            setIsPending(true);
            setStep(3);
            toast.success('Application submitted successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit application');
        } finally {
            setIsVerifying(false);
        }
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(price);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    const renderStep = () => {
        switch (step) {
            case 0:
                return <WelcomeStep onNext={() => setStep(1)} />;
            case 1:
                return (
                    <PricingStep
                        plans={plans}
                        selectedPlan={selectedPlan}
                        onSelectPlan={setSelectedPlan}
                        onNext={() => setStep(2)}
                        onBack={() => setStep(0)}
                        formatPrice={formatPrice}
                    />
                );
            case 2:
                return (
                    <OnboardingFormStep
                        formData={formData}
                        setFormData={setFormData}
                        selectedPlan={selectedPlan}
                        handleFileUpload={handleFileUpload}
                        handlePayment={handleDodoPayment}
                        isProcessing={isVerifying}
                        paymentCompleted={paymentCompleted}
                        onBack={() => setStep(1)}
                        formatPrice={formatPrice}
                    />
                );
            case 3:
                return <PendingStep isPending={isPending} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 py-6">
                <div className="container px-6 mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20">
                            <span className="text-white font-black text-xl font-outfit">W</span>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-xl font-black text-gray-900 tracking-tighter">WENWEX</span>
                            <span className="text-[8px] font-bold text-primary-600 tracking-[0.2em] ml-0.5 uppercase">Partner</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Onboarding Process</span>
                        <div className="h-4 w-px bg-gray-200" />
                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Step {step + 1} of 4</span>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-gray-100">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((step + 1) / 4) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <main className="flex-1 flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {renderStep()}
                </AnimatePresence>
            </main>
        </div>
    );
}

// Step 0: Welcome Screen
function WelcomeStep({ onNext }: { onNext: () => void }) {
    const benefits = [
        { icon: Users, title: 'Reach thousands of potential clients', description: 'Access our global marketplace' },
        { icon: CreditCard, title: 'Subscription-based, no hidden fees', description: 'Simple transparent pricing' },
        { icon: BarChart3, title: 'Dashboard analytics & insights', description: 'Track your performance' },
        { icon: Sparkles, title: 'Showcase your portfolio & reels', description: 'Stand out from competitors' },
        { icon: BadgeCheck, title: 'Verified agency badge', description: 'Build trust with clients' },
        { icon: Headphones, title: 'Priority support for vendors', description: '24/7 dedicated assistance' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl"
        >
            <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-0">
                    {/* Left Side - Benefits */}
                    <div className="p-10 lg:p-14">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                            <Building2 className="w-4 h-4 text-primary-400" />
                            <span className="text-xs font-bold text-white/80 uppercase tracking-widest">For Agencies & Freelancers</span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                            Grow Your Business with{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400">WENWEX</span>
                        </h1>

                        <p className="text-white/60 text-lg mb-10 leading-relaxed">
                            Join thousands of verified agencies selling their services to clients worldwide. Get discovered, build your reputation, and grow your revenue.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-4 h-4 text-primary-400" />
                                    </div>
                                    <span className="text-sm text-white/80 font-medium">{benefit.title}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={onNext}
                                className="flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-primary-50 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]"
                            >
                                <Rocket className="w-5 h-5" />
                                Start Selling Today
                            </button>
                            <button
                                onClick={onNext}
                                className="flex items-center gap-2 px-6 py-4 bg-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/20 transition-all"
                            >
                                View Pricing
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Pricing Preview */}
                    <div className="bg-white rounded-tl-[3rem] p-10 lg:p-14">
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Simple, Transparent Pricing</h2>
                        <p className="text-gray-500 mb-8">Choose a plan that works for your business</p>

                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-gray-900">Starter</div>
                                        <div className="text-sm text-gray-500">Up to 5 services</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-gray-900">₹1,580.80<span className="text-sm font-medium text-gray-400">/mo</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl border-2 border-primary-500 bg-primary-50/30 relative">
                                <div className="absolute -top-3 right-4 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-black rounded-full uppercase">Popular</div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-gray-900">Professional</div>
                                        <div className="text-sm text-gray-500">Up to 25 services</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-primary-600">₹4,076.80<span className="text-sm font-medium text-gray-400">/mo</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-gray-900">Enterprise</div>
                                        <div className="text-sm text-gray-500">Unlimited everything</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-gray-900">₹8,236.80<span className="text-sm font-medium text-gray-400">/mo</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={onNext} className="w-full mt-6 text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center justify-center gap-2">
                            Compare all features <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Step 1: Pricing Selection
function PricingStep({ plans, selectedPlan, onSelectPlan, onNext, onBack, formatPrice }: {
    plans: SubscriptionPlan[];
    selectedPlan: SubscriptionPlan | null;
    onSelectPlan: (plan: SubscriptionPlan) => void;
    onNext: () => void;
    onBack: () => void;
    formatPrice: (price: number, currency: string) => string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl"
        >
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden p-10 lg:p-14">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                        <CreditCard className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Choose Your Plan</h2>
                    <p className="text-gray-500">Select the plan that best fits your business needs</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectPlan(plan)}
                            className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${selectedPlan?.id === plan.id
                                ? 'border-primary-500 bg-primary-50/30 shadow-lg shadow-primary-500/10'
                                : plan.is_popular
                                    ? 'border-primary-200 bg-primary-50/10'
                                    : 'border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            {plan.badge_text && (
                                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 ${plan.badge_color === 'yellow' ? 'bg-yellow-400 text-yellow-900' :
                                    plan.badge_color === 'green' ? 'bg-green-400 text-green-900' :
                                        'bg-primary-400 text-white'
                                    } text-xs font-black rounded-full uppercase`}>
                                    {plan.badge_text}
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-black text-gray-900 mb-1">{plan.name}</h3>
                                <p className="text-sm text-gray-500">{plan.description}</p>
                            </div>

                            <div className="text-center mb-6">
                                <div className="text-4xl font-black text-gray-900">
                                    {formatPrice(plan.price, plan.currency)}
                                </div>
                                <div className="text-sm text-gray-400">per {plan.billing_period}</div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {plan.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className={`w-full py-3 rounded-xl text-center font-bold text-sm transition-all ${selectedPlan?.id === plan.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 text-gray-500 hover:text-gray-700 font-bold transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                    <button
                        onClick={onNext}
                        disabled={!selectedPlan}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-wider transition-all ${selectedPlan
                            ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-xl shadow-primary-500/20'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Continue
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Step 2: Onboarding Form with Dodo Payment
function OnboardingFormStep({ formData, setFormData, selectedPlan, handleFileUpload, handlePayment, isProcessing, paymentCompleted, onBack, formatPrice }: {
    formData: any;
    setFormData: (data: any) => void;
    selectedPlan: SubscriptionPlan | null;
    handleFileUpload: (file: File, type: 'pan' | 'tan' | 'payment') => void;
    handlePayment: () => void;
    isProcessing: boolean;
    paymentCompleted: boolean;
    onBack: () => void;
    formatPrice: (price: number, currency: string) => string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl"
        >
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-8 lg:p-12">
                    {/* Selected Plan Summary */}
                    {selectedPlan && (
                        <div className="mb-8 p-5 bg-primary-50 rounded-2xl border border-primary-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm text-primary-600 font-bold">Selected Plan</div>
                                    <div className="text-xl font-black text-gray-900">{selectedPlan.name}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-primary-600">
                                    {formatPrice(selectedPlan.price, selectedPlan.currency)}
                                </div>
                                <div className="text-sm text-gray-500">per {selectedPlan.billing_period}</div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 mb-8">
                        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                            <Briefcase className="w-7 h-7" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Complete Your Profile</h2>
                        <p className="text-gray-500 font-medium">Tell us about your business and complete payment to activate your account.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name*</label>
                            <input
                                type="text"
                                placeholder="e.g. TechCraft Studios"
                                className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:bg-white outline-none transition-all font-bold text-gray-900"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Email*</label>
                            <input
                                type="email"
                                placeholder="business@company.com"
                                className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:bg-white outline-none transition-all font-bold text-gray-900"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Description*</label>
                            <textarea
                                placeholder="Describe your agency's expertise and mission..."
                                className="w-full p-5 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-gray-900 min-h-[100px] resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PAN Number (Optional)</label>
                            <input
                                type="text"
                                placeholder="ABCDE1234F"
                                className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:bg-white outline-none transition-all font-mono font-bold tracking-widest text-gray-900"
                                value={formData.pan_number}
                                onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">TAN Number (Optional)</label>
                            <input
                                type="text"
                                placeholder="ABCD12345E"
                                className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:bg-white outline-none transition-all font-mono font-bold tracking-widest text-gray-900"
                                value={formData.tan_number}
                                onChange={(e) => setFormData({ ...formData, tan_number: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Document Uploads - PAN, TAN (Optional) */}
                    <div className="space-y-4 mb-8">
                        <h3 className="text-lg font-black text-gray-900">Upload Documents (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* PAN Upload */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PAN Card</label>
                                <div
                                    onClick={() => document.getElementById('pan-upload')?.click()}
                                    className={`aspect-[4/3] rounded-2xl border-2 border-dashed ${formData.pan_image_url ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'} flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 transition-all overflow-hidden`}
                                >
                                    {formData.pan_image_url ? (
                                        <div className="relative w-full h-full">
                                            <img src={formData.pan_image_url} alt="PAN" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                            <span className="text-xs font-bold text-gray-500">Upload PAN</span>
                                        </>
                                    )}
                                    <input id="pan-upload" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'pan')} />
                                </div>
                            </div>

                            {/* TAN Upload */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TAN Certificate</label>
                                <div
                                    onClick={() => document.getElementById('tan-upload')?.click()}
                                    className={`aspect-[4/3] rounded-2xl border-2 border-dashed ${formData.tan_image_url ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'} flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 transition-all overflow-hidden`}
                                >
                                    {formData.tan_image_url ? (
                                        <div className="relative w-full h-full">
                                            <img src={formData.tan_image_url} alt="TAN" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                            <span className="text-xs font-bold text-gray-500">Upload TAN</span>
                                        </>
                                    )}
                                    <input id="tan-upload" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'tan')} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Secure Payment via Dodo Payments</h4>
                                <p className="text-sm text-gray-500">Pay using Cards, UPI, Wallets, or Net Banking</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {['Cards', 'UPI', 'Wallets', 'Net Banking', 'Google Pay', 'PhonePe'].map((method) => (
                                <span key={method} className="px-3 py-1 bg-white rounded-lg text-xs font-medium text-gray-600 border border-gray-200">
                                    {method}
                                </span>
                            ))}
                        </div>
                        {selectedPlan && (
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Subscription Amount</span>
                                    <span className="text-2xl font-black text-gray-900">{formatPrice(selectedPlan.price, selectedPlan.currency)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-6 py-3 text-gray-500 hover:text-gray-700 font-bold transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing || !formData.company_name || !formData.email}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-wider transition-all shadow-xl ${isProcessing || !formData.company_name || !formData.email
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/20 active:scale-[0.98]'
                                }`}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Pay & Submit
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Step 3: Pending Status
function PendingStep({ isPending }: { isPending: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg"
        >
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden p-10 lg:p-14">
                <div className="p-10 rounded-[2rem] bg-green-50 border border-green-100 text-center space-y-8">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-green-500 mx-auto shadow-sm">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-3xl font-black text-green-900 tracking-tight">Payment Successful!</h3>
                        <p className="text-green-800/70 font-bold text-sm leading-relaxed max-w-sm mx-auto">
                            Your payment has been received and your application is under review. Our team will verify your details within{' '}
                            <span className="text-green-950 underline underline-offset-4 decoration-2">24 BUSINESS HOURS</span>.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 p-5 bg-white rounded-[2rem] border border-green-100 text-left">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Application Status</div>
                            <div className="text-sm font-black text-gray-900">Awaiting Super Admin Approval</div>
                        </div>
                    </div>

                    <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em]">Thank you for joining WENWEX</p>
                </div>
            </div>
        </motion.div>
    );
}
