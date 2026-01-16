// ===========================================
// SUBSCRIPTION CONTROLLER
// ===========================================

import { Request, Response } from 'express';
import { PrismaClient, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { asyncHandler, NotFoundError, BadRequestError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const subscriptionController = {
    // Get all subscription plans
    getPlans: asyncHandler(async (req: Request, res: Response) => {
        const pricing = await prisma.subscriptionPricing.findMany({
            where: { isActive: true },
            orderBy: [{ country: 'asc' }, { plan: 'asc' }],
        });

        // Group by country
        const grouped = pricing.reduce((acc, p) => {
            if (!acc[p.country]) {
                acc[p.country] = [];
            }
            acc[p.country].push(p);
            return acc;
        }, {} as Record<string, typeof pricing>);

        res.json({
            success: true,
            data: grouped,
        });
    }),

    // Get plans by country
    getPlansByCountry: asyncHandler(async (req: Request, res: Response) => {
        const { country } = req.params;

        let pricing = await prisma.subscriptionPricing.findMany({
            where: { country: country.toUpperCase(), isActive: true },
            orderBy: { plan: 'asc' },
        });

        // Fallback to US pricing if country not found
        if (pricing.length === 0) {
            pricing = await prisma.subscriptionPricing.findMany({
                where: { country: 'US', isActive: true },
                orderBy: { plan: 'asc' },
            });
        }

        res.json({
            success: true,
            data: pricing,
        });
    }),

    // Get current subscription
    getCurrentSubscription: asyncHandler(async (req: Request, res: Response) => {
        const subscription = await prisma.subscription.findFirst({
            where: {
                vendorId: req.user!.vendorId,
                status: SubscriptionStatus.ACTIVE,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: subscription,
        });
    }),

    // Get subscription history
    getSubscriptionHistory: asyncHandler(async (req: Request, res: Response) => {
        const subscriptions = await prisma.subscription.findMany({
            where: { vendorId: req.user!.vendorId },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: subscriptions,
        });
    }),

    // Create subscription (initiate payment)
    createSubscription: asyncHandler(async (req: Request, res: Response) => {
        const { plan, isYearly = false } = req.body;

        // Get vendor's country
        const vendor = await prisma.vendor.findUnique({
            where: { id: req.user!.vendorId },
        });

        if (!vendor) {
            throw new NotFoundError('Vendor not found');
        }

        // Get pricing for country
        let pricing = await prisma.subscriptionPricing.findFirst({
            where: { plan, country: vendor.country, isActive: true },
        });

        if (!pricing) {
            pricing = await prisma.subscriptionPricing.findFirst({
                where: { plan, country: 'US', isActive: true },
            });
        }

        if (!pricing) {
            throw new BadRequestError('Pricing not available for this plan');
        }

        const amount = isYearly ? pricing.yearlyPrice : pricing.monthlyPrice;

        // TODO: Integrate with Dodo Payments to create payment link
        // For now, create a pending subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (isYearly ? 12 : 1));

        const subscription = await prisma.subscription.create({
            data: {
                vendorId: req.user!.vendorId!,
                plan: plan as SubscriptionPlan,
                status: SubscriptionStatus.PENDING,
                priceAmount: amount,
                currency: pricing.currency,
                startDate,
                endDate,
            },
        });

        // Generate payment link (placeholder)
        const paymentLink = `https://pay.dodo.com/checkout?subscription=${subscription.id}&amount=${amount}&currency=${pricing.currency}`;

        res.json({
            success: true,
            message: 'Subscription created. Complete payment to activate.',
            data: {
                subscription,
                paymentLink,
            },
        });
    }),

    // Cancel subscription
    cancelSubscription: asyncHandler(async (req: Request, res: Response) => {
        const subscription = await prisma.subscription.findFirst({
            where: {
                vendorId: req.user!.vendorId,
                status: SubscriptionStatus.ACTIVE,
            },
        });

        if (!subscription) {
            throw new NotFoundError('No active subscription found');
        }

        await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: SubscriptionStatus.CANCELLED },
        });

        res.json({
            success: true,
            message: 'Subscription cancelled. Access continues until end of billing period.',
        });
    }),

    // Handle webhook from payment provider
    handleWebhook: asyncHandler(async (req: Request, res: Response) => {
        const { event, subscriptionId, paymentId, status } = req.body;

        // TODO: Verify webhook signature with DODO_WEBHOOK_SECRET

        if (event === 'payment.success') {
            await prisma.subscription.update({
                where: { id: subscriptionId },
                data: {
                    status: SubscriptionStatus.ACTIVE,
                    paymentId,
                },
            });
        } else if (event === 'payment.failed') {
            await prisma.subscription.update({
                where: { id: subscriptionId },
                data: { status: SubscriptionStatus.EXPIRED },
            });
        }

        res.json({ received: true });
    }),
};
