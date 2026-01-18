---
description: Deploy WENWEX platform to Vercel
---

# Vercel Deployment Workflow

This workflow guides you through deploying the WENWEX platform to Vercel.

## Prerequisites
- Code pushed to GitHub repository
- Vercel account created
- Supabase project configured

## Deployment Steps

### 1. Deploy API First
// turbo
```bash
# Build API locally to verify it works
cd apps/api && npm run build
```

Then in Vercel:
- Create new project → Import from GitHub
- **Root Directory:** `apps/api`
- **Framework:** Other
- **Build Command:** `npm run build`
- Set all environment variables from `.env.example`
- Deploy

### 2. Deploy Buyer App
In Vercel:
- Create new project → Same repository
- **Root Directory:** `apps/buyer`
- **Framework:** Next.js (auto-detected)
- Environment variables:
  - `NEXT_PUBLIC_API_URL` = your-api-url
  - `NEXT_PUBLIC_SUPABASE_URL` = your-supabase-url
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your-anon-key
- Deploy

### 3. Deploy Vendor App
In Vercel:
- Create new project → Same repository
- **Root Directory:** `apps/vendor`
- **Framework:** Next.js
- Same env vars as buyer
- Deploy

### 4. Deploy Admin App
In Vercel:
- Create new project → Same repository
- **Root Directory:** `apps/admin`
- **Framework:** Next.js
- Same env vars as buyer
- Deploy

### 5. Configure Domains (Optional)
For each project:
- Settings → Domains → Add domain
- Configure DNS as per Vercel instructions

### 6. Update CORS
After deployment, update API's `CORS_ORIGINS` with production URLs.

## Useful Commands

// turbo
```bash
# Verify builds locally before pushing
npm run build:buyer
npm run build:vendor
npm run build:admin
npm run build:api
```

## Troubleshooting
- Check Vercel logs: Project → Deployments → View Logs
- Verify environment variables are set
- See full guide: `VERCEL_DEPLOYMENT_GUIDE.md`
