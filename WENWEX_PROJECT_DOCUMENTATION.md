# WENWEX Platform Documentation

**Date:** February 3, 2026  
**Project:** WENWEX Full Stack Platform  
**Version:** 1.0  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Buyer Application](#buyer-application)
3. [Vendor Application](#vendor-application)
4. [Super Admin Panel](#super-admin-panel)
5. [ACH Panel (Access Control Hub)](#ach-panel-access-control-hub)
6. [Technical Overview](#technical-overview)

---

## Executive Summary

WENWEX is a comprehensive multi-sided marketplace platform connecting buyers with vendors for various services, with a strong focus on academic and professional projects. The ecosystem consists of three distinct integrated applications: a **Buyer App** for customers, a **Vendor App** for service providers, and two administrative layers: the standard **Super Admin Panel** for operational management and the **ACH Panel (Access Control Hub)** for advanced system configuration and access control.

---

## Buyer Application

The Buyer Application is the public-facing storefront of the WENWEX platform, designed for seamless service discovery and purchasing.

### Key Features

*   **Homepage & Discovery**
    *   **Dynamic Feed:** Personalized content feed displaying trending services and updates.
    *   **Visual Categories:** Image-rich category browsing (e.g., Development, Design, Marketing).
    *   **Search Engine:** robust search functionality with filtering by domain, price, and ratings.

*   **Academic Hub**
    *   Dedicated section for student projects (Mini Projects, Major Projects, Research Papers).
    *   **Domain Filtering:** Filter by AI/ML, IOT, CSE, EEE, etc.
    *   **Project Details:** View documentation availability (Source Code, PPTs, Reports).

*   **Vendor Interaction**
    *   **Vendor Profiles:** Detailed agency/freelancer profiles with portfolios, "Shorts" (video showcases), and reviews.
    *   **Messaging System:** Real-time chat with vendors to discuss requirements before purchase.
    *   **Portfolio Viewing:** Rich media gallery (Images/Videos) of past work.

*   **Checkout & Payments**
    *   **Secure Payments:** Integrated Dodo Payments (replacing Razorpay) for secure transactions.
    *   **Order Management:** Track order status and delivery timelines.

---

## Vendor Application

The Vendor Application is a dedicated portal for agencies and freelancers to manage their business on WENWEX.

### Key Features

*   **Onboarding & Subscription**
    *   **Multi-step Onboarding:** Guided process to set up profiles and payment details.
    *   **Subscription Plans:** Flexible pricing tiers for vendors (managed via Admin).

*   **Dashboard**
    *   **Analytics:** Overview of earnings, views, and order stats.
    *   **Service Management:** Create, edit, and list services with pricing and delivery details.
    *   **Portfolio Management:** Upload and organize project showcases.
    *   **Shorts:** Upload short-form video content to attract buyers.

*   **Communication**
    *   **Inbox:** Centralized messaging to handle buyer inquiries.
    *   **Notifications:** Real-time alerts for new orders and messages.

*   **Settings**
    *   **Profile Customization:** Edit branding, contact info, and team details.

---

## Super Admin Panel

The Super Admin Panel is the operational command center for day-to-day platform management.

### Key Features

*   **User Management**
    *   Manage Buyer and Vendor accounts.
    *   Verify vendor identities and approve onboarding requests.

*   **Content Management**
    *   **Service Approval:** Review and approve/reject vendor services before they go live.
    *   **Content Moderation:** Monitor feeds and portfolio items for compliance.

*   **Financials**
    *   **Subscription Management:** View and manage vendor subscriptions.
    *   **Transaction Monitoring:** (Planned) Oversight of platform transactions.

*   **CMS Capabilities**
    *   **Carousel Management:** Update homepage banners and promotional slides.
    *   **Categories:** Manage service categories and tags.

---

## ACH Panel (Access Control Hub)

The ACH Panel is a specialized, advanced control interface for "Super Admins" and "Developers" to manage the platform's behavior without deploying new code. It acts as the "Brain" of the system.

### Located at: `/admin/access-control`

### 1. Feature Flags (`Zap` Icon)
*   **Purpose:** Enable or disable entire features instantly.
*   **Capabilities:**
    *   Toggle major modules (e.g., "Maintenance Mode", "Beta Features", "New Payment Gateway").
    *   Set features to "Active", "Inactive", or "Beta".

### 2. Role Permissions (`Lock` Icon)
*   **Purpose:** Granular control over what each user role can do.
*   **Capabilities:**
    *   Define permissions for `BUYER`, `VENDOR`, and `SUPER_ADMIN`.
    *   Example: Toggle "Can Upload Video" for Vendors globally.

### 3. Platform Configuration (`Settings` Icon)
*   **Purpose:** Manage global system variables.
*   **Capabilities:**
    *   Update API keys (if configured securely).
    *   Set global limits (e.g., "Max Upload Size", "Max Daily Orders").
    *   Modify UI text or system prompts dynamically.

### 4. Navigation Management (`Menu` Icon)
*   **Purpose:** Control the site's navigation structure.
*   **Capabilities:**
    *   Show/Hide menu items in Header/Footer.
    *   Reorder menu links.
    *   Update link destinations (URLs).

### 5. Announcements (`Megaphone` Icon)
*   **Purpose:** Broadcast messages to all users.
*   **Capabilities:**
    *   Create site-wide banners (Info, Warning, Success, Error).
    *   Set start/end dates for announcements.
    *   customize background/text colors for urgency.

### 6. Audit Log (`History` Icon)
*   **Purpose:** Security and accountability.
*   **Capabilities:**
    *   View a chronological history of who changed what in the ACH Panel.
    *   Track toggle changes, config updates, and permission grants.

---

## Technical Overview

*   **Frontend Framework:** Next.js (React)
*   **Styling:** Tailwind CSS with custom Design System
*   **Database:** Supabase (PostgreSQL)
*   **Authentication:** Supabase Auth
*   **Payment Gateway:** Dodo Payments
*   **Language:** TypeScript
