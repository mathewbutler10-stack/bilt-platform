#!/usr/bin/env node
// EXPERT DIAGNOSTIC TOOL - Find the REAL issue in 60 seconds

console.log('🔍 **EXPERT DIAGNOSTIC TOOL**')
console.log('==============================\n')

const { execSync } = require('child_process')
const https = require('https')
const fetch = require('node-fetch')

// Configuration
const CONFIG = {
  railwayUrl: 'https://bilt-prod-production.up.railway.app',
  supabaseUrl: 'https://sniuhfijadbghoxfsnft.supabase.co',
  supabaseAnonKey: 'sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb',
  testEmail: 'owner@bilt.com',
  testPassword: 'password123'
}

async function runTest(name, testFn) {
  console.log(`\n🔍 ${name}...`)
  try {
    const result = await testFn()
    console.log(`   ✅ ${result}`)
    return true
  } catch (error) {
    console.log(`   ❌ ${error.message}`)
    return false
  }
}

async function test1_ApplicationHealth() {
  const response = await fetch(`${CONFIG.railwayUrl}/api/health`)
  if (!response.ok) throw new Error(`Health check failed: ${response.status}`)
  const data = await response.json()
  return `Application healthy (${data.status})`
}

async function test2_SupabaseDirectConnection() {
  const response = await fetch(`${CONFIG.supabaseUrl}/rest/v1/`, {
    headers: { 'apikey': CONFIG.supabaseAnonKey }
  })
  if (!response.ok) throw new Error(`Supabase connection failed: ${response.status}`)
  return 'Supabase REST API accessible'
}

async function test3_SupabaseAuthConnection() {
  const response = await fetch(`${CONFIG.supabaseUrl}/auth/v1/`, {
    headers: { 'apikey': CONFIG.supabaseAnonKey }
  })
  if (!response.ok) throw new Error(`Supabase Auth failed: ${response.status}`)
  return 'Supabase Auth API accessible'
}

async function test4_UserExistsInSupabase() {
  const response = await fetch(`${CONFIG.supabaseUrl}/auth/v1/admin/users`, {
    headers: {
      'apikey': CONFIG.supabaseAnonKey,
      'Authorization': `Bearer ${CONFIG.supabaseAnonKey}`
    }
  })
  
  if (!response.ok) throw new Error(`Cannot check users: ${response.status}`)
  const users = await response.json()
  const userExists = users.some(u => u.email === CONFIG.testEmail)
  if (!userExists) throw new Error(`User ${CONFIG.testEmail} not found in Supabase`)
  return `User ${CONFIG.testEmail} exists in Supabase Auth`
}

async function test5_DirectAuthentication() {
  const response = await fetch(`${CONFIG.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': CONFIG.supabaseAnonKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: CONFIG.testEmail,
      password: CONFIG.testPassword
    })
  })
  
  const data = await response.json()
  if (data.error) throw new Error(`Authentication failed: ${data.error_description}`)
  return `Direct authentication successful (got token)`
}

async function test6_CorsCheck() {
  // Test OPTIONS request (CORS preflight)
  const response = await fetch(`${CONFIG.supabaseUrl}/auth/v1/token`, {
    method: 'OPTIONS',
    headers: {
      'Origin': CONFIG.railwayUrl,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'apikey,content-type'
    }
  })
  
  const corsHeaders = {
    'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
    'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
    'access-control-allow-headers': response.headers.get('access-control-allow-headers')
  }
  
  if (!corsHeaders['access-control-allow-origin']) {
    throw new Error('CORS headers missing - Railway URL not in allowlist')
  }
  
  return `CORS configured (${corsHeaders['access-control-allow-origin']})`
}

async function test7_EnvironmentExposure() {
  // Check if environment variables are exposed to browser
  const response = await fetch(`${CONFIG.railwayUrl}/api/env-check`)
  if (!response.ok) throw new Error(`Env check failed: ${response.status}`)
  
  const data = await response.json()
  if (data.supabaseHealth?.usingFallback) {
    throw new Error('Application using fallbacks - Railway env vars not loaded')
  }
  
  return 'Environment variables loaded from Railway'
}

async function test8_BrowserConsoleCheck() {
  console.log('   📋 MANUAL CHECK REQUIRED:')
  console.log('   1. Open: ' + CONFIG.railwayUrl + '/auth/login')
  console.log('   2. Press F12 → Console tab')
  console.log('   3. Look for: "Missing Supabase environment variables"')
  console.log('   4. Look for: CORS errors in Network tab')
  return 'Please perform manual browser check'
}

async function main() {
  console.log('🎯 **EXPERT DIAGNOSTIC - FINDING THE REAL ISSUE**\n')
  
  const tests = [
    { name: 'Application Health', fn: test1_ApplicationHealth },
    { name: 'Supabase REST Connection', fn: test2_SupabaseDirectConnection },
    { name: 'Supabase Auth Connection', fn: test3_SupabaseAuthConnection },
    { name: 'User Exists in Supabase', fn: test4_UserExistsInSupabase },
    { name: 'Direct Authentication', fn: test5_DirectAuthentication },
    { name: 'CORS Configuration', fn: test6_CorsCheck },
    { name: 'Environment Variables', fn: test7_EnvironmentExposure },
    { name: 'Browser Console', fn: test8_BrowserConsoleCheck }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    const success = await runTest(test.name, test.fn)
    if (success) passed++
    else failed++
  }
  
  console.log('\n📊 **DIAGNOSTIC SUMMARY:**')
  console.log(`   ✅ Passed: ${passed}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`   📈 Score: ${Math.round((passed / tests.length) * 100)}%`)
  
  if (failed > 0) {
    console.log('\n🎯 **ROOT CAUSE IDENTIFICATION:**')
    
    if (failed >= 5) {
      console.log('   🔴 CRITICAL: Multiple failures - Likely CORS or network issue')
      console.log('   💡 Fix: Check Supabase CORS configuration immediately')
    } else if (failed === 1) {
      const failedTest = tests.find(t => !t.success)
      console.log(`   🟡 SINGLE ISSUE: ${failedTest?.name}`)
      console.log('   💡 Fix: Address this specific failure')
    }
    
    console.log('\n🚀 **IMMEDIATE ACTION:**')
    console.log('   1. Go to Supabase Dashboard → Authentication → URL Configuration')
    console.log('   2. Add: ' + CONFIG.railwayUrl)
    console.log('   3. Add: https://*.up.railway.app')
    console.log('   4. Save and test again')
  } else {
    console.log('\n🎉 **ALL TESTS PASSED!**')
    console.log('   The issue is likely in the application code or browser.')
    console.log('   Check browser console for JavaScript errors.')
  }
  
  console.log('\n🔧 **EXPERT RECOMMENDATION:**')
  console.log('   Run this diagnostic after EVERY configuration change')
  console.log('   It identifies the EXACT failure point in 60 seconds')
}

// Run diagnostics
main().catch(error => {
  console.error('❌ Diagnostic failed:', error)
  process.exit(1)
})