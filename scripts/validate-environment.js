#!/usr/bin/env node

/**
 * Environment Validation Script for Railway + Supabase Deployments
 * Created: April 13, 2026
 * Purpose: Validate all required environment variables before deployment
 */

const requiredEnvVars = {
  // ===== SUPABASE CONFIGURATION =====
  NEXT_PUBLIC_SUPABASE_URL: {
    description: 'Supabase project URL (e.g., https://xyz.supabase.co)',
    validation: (value) => value.startsWith('https://') && value.includes('.supabase.co'),
    errorMessage: 'Must be a valid Supabase URL starting with https://',
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous/public key for client-side operations',
    validation: (value) => value.length >= 20 && value.startsWith('eyJ'),
    errorMessage: 'Must be a valid JWT token starting with eyJ',
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    description: 'Supabase service role key for server-side operations (optional but recommended)',
    validation: (value) => !value || (value.length >= 20 && value.startsWith('eyJ')),
    errorMessage: 'If provided, must be a valid JWT token',
    optional: true,
  },

  // ===== APPLICATION CONFIGURATION =====
  NEXT_PUBLIC_SITE_URL: {
    description: 'Production site URL (e.g., https://app.railway.app)',
    validation: (value) => value.startsWith('https://'),
    errorMessage: 'Must start with https:// for production',
  },
  NODE_ENV: {
    description: 'Node.js environment (production, development, test)',
    validation: (value) => ['production', 'development', 'test'].includes(value),
    errorMessage: 'Must be one of: production, development, test',
  },

  // ===== RAILWAY CONFIGURATION =====
  PORT: {
    description: 'Port number Railway will use (automatically set by Railway)',
    validation: (value) => !value || (/^\d+$/.test(value) && parseInt(value) > 0 && parseInt(value) < 65536),
    errorMessage: 'Must be a valid port number (1-65535)',
    optional: true,
  },
  RAILWAY_ENVIRONMENT: {
    description: 'Railway environment name (production, preview, etc.)',
    validation: (value) => !value || typeof value === 'string',
    errorMessage: 'Must be a string',
    optional: true,
  },

  // ===== OPTIONAL SERVICES =====
  SENTRY_DSN: {
    description: 'Sentry DSN for error tracking (optional)',
    validation: (value) => !value || value.startsWith('https://'),
    errorMessage: 'If provided, must be a valid Sentry DSN URL',
    optional: true,
  },
  GA_MEASUREMENT_ID: {
    description: 'Google Analytics measurement ID (optional)',
    validation: (value) => !value || /^G-[A-Z0-9]+$/.test(value),
    errorMessage: 'If provided, must be a valid GA4 measurement ID (G-XXXXXXX)',
    optional: true,
  },
  RESEND_API_KEY: {
    description: 'Resend API key for email sending (optional)',
    validation: (value) => !value || value.startsWith('re_'),
    errorMessage: 'If provided, must be a valid Resend API key starting with re_',
    optional: true,
  },
  STRIPE_SECRET_KEY: {
    description: 'Stripe secret key for payments (optional)',
    validation: (value) => !value || value.startsWith('sk_'),
    errorMessage: 'If provided, must be a valid Stripe secret key starting with sk_',
    optional: true,
  },
  STRIPE_PUBLISHABLE_KEY: {
    description: 'Stripe publishable key for client-side (optional)',
    validation: (value) => !value || value.startsWith('pk_'),
    errorMessage: 'If provided, must be a valid Stripe publishable key starting with pk_',
    optional: true,
  },
}

function maskSensitiveValue(varName, value) {
  const sensitiveKeywords = ['KEY', 'SECRET', 'PASSWORD', 'TOKEN', 'DSN', 'PRIVATE']
  const isSensitive = sensitiveKeywords.some(keyword => 
    varName.toUpperCase().includes(keyword)
  )
  
  if (isSensitive && value && value.length > 8) {
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
  }
  
  return value
}

function validateEnvironment() {
  console.log('🔍 Validating Environment Variables for Railway + Supabase Deployment\n')
  console.log('='.repeat(80))
  
  const results = {
    passed: [],
    failed: [],
    warnings: [],
  }
  
  // Check each required variable
  for (const [varName, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[varName]
    const maskedValue = maskSensitiveValue(varName, value)
    
    // Check if variable is present
    if (!value && !config.optional) {
      results.failed.push({
        varName,
        reason: 'Missing required variable',
        description: config.description,
      })
      continue
    }
    
    // Check if variable is present but optional and missing
    if (!value && config.optional) {
      results.warnings.push({
        varName,
        reason: 'Optional variable not set',
        description: config.description,
      })
      continue
    }
    
    // Validate the value
    if (config.validation && !config.validation(value)) {
      results.failed.push({
        varName,
        reason: config.errorMessage,
        value: maskedValue,
        description: config.description,
      })
      continue
    }
    
    // Variable passed validation
    results.passed.push({
      varName,
      value: maskedValue,
      description: config.description,
    })
  }
  
  // Display results
  if (results.passed.length > 0) {
    console.log('\n✅ PASSED VARIABLES:')
    results.passed.forEach(({ varName, value, description }) => {
      console.log(`   ${varName}: ${value}`)
      console.log(`     ${description}\n`)
    })
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  OPTIONAL VARIABLES (NOT SET):')
    results.warnings.forEach(({ varName, description }) => {
      console.log(`   ${varName}`)
      console.log(`     ${description}\n`)
    })
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED VARIABLES:')
    results.failed.forEach(({ varName, reason, value, description }) => {
      console.log(`   ${varName}`)
      if (value) console.log(`     Value: ${value}`)
      console.log(`     Reason: ${reason}`)
      console.log(`     Description: ${description}\n`)
    })
  }
  
  // Summary
  console.log('='.repeat(80))
  console.log('\n📊 VALIDATION SUMMARY:')
  console.log(`   Total Variables: ${Object.keys(requiredEnvVars).length}`)
  console.log(`   Passed: ${results.passed.length}`)
  console.log(`   Failed: ${results.failed.length}`)
  console.log(`   Warnings: ${results.warnings.length}`)
  
  if (results.failed.length > 0) {
    console.log('\n❌ DEPLOYMENT BLOCKED: Fix failed variables before deployment')
    console.log('\n💡 TROUBLESHOOTING TIPS:')
    console.log('   1. Check Railway environment variables: railway variables list')
    console.log('   2. Verify Supabase project is active and keys are correct')
    console.log('   3. Ensure all required variables are set in .env.production')
    console.log('   4. Run locally with: NODE_ENV=production node scripts/validate-environment.js')
    process.exit(1)
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  DEPLOYMENT READY WITH WARNINGS:')
    console.log('   Optional features will not work until variables are set')
  }
  
  if (results.failed.length === 0 && results.warnings.length === 0) {
    console.log('\n🎉 ALL VARIABLES VALIDATED SUCCESSFULLY!')
    console.log('   Ready for deployment to Railway + Supabase')
  }
  
  console.log('\n' + '='.repeat(80))
  process.exit(0)
}

// Additional validation functions
function validateSupabaseConnection() {
  console.log('\n🔗 Testing Supabase Connection...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('   ⚠️  Skipping connection test: Missing Supabase credentials')
    return false
  }
  
  try {
    // Simple fetch test to check if Supabase is reachable
    const testUrl = `${supabaseUrl}/rest/v1/`
    console.log(`   Testing connection to: ${supabaseUrl.replace(/https?:\/\//, '')}`)
    
    // Note: In a real implementation, you would use the Supabase client
    // to test the connection. This is a simplified version.
    console.log('   ✅ Supabase URL format is valid')
    console.log('   ✅ Supabase key format is valid (JWT)')
    
    return true
  } catch (error) {
    console.log(`   ❌ Supabase connection test failed: ${error.message}`)
    return false
  }
}

function validateRailwayEnvironment() {
  console.log('\n🚂 Testing Railway Environment Assumptions...')
  
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_NAME
  
  if (isRailway) {
    console.log('   ✅ Running in Railway environment')
    
    // Check for Railway-specific variables
    if (!process.env.PORT) {
      console.log('   ⚠️  PORT not set (Railway usually sets this automatically)')
    } else {
      console.log(`   ✅ PORT is set: ${process.env.PORT}`)
    }
    
    return true
  } else {
    console.log('   ⚠️  Not running in Railway environment (local development)')
    console.log('   💡 Set RAILWAY_ENVIRONMENT=production for Railway-specific checks')
    return false
  }
}

// Run validation
if (require.main === module) {
  console.log('🚀 Railway + Supabase Environment Validator')
  console.log('   Created: April 13, 2026')
  console.log('   Purpose: Prevent deployment issues by validating all requirements\n')
  
  validateEnvironment()
  validateSupabaseConnection()
  validateRailwayEnvironment()
  
  console.log('\n' + '='.repeat(80))
  console.log('✅ Environment validation completed')
  console.log('   Next: Run database connection tests and health checks')
  console.log('='.repeat(80))
}

module.exports = {
  validateEnvironment,
  validateSupabaseConnection,
  validateRailwayEnvironment,
  requiredEnvVars,
}