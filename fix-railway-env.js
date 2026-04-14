#!/usr/bin/env node
// Railway Environment Variable Fix Script
// Uses Railway CLI/API to fix Supabase environment variables once and for all

console.log('🚀 RAILWAY ENVIRONMENT VARIABLE FIX SCRIPT')
console.log('==========================================\n')

// Configuration
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN || '762de040-c2ad-4088-8710-fa47627f9a08'
const RAILWAY_PROJECT_ID = process.env.RAILWAY_PROJECT_ID || 'c7779a37-f340-4bcd-b353-426c8e4a565a'
const SERVICE_ID = process.env.RAILWAY_SERVICE_ID || 'e5878938-9eb4-4786-bc16-aa85a60c0691'

const REQUIRED_VARS = {
  'NEXT_PUBLIC_SUPABASE_URL': 'https://sniuhfijadbghoxfsnft.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb'
}

async function runCommand(command, args = []) {
  const { exec } = require('child_process')
  const util = require('util')
  const execAsync = util.promisify(exec)
  
  try {
    const fullCommand = `railway ${command} ${args.join(' ')}`
    console.log(`   Running: ${fullCommand}`)
    
    const { stdout, stderr } = await execAsync(fullCommand, {
      env: { ...process.env, RAILWAY_TOKEN, RAILWAY_PROJECT_ID }
    })
    
    if (stderr && !stderr.includes('warning')) {
      console.log(`   ⚠️  Stderr: ${stderr.trim()}`)
    }
    
    return stdout.trim()
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`)
    return null
  }
}

async function checkCurrentVariables() {
  console.log('🔍 Checking current Railway environment variables...')
  
  try {
    // Try to list variables using Railway CLI
    const output = await runCommand('variables', ['list'])
    
    if (output) {
      console.log('   Current variables:')
      const lines = output.split('\n').filter(line => line.trim())
      lines.forEach(line => console.log(`   - ${line}`))
      
      // Check for required variables
      let missingCount = 0
      Object.keys(REQUIRED_VARS).forEach(key => {
        const found = lines.some(line => line.includes(key))
        console.log(`   ${key}: ${found ? '✅ Found' : '❌ Missing'}`)
        if (!found) missingCount++
      })
      
      return missingCount === 0
    } else {
      console.log('   ❌ Could not read variables (CLI may need authentication)')
      return false
    }
  } catch (error) {
    console.log(`   ❌ Error checking variables: ${error.message}`)
    return false
  }
}

async function setEnvironmentVariables() {
  console.log('\n🔧 Setting Railway environment variables...')
  
  let successCount = 0
  const totalVars = Object.keys(REQUIRED_VARS).length
  
  for (const [key, value] of Object.entries(REQUIRED_VARS)) {
    console.log(`\n   Setting ${key}...`)
    
    try {
      const result = await runCommand('variables', ['set', `${key}=${value}`])
      
      if (result && !result.includes('error') && !result.includes('Error')) {
        console.log(`   ✅ ${key} set successfully`)
        successCount++
      } else {
        console.log(`   ❌ Failed to set ${key}`)
        console.log(`   Output: ${result}`)
      }
    } catch (error) {
      console.log(`   ❌ Exception setting ${key}: ${error.message}`)
    }
  }
  
  console.log(`\n📊 Result: ${successCount}/${totalVars} variables set`)
  return successCount === totalVars
}

async function triggerRedeploy() {
  console.log('\n🚀 Triggering Railway redeploy...')
  
  try {
    console.log('   Note: Automatic redeploy via CLI may require user token')
    console.log('   Manual redeploy required:')
    console.log('   1. Go to Railway dashboard')
    console.log('   2. Find BILT service')
    console.log('   3. Click "Redeploy"')
    console.log('   4. Wait 2-3 minutes')
    
    // Try to trigger deploy anyway
    const result = await runCommand('up')
    
    if (result && result.includes('Deploying') || result.includes('Building')) {
      console.log('   ✅ Redeploy triggered')
      return true
    } else {
      console.log('   ⚠️  Could not trigger redeploy via CLI')
      console.log('   Manual redeploy required (see above)')
      return false
    }
  } catch (error) {
    console.log(`   ❌ Redeploy failed: ${error.message}`)
    console.log('   Manual redeploy required')
    return false
  }
}

async function testDeployment() {
  console.log('\n🔍 Testing deployment after fixes...')
  
  // Wait a bit for redeploy
  console.log('   Waiting 30 seconds for redeploy...')
  await new Promise(resolve => setTimeout(resolve, 30000))
  
  try {
    const fetch = (await import('node-fetch')).default
    const response = await fetch('https://bilt-prod-production.up.railway.app/api/env-check')
    
    if (response.ok) {
      const data = await response.json()
      console.log('   ✅ Deployment test successful')
      console.log('   Status:', data.status)
      console.log('   Supabase connected:', data.supabaseHealth?.connected ? '✅ Yes' : '❌ No')
      console.log('   Using fallbacks:', data.supabaseHealth?.usingFallback ? '⚠️ Yes' : '✅ No')
      
      if (data.supabaseHealth?.usingFallback) {
        console.log('   🚨 Still using fallbacks - environment variables not set correctly')
      }
      
      return data.supabaseHealth?.connected
    } else {
      console.log(`   ❌ Deployment test failed (Status: ${response.status})`)
      return false
    }
  } catch (error) {
    console.log(`   ❌ Deployment test error: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('📋 Configuration:')
  console.log(`   Project ID: ${RAILWAY_PROJECT_ID}`)
  console.log(`   Service ID: ${SERVICE_ID}`)
  console.log(`   Token: ${RAILWAY_TOKEN.substring(0, 10)}...`)
  console.log(`   Deployment: https://bilt-prod-production.up.railway.app`)
  
  console.log('\n📋 Required Variables:')
  Object.entries(REQUIRED_VARS).forEach(([key, value]) => {
    console.log(`   ${key} = ${value}`)
  })
  
  // Step 1: Check current variables
  const variablesOk = await checkCurrentVariables()
  
  if (!variablesOk) {
    // Step 2: Set variables
    const setOk = await setEnvironmentVariables()
    
    if (setOk) {
      // Step 3: Trigger redeploy
      await triggerRedeploy()
      
      // Step 4: Test deployment
      await testDeployment()
    } else {
      console.log('\n❌ Failed to set all environment variables')
      console.log('\n💡 Manual fix required:')
      console.log('1. Go to Railway dashboard')
      console.log('2. Navigate to BILT service')
      console.log('3. Go to Variables tab')
      console.log('4. Set these exact values:')
      Object.entries(REQUIRED_VARS).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`)
      })
      console.log('5. Click "Redeploy"')
      console.log('6. Wait 2-3 minutes')
      console.log('7. Test login at: https://bilt-prod-production.up.railway.app/auth/login')
    }
  } else {
    console.log('\n✅ All environment variables are already set correctly!')
    console.log('\n🔍 Testing current deployment...')
    await testDeployment()
  }
  
  console.log('\n🎯 FINAL CHECK:')
  console.log('1. Open: https://bilt-prod-production.up.railway.app/auth/login')
  console.log('2. Press F12 → Console tab')
  console.log('3. Should NOT see "Missing Supabase environment variables"')
  console.log('4. Try login: owner@bilt.com / password123')
  console.log('5. Should redirect to dashboard')
  
  console.log('\n🔧 If still not working:')
  console.log('1. Check Supabase CORS settings')
  console.log('2. Add: https://bilt-prod-production.up.railway.app')
  console.log('3. Add: https://*.up.railway.app')
  console.log('4. Redeploy after CORS changes')
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error)
  process.exit(1)
})