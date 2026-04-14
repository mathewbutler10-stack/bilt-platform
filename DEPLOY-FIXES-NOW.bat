@echo off
echo 🚀 DEPLOYING BILT LOGIN FIXES TO RAILWAY
echo ========================================

echo.
echo Step 1: Checking current state...
echo.

call .\CHECK-AUTH-USER.bat

echo.
echo Step 2: Testing Supabase connection...
echo.

curl -s "https://sniuhfijadbghoxfsnft.supabase.co/rest/v1/" ^
  -H "apikey: sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb" ^
  -H "Content-Type: application/json" ^
  | findstr "message"

echo.
echo Step 3: Deploying fixes to Railway...
echo.
echo OPTION A: Railway CLI (Recommended)
echo -----------------------------------
echo 1. Install: npm install -g @railway/cli
echo 2. Login: railway login
echo 3. Link: railway link (select BILT-PROD)
echo 4. Deploy: railway up
echo.
echo OPTION B: Manual Redeploy
echo -------------------------
echo 1. Go to Railway dashboard
echo 2. BILT-PROD service
echo 3. Click "Redeploy"
echo 4. Wait 3 minutes
echo.
echo OPTION C: Update Source
echo -----------------------
echo 1. Railway dashboard → BILT-PROD
echo 2. Settings → Source
echo 3. Update to current folder
echo 4. Redeploy
echo.
echo Step 4: Verify deployment...
echo.

curl -s "https://bilt-prod-production.up.railway.app/api/health"

echo.
echo.
echo ✅ Deployment instructions complete
echo.
echo AFTER DEPLOYING:
echo 1. Go to: https://bilt-prod-production.up.railway.app/auth/login
echo 2. Press F12 → Console
echo 3. Should see: "✅ Using hardcoded Supabase values"
echo 4. Login: owner@bilt.com / password123
echo.
pause