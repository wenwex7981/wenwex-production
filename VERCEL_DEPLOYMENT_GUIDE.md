# 🚀 WENWEX Platform - Vercel Deployment Guide

> **Complete step-by-step guide for deploying the WENWEX monorepo to Vercel**

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Architecture Overview](#-architecture-overview)
3. [Deployment Strategy](#-deployment-strategy)
4. [Step-by-Step Deployment](#-step-by-step-deployment)
5. [Environment Variables](#-environment-variables)
6. [Domain Configuration](#-domain-configuration)
7. [Post-Deployment Checklist](#-post-deployment-checklist)
8. [Troubleshooting](#-troubleshooting)
9. [Maintenance & Updates](#-maintenance--updates)

---

## ✅ Prerequisites

Before deploying, ensure you have:

| Requirement | Details |
|-------------|---------|
| **GitHub Account** | Repository must be pushed to GitHub |
| **Vercel Account** | Free tier available at [vercel.com](https://vercel.com) |
| **Supabase Project** | Database already configured |
| **Domain Names** (Optional) | Custom domains for production |

### Required Environment Variables Ready:
- Supabase URL and Keys
- JWT Secret
- Database Connection String
- Dodo Payments Keys (if using)

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    WENWEX PLATFORM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   BUYER     │  │   VENDOR    │  │   ADMIN     │         │
│  │  (Next.js)  │  │  (Next.js)  │  │  (Next.js)  │         │
│  │   Port 3000 │  │   Port 3001 │  │   Port 3002 │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│                   ┌──────▼──────┐                          │
│                   │     API     │                          │
│                   │  (Express)  │                          │
│                   │   Port 5000 │                          │
│                   └──────┬──────┘                          │
│                          │                                  │
│                   ┌──────▼──────┐                          │
│                   │  SUPABASE   │                          │
│                   │ (Database)  │                          │
│                   └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Projects:

| App | Vercel Project Name | Suggested Domain |
|-----|---------------------|------------------|
| Buyer | `wenwex-buyer` | `www.wenwex.com` |
| Vendor | `wenwex-vendor` | `vendor.wenwex.com` |
| Admin | `wenwex-admin` | `admin.wenwex.com` |
| API | `wenwex-api` | `api.wenwex.com` |

---

## 🎯 Deployment Strategy

### Why 4 Separate Vercel Projects?

1. **Independent Scaling** - Each app scales based on its own traffic
2. **Isolated Deployments** - Update buyer without affecting admin
3. **Separate Domains** - Clean URL structure for each user type
4. **Security Isolation** - Admin app has different security headers

### Recommended Deployment Order:

```
1. API (Backend)      → Must be deployed first
2. Buyer (Frontend)   → After API is live
3. Vendor (Frontend)  → After API is live
4. Admin (Frontend)   → After API is live
```

---

## 📝 Step-by-Step Deployment

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Production ready - Vercel deployment"

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/wenwex-platform.git

# Push to main branch
git push -u origin main
```

---

### Step 2: Deploy API (Backend)

#### 2.1 Create New Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `wenwex-platform` repository
4. Configure as follows:

| Setting | Value |
|---------|-------|
| **Project Name** | `wenwex-api` |
| **Framework Preset** | `Other` |
| **Root Directory** | `apps/api` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

#### 2.2 Set Environment Variables

Click **"Environment Variables"** and add:

```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=production
PORT=5000
API_VERSION=v1

# CORS (Update with your actual domains)
CORS_ORIGINS=https://www.wenwex.com,https://vendor.wenwex.com,https://admin.wenwex.com

# Frontend URLs
BUYER_URL=https://www.wenwex.com
VENDOR_URL=https://vendor.wenwex.com
ADMIN_URL=https://admin.wenwex.com

# Dodo Payments (if using)
DODO_API_KEY=your-dodo-api-key
DODO_WEBHOOK_SECRET=your-dodo-webhook-secret
DODO_ENVIRONMENT=live
```

#### 2.3 Deploy

Click **"Deploy"** and wait for the build to complete.

📝 **Note your API URL:** `https://wenwex-api.vercel.app` (or your custom domain)

---

### Step 3: Deploy Buyer App

#### 3.1 Create New Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the **same repository**
3. Configure:

| Setting | Value |
|---------|-------|
| **Project Name** | `wenwex-buyer` |
| **Framework Preset** | `Next.js` (auto-detected) |
| **Root Directory** | `apps/buyer` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |

#### 3.2 Set Environment Variables

```env
# API URL (from Step 2)
API_URL=https://wenwex-api.vercel.app

# Public variables (accessible in browser)
NEXT_PUBLIC_API_URL=https://wenwex-api.vercel.app
NEXT_PUBLIC_APP_NAME=WENWEX
NEXT_PUBLIC_APP_URL=https://www.wenwex.com

# Supabase (Public keys only)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 3.3 Deploy

Click **"Deploy"**

---

### Step 4: Deploy Vendor App

#### 4.1 Create New Vercel Project

| Setting | Value |
|---------|-------|
| **Project Name** | `wenwex-vendor` |
| **Framework Preset** | `Next.js` |
| **Root Directory** | `apps/vendor` |

#### 4.2 Set Environment Variables

```env
# API URL
API_URL=https://wenwex-api.vercel.app
NEXT_PUBLIC_API_URL=https://wenwex-api.vercel.app
NEXT_PUBLIC_APP_NAME=WENWEX Vendor
NEXT_PUBLIC_APP_URL=https://vendor.wenwex.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 4.3 Deploy

Click **"Deploy"**

---

### Step 5: Deploy Admin App

#### 5.1 Create New Vercel Project

| Setting | Value |
|---------|-------|
| **Project Name** | `wenwex-admin` |
| **Framework Preset** | `Next.js` |
| **Root Directory** | `apps/admin` |

#### 5.2 Set Environment Variables

```env
# API URL
API_URL=https://wenwex-api.vercel.app
NEXT_PUBLIC_API_URL=https://wenwex-api.vercel.app
NEXT_PUBLIC_APP_NAME=WENWEX Admin
NEXT_PUBLIC_APP_URL=https://admin.wenwex.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin-specific (optional)
NEXT_PUBLIC_ADMIN_MODE=true
```

#### 5.3 Deploy

Click **"Deploy"**

---

## 🔐 Environment Variables

### Complete Environment Variables Reference

#### API Server (`apps/api`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `DIRECT_URL` | ✅ | Direct database URL (for migrations) |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `JWT_SECRET` | ✅ | Secret for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | ⚪ | Token expiry (default: `7d`) |
| `NODE_ENV` | ✅ | Set to `production` |
| `PORT` | ⚪ | Server port (default: `5000`) |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed origins |
| `BUYER_URL` | ✅ | Buyer app URL |
| `VENDOR_URL` | ✅ | Vendor app URL |
| `ADMIN_URL` | ✅ | Admin app URL |
| `DODO_API_KEY` | ⚪ | Dodo Payments API key |
| `DODO_WEBHOOK_SECRET` | ⚪ | Dodo webhook secret |
| `DODO_ENVIRONMENT` | ⚪ | `sandbox` or `live` |

#### Frontend Apps (`buyer`, `vendor`, `admin`)

| Variable | Required | Description |
|----------|----------|-------------|
| `API_URL` | ✅ | Backend API URL (server-side) |
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL (client-side) |
| `NEXT_PUBLIC_APP_NAME` | ⚪ | App display name |
| `NEXT_PUBLIC_APP_URL` | ⚪ | Current app URL |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |

---

## 🌐 Domain Configuration

### Adding Custom Domains

1. Go to your Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `www.wenwex.com`)
3. Follow Vercel's DNS instructions

### Recommended Domain Setup

| Project | Primary Domain | Redirect From |
|---------|---------------|---------------|
| Buyer | `www.wenwex.com` | `wenwex.com` |
| Vendor | `vendor.wenwex.com` | - |
| Admin | `admin.wenwex.com` | - |
| API | `api.wenwex.com` | - |

### DNS Configuration Example (Cloudflare/GoDaddy)

```
Type    Name      Value                    TTL
------  --------  -----------------------  -----
A       @         76.76.21.21              Auto
CNAME   www       cname.vercel-dns.com     Auto
CNAME   vendor    cname.vercel-dns.com     Auto
CNAME   admin     cname.vercel-dns.com     Auto
CNAME   api       cname.vercel-dns.com     Auto
```

---

## ✅ Post-Deployment Checklist

### Immediate Checks

- [ ] **API Health Check**
  ```
  curl https://api.wenwex.com/api/v1/health
  ```

- [ ] **Buyer App Loads** - Visit `https://www.wenwex.com`
- [ ] **Vendor App Loads** - Visit `https://vendor.wenwex.com`
- [ ] **Admin App Loads** - Visit `https://admin.wenwex.com`

### Functional Testing

- [ ] User Registration works
- [ ] User Login works
- [ ] Service listings load
- [ ] Images load from Supabase
- [ ] Vendor onboarding works
- [ ] Admin dashboard loads
- [ ] Database queries work
- [ ] File uploads work

### Security Checks

- [ ] HTTPS is enforced (Vercel does this automatically)
- [ ] API CORS is correctly configured
- [ ] Admin is protected
- [ ] Sensitive routes require authentication

### Performance Checks

- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Check Core Web Vitals in Vercel Analytics
- [ ] Verify image optimization is working

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Fails - "Module not found"

**Cause:** Monorepo workspace dependencies not installed

**Fix:** Ensure `installCommand` in Vercel includes:
```bash
npm install --workspace=apps/buyer
```

Or set in Vercel dashboard:
- **Install Command:** `npm install`

#### 2. API 500 Errors

**Cause:** Environment variables not set correctly

**Fix:** 
1. Check Vercel logs: Project → **Deployments** → Click deployment → **View Logs**
2. Verify all required env vars are set
3. Redeploy after adding missing vars

#### 3. CORS Errors

**Cause:** Frontend URL not in API's `CORS_ORIGINS`

**Fix:** Update `CORS_ORIGINS` in API project:
```env
CORS_ORIGINS=https://www.wenwex.com,https://vendor.wenwex.com,https://admin.wenwex.com
```

#### 4. Images Not Loading

**Cause:** Supabase storage bucket not public or incorrect URL

**Fix:**
1. Go to Supabase → Storage → Select bucket → Make public
2. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct

#### 5. Database Connection Timeout

**Cause:** Connection pooling issues with serverless

**Fix:** Use Supabase connection pooler:
```env
DATABASE_URL=postgres://postgres:[PASSWORD]@[PROJECT_REF].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Viewing Logs

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Deployments**
4. Click deployment → **View Logs**
5. Check **Runtime Logs** for API errors

---

## 🔄 Maintenance & Updates

### Automatic Deployments

Vercel automatically deploys when you push to `main` branch:

```bash
# Make changes
git add .
git commit -m "Update: feature description"
git push origin main

# Vercel auto-deploys in ~2 minutes
```

### Manual Redeployment

1. Go to project → **Deployments**
2. Click **"..."** on latest deployment
3. Select **"Redeploy"**

### Environment Variable Updates

1. Go to project → **Settings** → **Environment Variables**
2. Edit variable
3. Click **"Redeploy"** (required for changes to take effect)

### Preview Deployments

Every PR gets a unique preview URL:
```
https://wenwex-buyer-git-feature-branch-username.vercel.app
```

Use this for testing before merging to `main`.

---

## 📊 Monitoring & Analytics

### Built-in Vercel Analytics

1. Enable in project → **Analytics** tab
2. Track:
   - Page views
   - Core Web Vitals
   - Geographic distribution
   - Real User Monitoring (RUM)

### Recommended Additional Tools

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking |
| **LogRocket** | Session replay |
| **Supabase Dashboard** | Database monitoring |

---

## 🆘 Support Resources

| Resource | Link |
|----------|------|
| Vercel Documentation | [vercel.com/docs](https://vercel.com/docs) |
| Next.js on Vercel | [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment) |
| Supabase Docs | [supabase.com/docs](https://supabase.com/docs) |
| Vercel Status | [vercel-status.com](https://vercel-status.com) |

---

## 📝 Quick Reference Card

```
┌────────────────────────────────────────────────────────────┐
│                 WENWEX DEPLOYMENT QUICK REF                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  PROJECTS:                                                 │
│  • wenwex-api    → Root: apps/api    → Express Serverless  │
│  • wenwex-buyer  → Root: apps/buyer  → Next.js             │
│  • wenwex-vendor → Root: apps/vendor → Next.js             │
│  • wenwex-admin  → Root: apps/admin  → Next.js             │
│                                                            │
│  DEPLOY ORDER: API → Buyer → Vendor → Admin                │
│                                                            │
│  KEY ENV VARS:                                             │
│  • API_URL / NEXT_PUBLIC_API_URL                          │
│  • NEXT_PUBLIC_SUPABASE_URL                               │
│  • NEXT_PUBLIC_SUPABASE_ANON_KEY                          │
│  • DATABASE_URL (API only)                                 │
│  • JWT_SECRET (API only)                                   │
│                                                            │
│  LOGS: Project → Deployments → View Logs                   │
│  REDEPLOY: After env var changes                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

**🎉 Congratulations! Your WENWEX platform is now deployed on Vercel!**

*Last updated: January 2026*
