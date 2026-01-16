import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Currency {
    code: string;
    symbol: string;
    name: string;
    flag: string;
    rate: number; // For demo purpose, rate relative to USD
}

export const currencies: Currency[] = [
    { code: 'USD', symbol: '$', name: 'United States', flag: '🇺🇸', rate: 1 },
    { code: 'INR', symbol: '₹', name: 'India', flag: '🇮🇳', rate: 83.20 },
    { code: 'EUR', symbol: '€', name: 'Europe', flag: '🇪🇺', rate: 0.92 },
    { code: 'AED', symbol: 'د.إ', name: 'UAE', flag: '🇦🇪', rate: 3.67 },
    { code: 'GBP', symbol: '£', name: 'United Kingdom', flag: '🇬🇧', rate: 0.79 },
    { code: 'CAD', symbol: 'CA$', name: 'Canada', flag: '🇨🇦', rate: 1.35 },
    { code: 'AUD', symbol: 'AU$', name: 'Australia', flag: '🇦🇺', rate: 1.52 },
    { code: 'JPY', symbol: '¥', name: 'Japan', flag: '🇯🇵', rate: 148.50 },
    { code: 'CNY', symbol: '¥', name: 'China', flag: '🇨🇳', rate: 7.19 },
    { code: 'SGD', symbol: 'S$', name: 'Singapore', flag: '🇸🇬', rate: 1.34 },
    { code: 'SAR', symbol: 'SR', name: 'Saudi Arabia', flag: '🇸🇦', rate: 3.75 },
    { code: 'QAR', symbol: 'QR', name: 'Qatar', flag: '🇶🇦', rate: 3.64 },
    { code: 'KWD', symbol: 'KD', name: 'Kuwait', flag: '🇰🇼', rate: 0.31 },
    { code: 'BHD', symbol: 'BD', name: 'Bahrain', flag: '🇧🇭', rate: 0.38 },
    { code: 'OMR', symbol: 'RO', name: 'Oman', flag: '🇴🇲', rate: 0.38 },
    { code: 'CHF', symbol: 'CHF', name: 'Switzerland', flag: '🇨🇭', rate: 0.88 },
    { code: 'ZAR', symbol: 'R', name: 'South Africa', flag: '🇿🇦', rate: 18.80 },
    { code: 'BRL', symbol: 'R$', name: 'Brazil', flag: '🇧🇷', rate: 4.95 },
    { code: 'MXN', symbol: '$', name: 'Mexico', flag: '🇲🇽', rate: 17.10 },
    { code: 'RUB', symbol: '₽', name: 'Russia', flag: '🇷🇺', rate: 91.50 },
    { code: 'TRY', symbol: '₺', name: 'Turkey', flag: '🇹🇷', rate: 30.50 },
];

interface CurrencyState {
    currentCurrency: Currency;
    setCurrency: (currency: Currency) => void;
    formatPrice: (amountInUSD: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set, get) => ({
            currentCurrency: currencies[0],
            setCurrency: (currency) => set({ currentCurrency: currency }),
            formatPrice: (amountInUSD) => {
                const { currentCurrency } = get();
                const convertedAmount = amountInUSD * currentCurrency.rate;

                // Format based on currency rules
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currentCurrency.code,
                    currencyDisplay: 'symbol',
                    // Use maximumSignificantDigits or minimumFractionDigits based on currency
                    minimumFractionDigits: currentCurrency.code === 'JPY' ? 0 : 2,
                    maximumFractionDigits: currentCurrency.code === 'JPY' ? 0 : 2,
                }).format(convertedAmount);
            },
        }),
        {
            name: 'wenvex-currency',
        }
    )
);
