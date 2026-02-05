# How to Fix the Flutter Build Error

The error `'C:\Users\kamboja' is not recognized` happens because your Flutter SDK is in a folder with spaces in the name (`kamboja Srilaxmi`). You need to move it to a simple path like `C:\flutter`.

## Step 1: Move the Flutter Folder
1. Open **File Explorer**.
2. Go to: `C:\Users\kamboja Srilaxmi\Downloads\flutter_windows_3.38.5-stable`
3. Find the `flutter` folder inside.
4. **Cut** the `flutter` folder (Ctrl+X).
5. Go to your **C: Drive** (`C:\`).
6. **Paste** the folder here (Ctrl+V).
   - Your new path should be exactly: `C:\flutter`

## Step 2: Update Environment Variables
1. Press the **Windows Key** and type **"env"**.
2. Select **"Edit the system environment variables"**.
3. Click the **"Environment Variables..."** button (bottom right).
4. Under **"User variables"** (top section), find the row named `Path` and select it.
5. Click **"Edit..."**.
6. Look for the old line: `C:\Users\kamboja Srilaxmi\Downloads\flutter_windows_3.38.5-stable\flutter\bin`
7. Select it and click **"Edit"** (or Delete and New).
8. Change it to: `C:\flutter\bin`
9. Click **OK** on all windows to save and close.

## Step 3: Verify the Fix
1. Close your current terminal/VS Code (important to refresh the path).
2. Open a new terminal.
3. Type: `where flutter`
   - It should say: `C:\flutter\bin\flutter`
   - If it says the old path, try restarting your computer.

## Step 4: Build the APK
1. Open VS Code again.
2. Navigate to the project:
   ```powershell
   cd apps/buyer_app
   ```
3. Run the build command:
   ```powershell
   flutter build apk
   ```

It should now work!
