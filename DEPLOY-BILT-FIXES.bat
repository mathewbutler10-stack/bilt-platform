@echo off
echo 🚀 DEPLOYING BILT LOGIN FIXES
echo =============================

echo.
echo Step 1: Login to Railway (opens browser)...
echo Run: railway login
echo.
echo Step 2: Link to BILT-PROD service...
echo Run: railway link
echo Select: bilt-prod-production
echo.
echo Step 3: Deploy current folder...
echo Run: railway up
echo.
echo Step 4: Wait for deployment (2-3 minutes)...
echo.
echo Step 5: Test login...
echo Go to: https://bilt-prod-production.up.railway.app/auth/login
echo Login: owner@bilt.com / password123
echo.
echo Expected outcome:
echo 1. Console shows: "✅ Using hardcoded Supabase values"
echo 2. No more: "Missing Supabase environment variables"
echo 3. Login works
echo 4. Redirects to dashboard
echo.
echo If Railway CLI fails, use dashboard:
echo 1. Go to Railway dashboard
echo 2. BILT-PROD service
echo 3. Click "Redeploy"
echo 4. Wait 3 minutes
echo.
pause