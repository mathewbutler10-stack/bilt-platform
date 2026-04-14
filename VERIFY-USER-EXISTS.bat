@echo off
echo 🔍 VERIFYING IF USER EXISTS IN SUPABASE AUTH
echo ============================================

echo.
echo Testing: owner@bilt.com / password123
echo.

echo 1. Trying signin endpoint...
curl -s -X POST "https://sniuhfijadbghoxfsnft.supabase.co/auth/v1/signin" ^
  -H "apikey: sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"owner@bilt.com\",\"password\":\"password123\"}"

echo.
echo.
echo 2. If that fails, create user...
echo.
echo Run: node create-auth-users-simple.js
echo.
echo 3. Then test again...
echo.
pause