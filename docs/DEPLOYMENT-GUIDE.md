# BILT Platform - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the BILT Platform to production. The platform is built with Next.js 14 (App Router) and uses Supabase for database and authentication.

## Prerequisites

### 1. Accounts Required
- [ ] **Supabase Account** - For database and authentication
- [ ] **Railway Account** - For hosting (recommended)
- [ ] **Vercel Account** - Alternative hosting option
- [ ] **Resend Account** - For email notifications (optional)
- [ ] **Sentry Account** - For error tracking (optional)

### 2. Local Development Setup
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### 3. Required Information
- [ ] Supabase project URL and API keys
- [ ] Custom domain (optional)
- [ ] SSL certificate (auto-provisioned by Railway/Vercel)

## Deployment Options

### Option 1: Railway (Recommended)
**Pros:** Auto-scaling, built-in PostgreSQL, zero-downtime deployments  
**Cons:** Limited free tier, requires credit card for production

### Option 2: Vercel
**Pros:** Excellent Next.js support, generous free tier, fast deployments  
**Cons:** Database separate, more configuration needed

### Option 3: Self-hosted
**Pros:** Full control, no vendor lock-in  
**Cons:** Requires infrastructure management

## Step-by-Step Deployment

### Phase 1: Database Setup (Supabase)

#### 1.1 Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Enter project details:
   - **Name:** `bilt-prod`
   - **Database Password:** Generate strong password
   - **Region:** Choose closest to your users
4. Click "Create new project"

#### 1.2 Configure Database
1. Wait for project to be ready (2-3 minutes)
2. Navigate to **SQL Editor**
3. Run migration scripts in order:
   ```sql
   -- Run each script separately
   -- 1. Core schema
   -- 2. Edge function tables
   -- 3. RLS policies
   -- 4. Demo data
   ```
4. Verify tables are created (should see 54 tables)

#### 1.3 Configure Authentication
1. Go to **Authentication → Settings**
2. Configure:
   - **Site URL:** Your deployment URL
   - **Redirect URLs:** Add your domain
   - **Email Templates:** Customize if needed
3. Go to **Authentication → Users**
4. Create demo users:
   - `owner@bilt.com`
   - `gym@bilt.com`
   - `pt@bilt.com`
   - `client@bilt.com`
   - **Password for all:** `password123`

#### 1.4 Get API Keys
1. Go to **Project Settings → API**
2. Copy:
   - **Project URL**
   - **anon public** key
   - **service_role** key (keep secret!)

### Phase 2: Hosting Setup (Railway)

#### 2.1 Create Railway Project
1. Go to [Railway Dashboard](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect to: `github.com/mathewbutler10-stack/bilt`
5. Click "Deploy"

#### 2.2 Configure Environment Variables
1. In Railway dashboard, go to **Variables**
2. Add the following:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # App
   NEXTAUTH_SECRET=generate-with: openssl rand -base64 32
   NEXTAUTH_URL=https://your-domain.railway.app
   
   # Optional: Email
   RESEND_API_KEY=your-resend-key
   EMAIL_FROM=noreply@your-domain.com
   
   # Optional: Analytics
   SENTRY_DSN=your-sentry-dsn
   ```

#### 2.3 Configure Domain (Optional)
1. Go to **Settings → Domains**
2. Add custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning

#### 2.4 Configure Database (Railway PostgreSQL)
1. In Railway, add **PostgreSQL** service
2. Connect to your app service
3. Update environment variables with Railway DB URL
4. Run migrations against Railway DB if not using Supabase

### Phase 3: Application Deployment

#### 3.1 Build Configuration
1. Ensure `next.config.js` is configured:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'standalone', // For Docker deployment
     images: {
       domains: ['your-domain.com'],
     },
   }
   ```

2. Verify `package.json` scripts:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint"
     }
   }
   ```

#### 3.2 Deploy to Railway
1. Railway automatically deploys on git push
2. Monitor deployment in Railway dashboard
3. Check build logs for errors
4. Verify deployment URL works

#### 3.3 Initial Setup
1. Access your deployed app
2. Login with demo credentials
3. Verify all features work:
   - Authentication
   - Dashboard loading
   - Edge function APIs
   - Database connections

### Phase 4: Post-Deployment

#### 4.1 Monitoring Setup
1. **Railway Metrics:** Check CPU, memory, network
2. **Application Logs:** View in Railway dashboard
3. **Error Tracking:** Configure Sentry (optional)
4. **Performance:** Use Next.js Analytics or similar

#### 4.2 Security Hardening
1. **Environment Variables:** Ensure all secrets are set
2. **Database:** Enable RLS, audit logging
3. **Authentication:** Configure MFA, session management
4. **Network:** Configure firewall rules if self-hosting

#### 4.3 Backup Strategy
1. **Database Backups:** Supabase automatic or manual exports
2. **Code Backups:** GitHub repository
3. **Media Backups:** Cloud storage for uploads
4. **Configuration Backups:** Export env vars regularly

#### 4.4 Scaling Considerations
1. **Vertical Scaling:** Increase Railway plan as needed
2. **Horizontal Scaling:** Add more instances
3. **Database Scaling:** Upgrade Supabase plan
4. **CDN:** Configure for static assets

## Testing Deployment

### Smoke Tests
```bash
# Test API endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/edge-functions/calculate-nutrition-targets/health

# Test authentication
# Try login with demo credentials

# Test database connection
# Verify data loads in dashboard
```

### Integration Tests
1. **User Flows:**
   - Registration → Onboarding → Dashboard
   - PT creating meal plan → Client viewing plan
   - Check-in cycle → Response → Analysis

2. **Edge Functions:**
   - Test each edge function with sample data
   - Verify database persistence
   - Check error handling

### Performance Tests
1. **Load Testing:** Simulate multiple users
2. **Response Times:** API endpoints < 500ms
3. **Database Queries:** Optimize slow queries

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
**Symptoms:** "Database error" or timeout
**Solutions:**
- Verify Supabase URL and keys
- Check network connectivity
- Verify RLS policies allow access
- Check if database is running

#### 2. Authentication Not Working
**Symptoms:** Login fails, redirect loops
**Solutions:**
- Verify NEXTAUTH_URL matches deployment URL
- Check NEXTAUTH_SECRET is set
- Verify Supabase auth configuration
- Check redirect URLs in Supabase

#### 3. Build Failures
**Symptoms:** Deployment fails, build errors
**Solutions:**
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Check for TypeScript errors
- Review build logs for specific errors

#### 4. Environment Variables Missing
**Symptoms:** App crashes, features not working
**Solutions:**
- Verify all required env vars are set
- Check variable names match code
- Restart app after adding env vars
- Use .env.example as reference

### Debugging Steps

1. **Check Logs:**
   ```bash
   # Railway logs
   railway logs
   
   # Application logs
   # Check console output in browser
   ```

2. **Verify Configuration:**
   - Environment variables
   - Database connections
   - API endpoints

3. **Test Locally:**
   - Reproduce issue locally
   - Use same environment variables
   - Check for differences

4. **Isolate Components:**
   - Test database separately
   - Test authentication separately
   - Test edge functions individually

## Maintenance

### Regular Tasks

#### Daily
- [ ] Check application logs for errors
- [ ] Monitor performance metrics
- [ ] Verify backups are running

#### Weekly
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Test restore from backup

#### Monthly
- [ ] Security audit
- [ ] Performance optimization
- [ ] User feedback review

### Updates

#### Application Updates
1. **Code Updates:**
   - Pull latest changes
   - Run tests
   - Deploy to staging
   - Verify functionality
   - Deploy to production

2. **Database Migrations:**
   - Backup database first
   - Run migration scripts
   - Verify data integrity
   - Update application if needed

3. **Infrastructure Updates:**
   - Plan maintenance window
   - Communicate to users
   - Perform updates
   - Verify functionality

### Scaling

#### When to Scale
- **CPU > 70%** consistently
- **Memory > 80%** consistently
- **Response times > 1s** for critical paths
- **Concurrent users > plan limit**

#### Scaling Options
1. **Vertical Scaling:** Upgrade Railway plan
2. **Horizontal Scaling:** Add more instances
3. **Database Scaling:** Upgrade Supabase plan
4. **CDN:** Add Cloudflare or similar

## Rollback Plan

### When to Rollback
- Critical bugs in production
- Performance degradation
- Security vulnerabilities
- User-reported issues

### Rollback Steps
1. **Identify last stable version**
2. **Backup current database state**
3. **Revert code to stable version**
4. **Redeploy**
5. **Verify functionality**
6. **Communicate to users**

### Emergency Procedures
1. **Database Issues:** Restore from backup
2. **Security Breach:** Isolate, investigate, patch
3. **Performance Crisis:** Scale up, optimize
4. **Data Loss:** Restore from backup, investigate cause

## Support

### Getting Help
1. **Documentation:** Check this guide first
2. **GitHub Issues:** Report bugs or request features
3. **Community:** Discord/Slack channels
4. **Professional Support:** Contact for critical issues

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [BILT Platform GitHub](https://github.com/mathewbutler10-stack/bilt)

## Success Metrics

### Technical Metrics
- **Uptime:** > 99.9%
- **Response Time:** < 500ms for 95% of requests
- **Error Rate:** < 0.1%
- **Deployment Success Rate:** > 95%

### Business Metrics
- **User Adoption:** Monthly active users
- **Engagement:** Daily/weekly active users
- **Retention:** User churn rate
- **Revenue:** MRR/ARR growth

---

**Last Updated:** 2026-04-12 1:10 PM AEDT  
**Deployment Status:** ✅ Ready for Production  
**Platform Version:** 1.0.0  
**Next Steps:** Run SQL migrations, set environment variables, deploy to Railway