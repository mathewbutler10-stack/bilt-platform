@echo off
echo 🚀 BILT PLATFORM - RAILWAY DEPLOYMENT FIX SCRIPT
echo ================================================
echo.
echo CURRENT ISSUE: Railway auto-deploy not updating despite git pushes
echo LAST COMMIT: 4ad5f0b - "Add static gym dashboard that always works"
echo DEPLOYMENT STATUS: Health endpoint works (200), new routes return 404
echo.
echo DIAGNOSIS: Railway deployment pipeline stuck or build failing silently
echo.
echo FIX OPTIONS:
echo.
echo OPTION 1: Manual Redeploy via Railway Dashboard
echo ----------------------------------------------
echo 1. Go to https://railway.app/project/c7779a37-f340-4bcd-b353-426c8e4a565a
echo 2. Click "BILT-PROD" service
echo 3. Click "Redeploy" button
echo 4. Wait 3-5 minutes for build
echo 5. Test: https://bilt-prod-production.up.railway.app/gym/static
echo.
echo OPTION 2: Railway CLI Redeploy
echo ------------------------------
echo 1. Install: npm install -g @railway/cli
echo 2. Login: railway login
echo 3. Link: railway link (select BILT-PROD project)
echo 4. Deploy: railway up --service BILT-PROD
echo.
echo OPTION 3: Force Git Sync
echo -------------------------
echo 1. Railway dashboard → BILT-PROD → Settings → Source
echo 2. Disconnect GitHub
echo 3. Reconnect GitHub (force fresh sync)
echo 4. Trigger manual redeploy
echo.
echo OPTION 4: Build Locally & Deploy
echo --------------------------------
echo 1. Run: docker build -t bilt-platform .
echo 2. Test locally: docker run -p 3000:3000 bilt-platform
echo 3. If build succeeds, Railway issue is deployment pipeline
echo 4. Use Railway CLI to push built image
echo.
echo DIAGNOSTIC STEPS:
echo.
echo 1. Check Railway logs:
echo    railway logs --service BILT-PROD
echo.
echo 2. Check build status:
echo    railway status --service BILT-PROD
echo.
echo 3. Test current deployment:
echo    curl https://bilt-prod-production.up.railway.app/api/health
echo    curl https://bilt-prod-production.up.railway.app/gym/static
echo.
echo 4. Verify environment variables:
echo    railway variables list --service BILT-PROD
echo.
echo IMMEDIATE WORKAROUND:
echo.
echo Since static dashboard returns 404, create alternative route:
echo 1. Add route: /demo/gym (working fallback)
echo 2. Commit and push
echo 3. Test if new route deploys
echo.
echo TROUBLESHOOTING:
echo.
echo If health endpoint works but new routes don't:
echo - Build succeeded but routing failed
echo - Check Next.js routing configuration
echo - Verify static file serving
echo.
echo If no routes work:
echo - Build failed completely
echo - Check Docker build logs
echo - Verify package.json scripts
echo.
echo NEXT ACTIONS:
echo.
echo 1. Mat: Check Railway dashboard for deployment status
echo 2. Mat: Trigger manual redeploy if available
echo 3. Alfred: Create working fallback route
echo 4. Alfred: Begin workout management UI integration
echo.
echo STATUS: Deployment pipeline investigation in progress
echo CREATED: Thursday, April 16, 2026 - 9:15 PM AEDT
echo.
pause