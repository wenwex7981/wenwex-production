/**
 * Razorpay Payment Integration Utility
 * 
 * This module provides functions to initialize and handle Razorpay payments
 * for service bookings and other transactions.
 */

declare global {
    interface Window {
        Razorpay: any;
    }
}

export interface RazorpayOptions {
    amount: number; // Amount in paise (smallest currency unit)
    currency: string;
    name: string;
    description: string;
    orderId?: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
    };
}

export interface PaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}

/**
 * Load Razorpay SDK script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

/**
 * Initialize Razorpay payment
 */
export const initializeRazorpayPayment = async (
    options: RazorpayOptions,
    onSuccess: (response: PaymentResponse) => void,
    onError: (error: any) => void
): Promise<void> => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
        onError({ message: 'Failed to load Razorpay SDK. Please check your internet connection.' });
        return;
    }

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!razorpayKeyId) {
        onError({ message: 'Razorpay Key ID not configured' });
        return;
    }

    const razorpayOptions = {
        key: razorpayKeyId,
        amount: options.amount, // Amount in paise
        currency: options.currency || 'INR',
        name: options.name || 'WENWEX',
        description: options.description,
        image: '/logo.png',
        order_id: options.orderId,
        prefill: {
            name: options.prefill?.name || '',
            email: options.prefill?.email || '',
            contact: options.prefill?.contact || '',
        },
        notes: options.notes || {},
        theme: {
            color: options.theme?.color || '#3b82f6',
        },
        handler: function (response: PaymentResponse) {
            onSuccess(response);
        },
        modal: {
            ondismiss: function () {
                onError({ message: 'Payment cancelled by user' });
            },
            escape: true,
            animation: true,
        },
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.on('payment.failed', function (response: any) {
        onError({
            message: response.error.description || 'Payment failed',
            code: response.error.code,
            reason: response.error.reason,
        });
    });

    razorpay.open();
};

/**
 * Convert amount to paise (smallest currency unit)
 */
export const toPaise = (amount: number): number => {
    return Math.round(amount * 100);
};

/**
 * Convert USD to INR (approximate rate, should use live conversion in production)
 */
export const convertUSDToINR = (usdAmount: number, rate: number = 83): number => {
    return Math.round(usdAmount * rate);
};
