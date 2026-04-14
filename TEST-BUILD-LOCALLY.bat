@echo off
echo 🔧 TESTING BUILD LOCALLY
echo ========================

echo.
echo Step 1: Clean previous builds...
rmdir /s /q .next 2>nul

echo.
echo Step 2: Try build with limited memory...
set NODE_OPTIONS=--max-old-space-size=2048

echo.
echo Step 3: Run build (this will show exact error)...
npm run build

echo.
echo Step 4: If build succeeds...
echo.
echo Then deploy: railway up
echo.
echo Step 5: If build fails...
echo.
echo Copy the EXACT error message and send it to me.
echo.
pause