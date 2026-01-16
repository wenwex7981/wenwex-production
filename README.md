# 🌐 WENVEX - Enterprise Tech-Commerce Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

> **WENVEX** is a global tech-commerce marketplace where verified agencies and academic service providers sell services as structured products. A product of **Project Genie Tech Solutions**.

🌍 **Website:** [wenvex.online](https://wenvex.online)  
📧 **Contact:** wenvex19@gmail.com | +91 7981994870

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

---

## 🎯 Overview

WENVEX is an enterprise-grade platform consisting of three interconnected applications:

| Application | Description | Port |
|-------------|-------------|------|
| **Buyer Website** | Public marketplace for browsing and purchasing services | 3000 |
| **Vendor Dashboard** | Agency management portal for service providers | 3001 |
| **Admin Dashboard** | Super admin control panel for platform management | 3002 |
| **API Server** | Backend REST API serving all applications | 5000 |

### Key Features

- 🛒 **Amazon/Flipkart-style UX** for service discovery
- 🏢 **Verified Vendor System** with document verification
- 📱 **Shorts/Reels** for service promotion
- 🎓 **Academic Services** section for students
- 💳 **Subscription-based** vendor model (country-wise pricing)
- 🔐 **Role-based Access Control** (Buyer, Vendor, Super Admin)
- 🌍 **Multi-currency Support** for global operations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        WENVEX PLATFORM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Buyer     │  │   Vendor    │  │   Admin     │             │
│  │   Website   │  │  Dashboard  │  │  Dashboard  │             │
│  │  (Next.js)  │  │  (Next.js)  │  │  (Next.js)  │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          │                                      │
│                    ┌─────▼─────┐                                │
│                    │  REST API │                                │
│                    │ (Express) │                                │
│                    └─────┬─────┘                                │
│                          │                                      │
│         ┌────────────────┼────────────────┐                     │
│         │                │                │                     │
│  ┌──────▼──────┐ ┌───────▼──────┐ ┌───────▼──────┐             │
│  │  Supabase   │ │   Supabase   │ │    Dodo      │             │
│  │   (Auth)    │ │  (Database)  │ │  (Payments)  │             │
│  └─────────────┘ └──────────────┘ └──────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), React 19, TailwindCSS |
| **Backend** | Node.js 20, Express.js |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Supabase Auth (Email + Google OAuth) |
| **Storage** | Supabase Storage |
| **Payments** | Dodo Payments (Hosted Links) |
| **Animations** | Framer Motion |
| **Deployment** | Vercel (Frontend), Railway (Backend) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- Dodo Payments account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/wenvex.git
cd wenvex
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

3. **Configure environment variables**
```bash
# Copy example env files
cp .env.example .env
cp apps/buyer/.env.example apps/buyer/.env.local
cp apps/vendor/.env.example apps/vendor/.env.local
cp apps/admin/.env.example apps/admin/.env.local
cp apps/api/.env.example apps/api/.env
```

4. **Set up database**
```bash
# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

5. **Start development servers**
```bash
# Start all applications
npm run dev

# Or start individually
npm run dev:buyer   # Port 3000
npm run dev:vendor  # Port 3001
npm run dev:admin   # Port 3002
npm run dev:api     # Port 5000
```

---

## 📁 Project Structure

```
wenvex/
├── apps/
│   ├── buyer/              # Buyer/Client Website (Next.js)
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── public/
│   │
│   ├── vendor/             # Vendor Dashboard (Next.js)
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── public/
│   │
│   ├── admin/              # Super Admin Dashboard (Next.js)
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── public/
│   │
│   └── api/                # Backend API (Express)
│       ├── src/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── models/
│       │   ├── routes/
│       │   ├── services/
│       │   └── utils/
│       └── prisma/
│
├── packages/
│   ├── shared/             # Shared utilities & types
│   ├── ui/                 # Shared UI components
│   └── database/           # Database schema & migrations
│
├── docs/                   # Documentation
├── scripts/                # Build & deployment scripts
└── .github/                # GitHub Actions workflows
```

---

## 🔐 Environment Variables

### API Server (.env)
```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Dodo Payments
DODO_API_KEY=xxx
DODO_WEBHOOK_SECRET=xxx

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Frontend Apps (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

## 📊 Database Schema

See [Database Documentation](./docs/database.md) for complete schema details.

### Core Tables
- `users` - User accounts (all roles)
- `vendors` - Vendor/Agency profiles
- `services` - Service listings
- `categories` - Main categories
- `sub_categories` - Sub-categories
- `service_media` - Service images/videos
- `vendor_portfolio` - Vendor portfolio items
- `shorts` - Short videos/reels
- `follows` - Follow relationships
- `subscriptions` - Vendor subscriptions
- `reviews` - Service reviews
- `admin_logs` - Admin action logs

---

## 📚 API Documentation

API documentation is available at `/api/docs` when running the development server.

See [API Documentation](./docs/api.md) for detailed endpoint specifications.

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Deploy buyer website
vercel --cwd apps/buyer

# Deploy vendor dashboard
vercel --cwd apps/vendor

# Deploy admin dashboard
vercel --cwd apps/admin
```

### Backend (Railway)
```bash
# Using Railway CLI
railway up --service api
```

---

## 📄 License

This project is proprietary software owned by **Project Genie Tech Solutions**.

---

## 📞 Contact

- **Website:** [wenvex.online](https://wenvex.online)
- **Email:** wenvex19@gmail.com
- **Phone:** +91 7981994870

---

*WENVEX is a product of Project Genie Tech Solutions*
