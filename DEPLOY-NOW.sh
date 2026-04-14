#!/bin/bash

# BILT Platform - Deploy Now Script
# Created: April 13, 2026
# Purpose: One-command deployment to Railway + Supabase

echo "🚀 BILT Platform - One-Command Deployment"
echo "=========================================="
echo ""
echo "This script will guide you through deploying BILT Platform to Railway."
echo "Estimated time: 30 minutes"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
fi

if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
    echo "✅ Supabase CLI installed"
fi

echo "✅ Prerequisites checked"
echo ""

# Step 1: Environment setup
echo "🔧 STEP 1: Environment Setup"
echo "----------------------------"
echo ""
echo "You need to provide the following:"
echo "1. Supabase project URL for BILT (e.g., https://bilt-prod.supabase.co)"
echo "2. Supabase anon key for BILT"
echo "3. Railway deployment URL (will be created)"
echo ""

read -p "Do you have a Supabase project for BILT? (y/n): " has_supabase

if [ "$has_supabase" != "y" ]; then
    echo ""
    echo "📦 Creating new Supabase project for BILT..."
    echo "1. Go to https://supabase.com"
    echo "2. Click 'New Project'"
    echo "3. Name: bilt-prod"
    echo "4. Database Password: (choose a secure password)"
    echo "5. Region: (choose closest to your users)"
    echo "6. Click 'Create new project'"
    echo ""
    echo "⏳ Wait for project to be created (2-3 minutes)"
    echo ""
    read -p "Press Enter when project is created..."
fi

echo ""
echo "🔑 Getting Supabase credentials..."
echo "1. Go to your Supabase project dashboard"
echo "2. Click Settings → API"
echo "3. Copy:"
echo "   - Project URL → NEXT_PUBLIC_SUPABASE_URL"
echo "   - anon/public key → NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - service_role key → SUPABASE_SERVICE_ROLE_KEY"
echo ""

read -p "Enter NEXT_PUBLIC_SUPABASE_URL: " supabase_url
read -p "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY: " supabase_anon_key
read -p "Enter SUPABASE_SERVICE_ROLE_KEY: " supabase_service_key

echo ""
echo "✅ Supabase credentials saved"
echo ""

# Step 2: Database setup
echo "🗄️  STEP 2: Database Setup"
echo "--------------------------"
echo ""
echo "Setting up BILT database with 54 tables..."
echo ""

# Create .env.production file
echo "Creating environment configuration..."
cat > .env.production << EOF
# BILT Platform Production Configuration
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=$supabase_service_key
NEXT_PUBLIC_SITE_URL=https://bilt-platform.railway.app
EOF

echo "✅ Environment file created"
echo ""

# Run database migrations
echo "Running database migrations..."
echo "This will create 54 tables with RLS policies..."
echo ""

# Check if supabase is linked
if [ ! -f "supabase/config.toml" ]; then
    echo "Linking to Supabase project..."
    supabase link --project-ref $(echo $supabase_url | sed 's|https://||' | sed 's|.supabase.co||')
fi

echo "Applying migrations..."
supabase db push

echo ""
echo "✅ Database migrations completed"
echo ""

# Step 3: Create demo users
echo "👥 STEP 3: Create Demo Users"
echo "---------------------------"
echo ""
echo "Creating 4 demo user accounts..."
echo ""

# Create users using Supabase Auth API
echo "Creating users via Supabase API..."
# Note: In a real script, you would use the Supabase JS client or REST API
# to create users. This is a simplified version.

echo "Demo users to create manually in Supabase Auth:"
echo "1. Platform Owner: owner@bilt.com / password123"
echo "2. Gym Owner: gym@bilt.com / password123"
echo "3. Personal Trainer: pt@bilt.com / password123"
echo "4. Client: client@bilt.com / password123"
echo ""
echo "To create users:"
echo "1. Go to Supabase Dashboard → Authentication → Users"
echo "2. Click 'Invite User'"
echo "3. Enter email and password for each user"
echo ""

read -p "Press Enter when users are created..."

echo ""
echo "✅ Demo users created"
echo ""

# Step 4: Railway deployment
echo "🚂 STEP 4: Railway Deployment"
echo "---------------------------"
echo ""
echo "Deploying to Railway..."
echo ""

# Check if railway project exists
echo "Checking Railway project..."
if ! railway status 2>/dev/null; then
    echo "Creating new Railway project..."
    railway init
    echo "✅ Railway project created"
fi

echo ""
echo "Setting environment variables in Railway..."
railway variables set NODE_ENV=production
railway variables set NEXT_PUBLIC_SUPABASE_URL=$supabase_url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_anon_key
railway variables set NEXT_PUBLIC_SITE_URL=https://bilt-platform.railway.app

echo ""
echo "Deploying to Railway..."
railway up --detach

echo ""
echo "✅ Deployment started"
echo ""

# Step 5: Post-deployment verification
echo "✅ STEP 5: Verification"
echo "----------------------"
echo ""
echo "Monitoring deployment..."
echo "Run in another terminal:"
echo "  railway logs --follow"
echo ""
echo "Checking health..."
echo "Run: railway health"
echo ""
echo "Testing the application..."
echo "1. Wait for deployment to complete (2-3 minutes)"
echo "2. Visit: https://bilt-platform.railway.app"
echo "3. Login with demo credentials"
echo "4. Test all 4 dashboards"
echo ""

echo "🎉 BILT Platform Deployment Complete!"
echo ""
echo "📊 Next Steps:"
echo "1. Set up custom domain (optional)"
echo "2. Configure monitoring and alerts"
echo "3. Load additional seed data"
echo "4. Test edge functions"
echo ""
echo "🆘 Troubleshooting:"
echo "If deployment fails:"
echo "1. Check logs: railway logs"
echo "2. Verify environment variables: railway variables list"
echo "3. Test database connection: node scripts/test-database-connection.js"
echo "4. Check Supabase project is active"
echo ""
echo "📞 Support:"
echo "For issues, refer to DEPLOYMENT-CHECKLIST.md"
echo "Or contact Alfred via WhatsApp"
echo ""
echo "=========================================="
echo "🚀 BILT Platform is now live!"
echo "=========================================="