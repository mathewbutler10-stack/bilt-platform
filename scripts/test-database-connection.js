#!/usr/bin/env node

/**
 * Database Connection Test Script for Supabase
 * Created: April 13, 2026
 * Purpose: Test database connectivity and verify RLS policies before deployment
 */

const { createClient } = require('@supabase/supabase-js')

async function testDatabaseConnection() {
  console.log('🔗 Testing Supabase Database Connection\n')
  console.log('='.repeat(80))
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing Supabase environment variables')
    console.log('   Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }
  
  console.log(`Supabase URL: ${supabaseUrl.replace(/https?:\/\//, '')}`)
  console.log(`Anon Key: ${supabaseAnonKey.substring(0, 10)}...`)
  if (supabaseServiceKey) {
    console.log(`Service Key: ${supabaseServiceKey.substring(0, 10)}...`)
  }
  console.log('')
  
  // Create clients
  const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })
  
  let serviceClient = null
  if (supabaseServiceKey) {
    serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  }
  
  const tests = []
  
  // Test 1: Basic connection with anon key
  tests.push({
    name: 'Basic Connection (Anon Key)',
    run: async () => {
      const start = Date.now()
      const { data, error } = await anonClient.from('profiles').select('count').limit(1)
      const duration = Date.now() - start
      
      if (error) {
        if (error.code === 'PGRST301' || error.message.includes('relation "profiles" does not exist')) {
          return {
            status: 'warning',
            message: 'Table "profiles" does not exist (migrations may not be run)',
            duration,
          }
        }
        return {
          status: 'error',
          message: `Connection failed: ${error.message}`,
          duration,
        }
      }
      
      return {
        status: 'success',
        message: `Connected successfully in ${duration}ms`,
        duration,
      }
    },
  })
  
  // Test 2: Service role connection (if available)
  if (serviceClient) {
    tests.push({
      name: 'Service Role Connection',
      run: async () => {
        const start = Date.now()
        const { data, error } = await serviceClient.from('profiles').select('count').limit(1)
        const duration = Date.now() - start
        
        if (error) {
          return {
            status: 'error',
            message: `Service role connection failed: ${error.message}`,
            duration,
          }
        }
        
        return {
          status: 'success',
          message: `Service role connected in ${duration}ms`,
          duration,
        }
      },
    })
  }
  
  // Test 3: RLS Policy Test (if profiles table exists)
  tests.push({
    name: 'RLS Policy Verification',
    run: async () => {
      // First check if table exists
      const { error: tableError } = await anonClient.from('profiles').select('count').limit(1)
      
      if (tableError && tableError.code === 'PGRST301') {
        return {
          status: 'warning',
          message: 'Skipping RLS test: profiles table does not exist',
        }
      }
      
      // Test that anonymous user cannot select all rows (RLS should block)
      const { data: anonData, error: anonError } = await anonClient.from('profiles').select('*').limit(5)
      
      if (anonError && anonError.message.includes('permission denied')) {
        return {
          status: 'success',
          message: 'RLS policies are active (anon user blocked)',
        }
      }
      
      if (anonError) {
        return {
          status: 'warning',
          message: `Unexpected error testing RLS: ${anonError.message}`,
        }
      }
      
      // If we get here, RLS might not be properly configured
      return {
        status: 'error',
        message: 'RLS may not be properly configured (anon user could read data)',
      }
    },
  })
  
  // Test 4: Database extensions
  tests.push({
    name: 'Database Extensions',
    run: async () => {
      const { data, error } = await anonClient.rpc('get_installed_extensions', {}).catch(() => ({ error: 'RPC not available' }))
      
      if (error) {
        // Try direct query if RPC not available
        const { data: extData, error: extError } = await anonClient.from('pg_extension').select('extname').limit(5)
        
        if (extError) {
          return {
            status: 'warning',
            message: 'Cannot check extensions (permission or table not accessible)',
          }
        }
        
        const extensions = extData?.map(ext => ext.extname) || []
        const hasUUID = extensions.some(ext => ext.includes('uuid'))
        
        return {
          status: hasUUID ? 'success' : 'warning',
          message: `Extensions: ${extensions.join(', ') || 'none found'}`,
        }
      }
      
      const extensions = data?.map(ext => ext.extname) || []
      const hasUUID = extensions.some(ext => ext.includes('uuid'))
      
      return {
        status: hasUUID ? 'success' : 'warning',
        message: `Extensions: ${extensions.join(', ') || 'none'}`,
      }
    },
  })
  
  // Test 5: Connection pooling (indirect test)
  tests.push({
    name: 'Connection Performance',
    run: async () => {
      const iterations = 5
      const durations = []
      
      for (let i = 0; i < iterations; i++) {
        const start = Date.now()
        await anonClient.from('profiles').select('count').limit(1)
        durations.push(Date.now() - start)
      }
      
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length
      const max = Math.max(...durations)
      const min = Math.min(...durations)
      
      let status = 'success'
      if (avg > 1000) status = 'warning'
      if (avg > 5000) status = 'error'
      
      return {
        status,
        message: `Avg: ${avg.toFixed(0)}ms, Min: ${min}ms, Max: ${max}ms (${iterations} queries)`,
        duration: avg,
      }
    },
  })
  
  // Run all tests
  const results = []
  for (const test of tests) {
    console.log(`Running: ${test.name}`)
    try {
      const result = await test.run()
      results.push({ name: test.name, ...result })
      
      const statusIcon = {
        success: '✅',
        warning: '⚠️ ',
        error: '❌',
      }[result.status] || '❓'
      
      console.log(`  ${statusIcon} ${result.message}`)
      if (result.duration) {
        console.log(`    Duration: ${result.duration}ms`)
      }
      console.log('')
    } catch (error) {
      console.log(`  ❌ Test failed with error: ${error.message}`)
      console.log('')
      results.push({
        name: test.name,
        status: 'error',
        message: `Test error: ${error.message}`,
      })
    }
  }
  
  // Summary
  console.log('='.repeat(80))
  console.log('\n📊 DATABASE CONNECTION TEST SUMMARY\n')
  
  const successCount = results.filter(r => r.status === 'success').length
  const warningCount = results.filter(r => r.status === 'warning').length
  const errorCount = results.filter(r => r.status === 'error').length
  
  console.log(`Total Tests: ${results.length}`)
  console.log(`✅ Success: ${successCount}`)
  console.log(`⚠️  Warnings: ${warningCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log('')
  
  // Display detailed results
  if (errorCount > 0) {
    console.log('❌ ERRORS FOUND:')
    results.filter(r => r.status === 'error').forEach(result => {
      console.log(`  • ${result.name}: ${result.message}`)
    })
    console.log('')
  }
  
  if (warningCount > 0) {
    console.log('⚠️  WARNINGS:')
    results.filter(r => r.status === 'warning').forEach(result => {
      console.log(`  • ${result.name}: ${result.message}`)
    })
    console.log('')
  }
  
  // Recommendations
  console.log('💡 RECOMMENDATIONS:')
  
  if (errorCount > 0) {
    console.log('  1. Fix database connection errors before deployment')
    console.log('  2. Verify Supabase project is active and accessible')
    console.log('  3. Check network restrictions in Supabase dashboard')
    console.log('  4. Ensure database migrations have been run')
    process.exit(1)
  }
  
  if (warningCount > 0) {
    console.log('  1. Address warnings for optimal performance')
    console.log('  2. Consider running database migrations')
    console.log('  3. Review RLS policies for security')
    console.log('  4. Monitor database performance in production')
  }
  
  if (errorCount === 0 && warningCount === 0) {
    console.log('  1. Database connection is optimal')
    console.log('  2. Ready for deployment')
    console.log('  3. Consider implementing connection pooling')
    console.log('  4. Set up database monitoring in production')
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('✅ Database connection tests completed')
  
  if (errorCount > 0) {
    process.exit(1)
  }
  
  process.exit(0)
}

// Run tests
if (require.main === module) {
  console.log('🚀 Supabase Database Connection Tester')
  console.log('   Created: April 13, 2026')
  console.log('   Purpose: Verify database connectivity before deployment\n')
  
  testDatabaseConnection().catch(error => {
    console.error('❌ Unhandled error:', error)
    process.exit(1)
  })
}

module.exports = { testDatabaseConnection }