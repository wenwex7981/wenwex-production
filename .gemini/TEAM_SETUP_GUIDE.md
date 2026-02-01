# 🚀 Quick Setup Guide - Team Management Feature

## Before You Start Testing

### ⚠️ IMPORTANT: Run Database Migration First!

The team management feature requires a database table. Follow these steps:

---

## Step 1: Run the Migration

### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Open the file: `packages/database/migrations/team-members.sql`
4. Copy **ALL** the SQL code
5. Paste into the SQL Editor
6. Click **RUN** button
7. Wait for success message ✅

### Option B: Using Supabase CLI
```bash
# From project root
npx supabase db push
```

---

## Step 2: Verify Migration Success

Run this query in SQL Editor to confirm:
```sql
SELECT * FROM team_members;
```

You should see 5 default team members including Appala Nithin Patel.

---

## Step 3: Test the Homepage

1. Start your buyer app:
   ```bash
   cd apps/buyer
   npm run dev
   ```

2. Open: `http://localhost:3000`
3. Scroll to the **"Our Visionary Leadership & Team"** section
4. You should see the founder's photo and name displayed correctly

---

## Step 4: Test the Admin Panel

1. Start your admin app:
   ```bash
   cd apps/admin
   npm run dev
   ```

2. Open: `http://localhost:3002/admin` (or your admin URL)
3. Login with your admin credentials
4. Look for **"Team Management"** in the sidebar
5. Click it to access the team editor

---

## Step 5: Try Adding a Member

1. Click **"Add Team Member"** button
2. Fill in:
   - **Name:** Test Member
   - **Role:** Test Role
   - **Image URL:** https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop
   - **LinkedIn:** https://linkedin.com/in/test
   - **Display Order:** 10
3. Click **"Add Member"**
4. Go back to the homepage and refresh
5. The new member should appear at the end!

---

## Step 6: Try Editing

1. In the admin panel, click the **Edit (pencil)** icon
2. Change the name or role
3. Click **Save (checkmark)** icon
4. Refresh the homepage to see changes

---

## Step 7: Try Hiding a Member

1. Click the **Active** badge to make it **Inactive**
2. Refresh the homepage
3. That member should disappear!
4. Toggle it back to **Active** to restore visibility

---

## 🎉 Success Checklist

- [ ] Database migration completed
- [ ] Homepage shows team members
- [ ] Admin panel has Team Management section
- [ ] Can add new members
- [ ] Can edit existing members
- [ ] Can delete members (with confirmation)
- [ ] Can toggle active/inactive
- [ ] Changes reflect on homepage immediately

---

## 🆘 Troubleshooting

### "Table doesn't exist" error
**Solution:** Run the migration (Step 1)

### "API error" or members don't load
**Solution:** 
1. Check your `.env` file has:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```
2. Restart the dev server

### Founder image doesn't show
**Solution:** The image is at `/founder-profile.jpg`. Make sure the file exists in `apps/buyer/public/`

### Team Management not in sidebar
**Solution:** Clear browser cache and refresh admin panel

---

## 🔄 Rollback (If Needed)

If something goes wrong and you need to revert:

```bash
# Revert the latest commit
git revert HEAD

# Or go back to the previous commit
git reset --hard HEAD~1

# Remove the database table
# Run this in Supabase SQL Editor:
DROP TABLE IF EXISTS team_members CASCADE;
```

---

## 📞 Support

If you encounter issues:
1. Check the full documentation: `.gemini/TEAM_MANAGEMENT_DOCUMENTATION.md`
2. Review the git commits for changes made
3. Contact your development team

---

**Created:** February 1, 2026  
**Project:** WENWEX Platform (₹30 Lakh)  
**Feature:** Team Management System  

✨ **Happy Managing!** ✨
