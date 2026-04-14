@echo off
echo 🔍 TESTING SUPABASE API CONNECTION
echo ====================================

echo.
echo 1. Testing Supabase Health...
curl -s "https://sniuhfijadbghoxfsnft.supabase.co/rest/v1/" ^
  -H "apikey: sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 2. Testing Authentication...
curl -s -X POST "https://sniuhfijadbghoxfsnft.supabase.co/auth/v1/token" ^
  -H "apikey: sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"owner@bilt.com\",\"password\":\"password123\"}"

echo.
echo.
echo 3. Testing BILT Health Endpoint...
curl -s "https://bilt-prod-production.up.railway.app/api/health"

echo.
echo.
echo ✅ Tests complete
pause