@echo off
echo 🔍 COMPREHENSIVE LOGIN DIAGNOSIS
echo =================================

echo.
echo 1. Testing Supabase API Connection...
curl -s -X POST "https://sniuhfijadbghoxfsnft.supabase.co/auth/v1/token?grant_type=password" ^
  -H "apikey: sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"owner@bilt.com\",\"password\":\"password123\"}" ^
  | findstr "access_token"

if %errorlevel% equ 0 (
    echo ✅ Supabase API works - User exists
) else (
    echo ❌ Supabase API failed - Check credentials
)

echo.
echo 2. Testing BILT Health...
curl -s "https://bilt-prod-production.up.railway.app/api/health"

echo.
echo.
echo 3. Testing CORS Configuration...
curl -s -I "https://bilt-prod-production.up.railway.app/auth/login" ^
  | findstr "Access-Control"

echo.
echo 4. Checking Railway Deployment...
echo.
echo Go to Railway dashboard:
echo 1. BILT-PROD service
echo 2. Deployments tab
echo 3. Latest deployment time?
echo 4. Logs tab - any errors?
echo.
echo 5. Browser Console Check:
echo.
echo Open: https://bilt-prod-production.up.railway.app/auth/login
echo Press F12 → Console
echo Look for:
echo - "Missing Supabase environment variables" ❌
echo - Any red error messages
echo - Network tab → auth requests
echo.
echo 6. Immediate Fix:
echo.
echo In browser console (F12), paste:
echo.
echo window.NEXT_PUBLIC_SUPABASE_URL='https://sniuhfijadbghoxfsnft.supabase.co';
echo window.NEXT_PUBLIC_SUPABASE_ANON_KEY='sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb';
echo console.log('✅ Fix applied');
echo.
echo Then try login.
echo.
pause