@echo off
echo 🚀 DEPLOYING BILT LOGIN FIXES TO RAILWAY
echo ========================================

echo.
echo This will deploy the login fixes to production.
echo.

echo Step 1: Checking current code...
if exist "lib\supabase\robust-client.ts" (
    echo ✅ Robust client exists
) else (
    echo ❌ Robust client missing
    exit /b 1
)

echo.
echo Step 2: Checking Railway CLI...
where railway >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Railway CLI installed
) else (
    echo ❌ Railway CLI not installed
    echo Installing Railway CLI...
    npm install -g @railway/cli
)

echo.
echo Step 3: Login to Railway (if needed)...
echo Run: railway login
echo.
echo Step 4: Link to BILT-PROD service...
echo Run: railway link
echo Select: BILT-PROD
echo.
echo Step 5: Deploy current folder...
echo Run: railway up
echo.
echo Step 6: Wait for deployment (2-3 minutes)...
echo.
echo Step 7: Test login...
echo Go to: https://bilt-prod-production.up.railway.app/auth/login
echo Login: owner@bilt.com / password123
echo.
echo Expected outcome:
echo 1. Console shows: "✅ Using hardcoded Supabase values"
echo 2. No more: "Missing Supabase environment variables"
echo 3. Login works
echo 4. Redirects to dashboard
echo.
echo If login still fails:
echo 1. Press F12 → Console
echo 2. Send me the EXACT error
echo 3. I'll fix it immediately
echo.
pause