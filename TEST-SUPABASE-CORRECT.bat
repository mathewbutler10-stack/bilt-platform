@echo off
echo 🔍 TESTING SUPABASE CORRECTLY
echo =============================

echo.
echo 1. Testing Authentication (CORRECT endpoint)...
curl -s -X POST "https://sniuhfijadbghoxfsnft.supabase.co/auth/v1/signin" ^
  -H "apikey: sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"owner@bilt.com\",\"password\":\"password123\"}"

echo.
echo.
echo 2. Testing with password grant (alternative)...
curl -s -X POST "https://sniuhfijadbghoxfsnft.supabase.co/auth/v1/token?grant_type=password" ^
  -H "apikey: sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"owner@bilt.com\",\"password\":\"password123\"}"

echo.
echo.
echo 3. Testing BILT Health...
curl -s "https://bilt-prod-production.up.railway.app/api/health"

echo.
echo.
echo 💡 INTERPRETATION:
echo.
echo If you see "access_token": User exists, auth works ✅
echo If you see "Invalid login credentials": User doesn't exist ❌
echo If you see other error: Different issue 🔧
echo.
pause