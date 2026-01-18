# How to Set Up Your Safe "Development" Environment

This guide explains step-by-step how to create a separate environment so you can build and break things without affecting your real users or data.

## Phase 1: Create the New Database (Supabase)

1.  **Log in to Supabase**: Go to [supabase.com/dashboard](https://supabase.com/dashboard).
2.  **Create New Project**:
    *   Click **"New Project"**.
    *   **Name**: `WENWEX Dev` (This helps you distinguish it from your main `WENWEX Prod`).
    *   **Region**: Choose the same region as your main project (e.g., Mumbai, Singapore).
    *   **Password**: Generate a strong password and **save it safely** (you will need it in Step 3).
3.  **Wait for Setup**: It takes about 2-3 minutes for Supabase to provision the database.

## Phase 2: Get Your Credentials

Once the project status is **"Active"** (Green):

1.  **Get API Keys**:
    *   Go to **Project Settings** (Cog icon) -> **API**.
    *   Copy the `Project URL`.
    *   Copy the `anon` / `public` key.
2.  **Get Database Connection String**:
    *   Go to **Project Settings** -> **Database**.
    *   Find **Connection String** -> **URI** tab.
    *   Copy the string. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.project.supabase.co:5432/postgres`.
    *   **Important**: Replace `[YOUR-PASSWORD]` with the password you created in Phase 1.

## Phase 3: Connect Your Local Computer

We will now verify your local environment is pointing to this new safe database.

1.  **Backup Production Keys**:
    *   In your VS Code logic root (`c:\wenwex full stack`), find the `.env` file.
    *   Rename it to `.env.production`. (These are your REAL keys. Keep them safe).
2.  **Create New Dev Keys**:
    *   Create a new file named `.env`.
    *   Paste your **NEW** credentials from Phase 2:

```env
# New Dev Interface Access
NEXT_PUBLIC_SUPABASE_URL="[PASTE YOUR NEW PROJECT URL]"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[PASTE YOUR NEW ANON KEY]"

# New Dev Database Connection
DATABASE_URL="[PASTE YOUR NEW DB CONNECTION STRING]"
DIRECT_URL="[PASTE YOUR NEW DB CONNECTION STRING]"
```

## Phase 4: Install the Database Structure

Your new database is currently empty. We need to install the tables (Services, vendors, etc.).

1.  **Open Terminal** in `c:\wenwex full stack`.
2.  **Push Schema**: Run this command to create all tables automatically:
    ```bash
    npx prisma db push
    ```
    *   *Success Message*: "🚀  Your database is now in sync with your Prisma schema."

3.  **Seed Initial Data**: Since the database is empty, you need to verify if you want to run any setup scripts. You can run one of your existing fix/seed scripts to populate basic data:
    ```bash
    # Example: Run the fix script to set up defaults and admin tables
    node packages/database/fix-everything.js
    ```

## Phase 5: Verification

1.  **Start the App**: `npm run dev`
2.  **Check**: The website should load, but it will be empty (no services, no vendors).
3.  **Test**: Create a new Vendor account.
    *   If it works, CONGRATULATIONS! You are now working on `Dev`.
    *   You can delete this vendor, mess up the profile, or wipe the database, and your **Real Request** on the other project remains untouched.

---

## Switching Back to Production

When you are ready to deploy:
1.  Rename `.env` -> `.env.development`
2.  Rename `.env.production` -> `.env`
3.  Deploy.
