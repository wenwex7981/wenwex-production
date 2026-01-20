/**
 * Dodo Payments Integration Utility for Buyer App
 * 
 * This module provides functions to initialize and handle Dodo Payments
 * for service bookings and other transactions.
 * 
 * Dodo Payments supports payment links with redirect-based checkout flow.
 */

export interface DodoPaymentOptions {
    amount: number; // Amount in paise (smallest currency unit)
    currency: string;
    productName: string;
    productDescription: string;
    customerName?: string;
    customerEmail?: string;
    customerId?: string;
    metadata?: Record<string, string>;
    successUrl?: string;
    cancelUrl?: string;
}

export interface PaymentResponse {
    payment_id: string;
    payment_link?: string;
    status: 'success' | 'pending' | 'failed' | 'cancelled';
}

export interface PaymentLinkResponse {
    paymentLink: string;
    paymentId: string;
}

/**
 * Convert amount to paise (smallest currency unit)
 */
export const toPaise = (amount: number): number => {
    return Math.round(amount * 100);
};

/**
 * Convert paise to rupees
 */
export const toRupees = (paise: number): number => {
    return paise / 100;
};

/**
 * Get Dodo Payments API Key from environment
 */
const getDodoApiKey = (): string => {
    const apiKey = process.env.NEXT_PUBLIC_DODO_API_KEY || process.env.DODO_API_KEY;
    if (!apiKey) {
        console.warn('Dodo Payments API Key not configured. Using test mode.');
    }
    return apiKey || '';
};

/**
 * Check if we're in test mode
 */
export const isTestMode = (): boolean => {
    const apiKey = getDodoApiKey();
    return !apiKey || apiKey.startsWith('dodo_test_') || apiKey === '';
};

/**
 * Create a Dodo Payments checkout session via API
 * This creates a payment link that redirects users to Dodo Payments hosted checkout
 */
export const createDodoPaymentLink = async (
    options: DodoPaymentOptions
): Promise<PaymentLinkResponse> => {
    const apiKey = getDodoApiKey();

    // If no API key, simulate test payment
    if (!apiKey || isTestMode()) {
        console.log('Dodo Payments: Test mode - simulating payment link creation');
        const testPaymentId = `dodo_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        return {
            paymentLink: `${window.location.origin}/payment/test?payment_id=${testPaymentId}&amount=${options.amount}&redirect=${encodeURIComponent(options.successUrl || window.location.origin)}`,
            paymentId: testPaymentId,
        };
    }

    try {
        // Call the API to create a payment link
        const response = await fetch('/api/payments/create-checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: options.amount,
                currency: options.currency || 'INR',
                product_name: options.productName,
                product_description: options.productDescription,
                customer: {
                    name: options.customerName,
                    email: options.customerEmail,
                },
                metadata: options.metadata,
                success_url: options.successUrl || `${window.location.origin}/payment/success`,
                cancel_url: options.cancelUrl || `${window.location.origin}/payment/cancel`,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create payment link');
        }

        const data = await response.json();
        return {
            paymentLink: data.payment_link || data.checkoutUrl,
            paymentId: data.payment_id || data.id,
        };
    } catch (error: any) {
        console.error('Error creating Dodo payment link:', error);
        throw new Error(error.message || 'Failed to create payment link');
    }
};

/**
 * Initialize Dodo Payment - Creates checkout and redirects user
 */
export const initializeDodoPayment = async (
    options: DodoPaymentOptions,
    onSuccess: (response: PaymentResponse) => void,
    onError: (error: any) => void
): Promise<void> => {
    try {
        // In test mode without API key, simulate the payment flow
        if (isTestMode()) {
            console.log('Dodo Payments: Test mode enabled');

            // Simulate payment processing
            const testPaymentId = `dodo_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

            // Show confirmation dialog for test payments
            const confirmed = window.confirm(
                `[TEST MODE] Dodo Payments\n\n` +
                `Service: ${options.productName}\n` +
                `Amount: ₹${toRupees(options.amount).toFixed(2)}\n\n` +
                `Click OK to simulate successful payment\n` +
                `Click Cancel to abort`
            );

            if (confirmed) {
                // Simulate successful payment
                onSuccess({
                    payment_id: testPaymentId,
                    status: 'success',
                });
            } else {
                onError({ message: 'Payment cancelled by user' });
            }
            return;
        }

        // Create payment link via API
        const { paymentLink, paymentId } = await createDodoPaymentLink({
            ...options,
            successUrl: `${window.location.origin}/payment/success?payment_id=${Date.now()}`,
            cancelUrl: `${window.location.origin}/payment/cancel`,
        });

        // Store payment info in sessionStorage for verification after redirect
        sessionStorage.setItem('pending_payment', JSON.stringify({
            paymentId,
            amount: options.amount,
            metadata: options.metadata,
            timestamp: Date.now(),
        }));

        // Redirect to payment page
        window.location.href = paymentLink;

    } catch (error: any) {
        console.error('Error initializing Dodo payment:', error);
        onError({ message: error.message || 'Failed to initialize payment' });
    }
};

/**
 * Verify payment status after redirect
 */
export const verifyDodoPayment = async (paymentId: string): Promise<PaymentResponse> => {
    // In test mode, always return success
    if (isTestMode() || paymentId.startsWith('dodo_test_')) {
        return {
            payment_id: paymentId,
            status: 'success',
        };
    }

    try {
        const response = await fetch(`/api/payments/verify?payment_id=${paymentId}`);

        if (!response.ok) {
            throw new Error('Failed to verify payment');
        }

        const data = await response.json();
        return {
            payment_id: data.payment_id,
            status: data.status,
        };
    } catch (error: any) {
        console.error('Error verifying payment:', error);
        throw new Error('Failed to verify payment status');
    }
};

/**
 * Get pending payment from session storage
 */
export const getPendingPayment = (): {
    paymentId: string;
    amount: number;
    metadata: Record<string, string>;
    timestamp: number;
} | null => {
    const pendingPayment = sessionStorage.getItem('pending_payment');
    if (pendingPayment) {
        return JSON.parse(pendingPayment);
    }
    return null;
};

/**
 * Clear pending payment from session storage
 */
export const clearPendingPayment = (): void => {
    sessionStorage.removeItem('pending_payment');
};

/**
 * Convert USD to INR (approximate rate, should use live conversion in production)
 */
export const convertUSDToINR = (usdAmount: number, rate: number = 83): number => {
    return Math.round(usdAmount * rate);
};
