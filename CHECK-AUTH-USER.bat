@echo off
echo 🔍 CHECKING IF USER EXISTS IN SUPABASE AUTH
echo ============================================

echo.
echo Testing: owner@bilt.com
echo.

curl -s -X POST "https://sniuhfijadbghoxfsnft.supabase.co/auth/v1/token" ^
  -H "apikey: sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"owner@bilt.com\",\"password\":\"password123\"}"

echo.
echo.
echo 💡 If you see "Invalid login credentials", user doesn't exist.
echo 💡 Run: node create-auth-users-simple.js
echo.
pause