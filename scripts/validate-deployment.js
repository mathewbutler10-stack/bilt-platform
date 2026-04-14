#!/usr/bin/env node

/**
 * Complete Deployment Validation Script
 * Created: April 13, 2026
 * Purpose: Run all validation checks before deploying to Railway + Supabase
 */

const { execSync } = require('child_process')
const path = require('path')

async function runValidation() {
  console.log('🚀 Railway + Supabase Deployment Validation Suite')
  console.log('='.repeat(80))
  console.log('Created: April 13, 2026')
  console.log('Purpose: Prevent deployment issues by validating all requirements')
  console.log('='.repeat(80) + '\n')
  
  const results = []
  let hasErrors = false
  let hasWarnings = false
  
  // Phase 1: Environment Validation
  console.log('📋 PHASE 1: ENVIRONMENT VALIDATION\n')
  try {
    console.log('Running environment validation...')
    const envValidation = require('./validate-environment')
    envValidation.validateEnvironment()
    results.push({ phase: 'Environment', status: '✅', message: 'All environment variables validated' })
  } catch (error) {
    console.log(`❌ Environment validation failed: ${error.message}`)
    results.push({ phase: 'Environment', status: '❌', message: `Failed: ${error.message}` })
    hasErrors = true
  }
  
  // Phase 2: Database Connection Test
  console.log('\n📋 PHASE 2: DATABASE CONNECTION TEST\n')
  try {
    console.log('Testing database connection...')
    const dbTest = require('./test-database-connection')
    await dbTest.testDatabaseConnection()
    results.push({ phase: 'Database', status: '✅', message: 'Database connection successful' })
  } catch (error) {
    console.log(`❌ Database test failed: ${error.message}`)
    results.push({ phase: 'Database', status: '❌', message: `Failed: ${error.message}` })
    hasErrors = true
  }
  
  // Phase 3: Build Test
  console.log('\n📋 PHASE 3: BUILD VALIDATION\n')
  try {
    console.log('Testing Next.js build...')
    const buildStart = Date.now()
    execSync('npm run build', { stdio: 'pipe' })
    const buildDuration = Date.now() - buildStart
    console.log(`✅ Build successful in ${buildDuration}ms`)
    results.push({ phase: 'Build', status: '✅', message: `Build successful (${buildDuration}ms)` })
  } catch (error) {
    console.log(`❌ Build failed: ${error.message}`)
    if (error.stdout) console.log(error.stdout.toString())
    if (error.stderr) console.log(error.stderr.toString())
    results.push({ phase: 'Build', status: '❌', message: `Build failed: ${error.message}` })
    hasErrors = true
  }
  
  // Phase 4: TypeScript Compilation
  console.log('\n📋 PHASE 4: TYPESCRIPT COMPILATION\n')
  try {
    console.log('Checking TypeScript compilation...')
    const tsStart = Date.now()
    execSync('npx tsc --noEmit', { stdio: 'pipe' })
    const tsDuration = Date.now() - tsStart
    console.log(`✅ TypeScript compilation successful in ${tsDuration}ms`)
    results.push({ phase: 'TypeScript', status: '✅', message: `No TypeScript errors (${tsDuration}ms)` })
  } catch (error) {
    console.log(`⚠️  TypeScript warnings/errors: ${error.message}`)
    if (error.stdout) console.log(error.stdout.toString())
    if (error.stderr) console.log(error.stderr.toString())
    results.push({ phase: 'TypeScript', status: '⚠️', message: 'TypeScript warnings found' })
    hasWarnings = true
  }
  
  // Phase 5: Dependency Check
  console.log('\n📋 PHASE 5: DEPENDENCY CHECK\n')
  try {
    console.log('Checking dependencies...')
    const { dependencies, devDependencies } = require('../package.json')
    
    // Check for critical dependencies
    const criticalDeps = {
      'next': '>=14.0.0',
      '@supabase/supabase-js': '>=2.0.0',
      'react': '>=18.0.0',
      'react-dom': '>=18.0.0',
    }
    
    let allCriticalPresent = true
    for (const [dep, minVersion] of Object.entries(criticalDeps)) {
      if (!dependencies[dep] && !devDependencies[dep]) {
        console.log(`❌ Missing critical dependency: ${dep}`)
        allCriticalPresent = false
      }
    }
    
    if (allCriticalPresent) {
      console.log('✅ All critical dependencies present')
      results.push({ phase: 'Dependencies', status: '✅', message: 'Critical dependencies present' })
    } else {
      console.log('⚠️  Some critical dependencies missing')
      results.push({ phase: 'Dependencies', status: '⚠️', message: 'Missing critical dependencies' })
      hasWarnings = true
    }
  } catch (error) {
    console.log(`❌ Dependency check failed: ${error.message}`)
    results.push({ phase: 'Dependencies', status: '❌', message: `Check failed: ${error.message}` })
    hasErrors = true
  }
  
  // Phase 6: File Structure Check
  console.log('\n📋 PHASE 6: FILE STRUCTURE CHECK\n')
  try {
    console.log('Checking required files...')
    const requiredFiles = [
      'package.json',
      'next.config.js',
      'railway.json',
      '.env.local.example',
      'lib/supabase.ts',
      'app/api/health/route.ts',
    ]
    
    const missingFiles = []
    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, '..', file)
      try {
        require('fs').accessSync(filePath)
      } catch {
        missingFiles.push(file)
      }
    }
    
    if (missingFiles.length === 0) {
      console.log('✅ All required files present')
      results.push({ phase: 'File Structure', status: '✅', message: 'Required files present' })
    } else {
      console.log(`⚠️  Missing files: ${missingFiles.join(', ')}`)
      results.push({ phase: 'File Structure', status: '⚠️', message: `Missing files: ${missingFiles.join(', ')}` })
      hasWarnings = true
    }
  } catch (error) {
    console.log(`❌ File structure check failed: ${error.message}`)
    results.push({ phase: 'File Structure', status: '❌', message: `Check failed: ${error.message}` })
    hasErrors = true
  }
  
  // Phase 7: Railway Configuration Check
  console.log('\n📋 PHASE 7: RAILWAY CONFIGURATION CHECK\n')
  try {
    console.log('Checking railway.json configuration...')
    const railwayConfig = require('../railway.json')
    
    const checks = []
    
    // Check required fields
    if (!railwayConfig.build) {
      checks.push('Missing build configuration')
    } else {
      if (!railwayConfig.build.builder) checks.push('Missing builder in build config')
      if (!railwayConfig.build.buildCommand) checks.push('Missing buildCommand')
    }
    
    if (!railwayConfig.deploy) {
      checks.push('Missing deploy configuration')
    } else {
      if (!railwayConfig.deploy.startCommand) checks.push('Missing startCommand')
    }
    
    if (checks.length === 0) {
      console.log('✅ Railway configuration valid')
      results.push({ phase: 'Railway Config', status: '✅', message: 'Configuration valid' })
    } else {
      console.log(`⚠️  Railway configuration issues: ${checks.join(', ')}`)
      results.push({ phase: 'Railway Config', status: '⚠️', message: `Configuration issues: ${checks.join(', ')}` })
      hasWarnings = true
    }
  } catch (error) {
    console.log(`❌ Railway config check failed: ${error.message}`)
    results.push({ phase: 'Railway Config', status: '❌', message: `Check failed: ${error.message}` })
    hasErrors = true
  }
  
  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 DEPLOYMENT VALIDATION SUMMARY')
  console.log('='.repeat(80) + '\n')
  
  // Display results table
  console.log('PHASE'.padEnd(20) + 'STATUS'.padEnd(10) + 'MESSAGE')
  console.log('-'.repeat(60))
  results.forEach(result => {
    console.log(result.phase.padEnd(20) + result.status.padEnd(10) + result.message)
  })
  
  console.log('\n' + '='.repeat(80))
  
  if (hasErrors) {
    console.log('❌ DEPLOYMENT BLOCKED: Validation errors found')
    console.log('\n💡 RECOMMENDED ACTIONS:')
    console.log('  1. Fix all errors marked with ❌')
    console.log('  2. Run validation again: node scripts/validate-deployment.js')
    console.log('  3. Check environment variables: railway variables list')
    console.log('  4. Verify database connectivity and migrations')
    console.log('\n🚫 Do not deploy until all errors are resolved.')
    process.exit(1)
  }
  
  if (hasWarnings) {
    console.log('⚠️  DEPLOYMENT READY WITH WARNINGS')
    console.log('\n💡 RECOMMENDATIONS:')
    console.log('  1. Address warnings marked with ⚠️ for optimal deployment')
    console.log('  2. Consider fixing warnings before production deployment')
    console.log('  3. Monitor closely after deployment')
    console.log('\n✅ You may proceed with deployment, but monitor carefully.')
    process.exit(0)
  }
  
  console.log('🎉 ALL VALIDATIONS PASSED!')
  console.log('\n💡 NEXT STEPS:')
  console.log('  1. Deploy to Railway: railway up')
  console.log('  2. Monitor deployment: railway logs --follow')
  console.log('  3. Verify health: railway health')
  console.log('  4. Test endpoints: curl https://your-app.railway.app/api/health')
  console.log('\n🚀 Ready for production deployment!')
  process.exit(0)
}

// Run validation
if (require.main === module) {
  runValidation().catch(error => {
    console.error('❌ Validation suite failed:', error)
    process.exit(1)
  })
}

module.exports = { runValidation }