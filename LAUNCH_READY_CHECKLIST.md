# 🚀 WENVEX Launch & Production Readiness Checklist

This document outlines the mandatory safety checks to be performed before merging code to `main` and deploying to production. Following these steps prevents server crashes and broken user experiences.

---

## 🛠️ 1. Development & Pre-Commit Checks
Before pushing any code to GitHub:

- [ ] **Run Type Checks**: Ensure no TypeScript errors exist.
  ```powershell
  npm run type-check --workspace=apps/buyer
  ```
- [ ] **Verify Local Build**: `npm run dev` hides errors that `npm run build` catches.
  ```powershell
  npm run build --workspace=apps/buyer
  ```
- [ ] **Suspense Boundaries**: If you used `useSearchParams()` or any Client-side hook in Next.js, verify it is wrapped in `<Suspense>`.
- [ ] **Environment Variables**: Verify that any new variables in `.env` are also added to the production server settings (Vercel/Heroku/Docker).
---

## 🌐 3. Post-Launch & Monitoring
Once the app is live:

- [ ] **Health Checks**: Access `/api/health` (to be implemented) to ensure the API and Database are communicating.
- [ ] **Error Tracking**: Monitor console logs or external tools (like Sentry) for runtime crashes.
- [ ] **Uptime Monitoring**: Use a tool like UptimeRobot to ping the site every 5 minutes.

---

## 🚨 4. Emergency Procedures (The "Reset" Button)
If the website goes down or a critical bug is found:

1. **Revert Immediately**: Don't try to "fix-forward" under pressure.
   ```powershell
   # Move back to the last known stable commit
   git reset --hard <STABLE_COMMIT_ID>
   git push origin main --force
   ```
2. **Clear Cache**: If issues persist, clear the build tool/deployment cache (e.g., Vercel's "Redeploy with clear cache").
3. **Notify**: Keep a record of major changes in `CHANGELOG.md` to identify what might have broken.

---

## ✅ Current Stable Baseline
- **Stable Commit**: `54902fc` (Verified working at 1:00 PM Jan 16, 2026)
- **Status**: Original UI and Backend logic restored.
