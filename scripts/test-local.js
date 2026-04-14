#!/usr/bin/env node

/**
 * BILT Platform Local Test Script
 * Created: April 13, 2026
 * Purpose: Test BILT platform locally before deployment
 */

const http = require('http');
const https = require('https');

async function testLocal() {
  console.log('🧪 BILT Platform Local Testing');
  console.log('===============================\n');
  
  const tests = [
    {
      name: 'Health Check Endpoint',
      url: 'http://localhost:3000/api/health',
      method: 'GET',
      expectedStatus: 200,
    },
    {
      name: 'Advanced Health Check',
      url: 'http://localhost:3000/api/health/advanced',
      method: 'GET',
      expectedStatus: 200,
    },
    {
      name: 'Home Page',
      url: 'http://localhost:3000',
      method: 'GET',
      expectedStatus: 200,
    },
    {
      name: 'Login Page',
      url: 'http://localhost:3000/login',
      method: 'GET',
      expectedStatus: 200,
    },
    {
      name: 'Dashboard (should redirect to login)',
      url: 'http://localhost:3000/dashboard',
      method: 'GET',
      expectedStatus: 307, // Redirect to login
    },
  ];

  const results = [];
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    console.log(`  URL: ${test.url}`);
    
    try {
      const result = await makeRequest(test.url, test.method);
      const passed = result.status === test.expectedStatus;
      
      results.push({
        name: test.name,
        status: passed ? '✅ PASS' : '❌ FAIL',
        expected: test.expectedStatus,
        actual: result.status,
        time: result.time,
        error: result.error,
      });
      
      console.log(`  Status: ${result.status} (expected: ${test.expectedStatus})`);
      console.log(`  Time: ${result.time}ms`);
      if (result.error) console.log(`  Error: ${result.error}`);
      console.log('');
      
    } catch (error) {
      results.push({
        name: test.name,
        status: '❌ ERROR',
        expected: test.expectedStatus,
        actual: 'Error',
        time: 0,
        error: error.message,
      });
      
      console.log(`  ❌ Error: ${error.message}`);
      console.log('');
    }
  }
  
  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('===============\n');
  
  results.forEach(result => {
    console.log(`${result.status} ${result.name}`);
    console.log(`  Expected: ${result.expected}, Actual: ${result.actual}, Time: ${result.time}ms`);
    if (result.error) console.log(`  Error: ${result.error}`);
    console.log('');
  });
  
  const passed = results.filter(r => r.status === '✅ PASS').length;
  const failed = results.filter(r => r.status === '❌ FAIL').length;
  const errors = results.filter(r => r.status === '❌ ERROR').length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Errors: ${errors}`);
  
  if (failed === 0 && errors === 0) {
    console.log('\n🎉 All tests passed! BILT Platform is ready for deployment.');
    console.log('\nNext steps:');
    console.log('1. Run database migrations in Supabase');
    console.log('2. Set environment variables in Railway');
    console.log('3. Deploy using: node scripts/validate-deployment.js && railway up');
  } else {
    console.log('\n⚠️  Some tests failed. Fix issues before deployment.');
    console.log('\nCommon issues:');
    console.log('1. Server not running: npm run dev');
    console.log('2. Database connection issues');
    console.log('3. Environment variables not set');
  }
}

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = http.request(url, { method }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const time = Date.now() - start;
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          time: time,
        });
      });
    });
    
    req.on('error', (error) => {
      const time = Date.now() - start;
      resolve({
        status: 0,
        error: error.message,
        time: time,
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      const time = Date.now() - start;
      resolve({
        status: 0,
        error: 'Timeout after 5 seconds',
        time: time,
      });
    });
    
    req.end();
  });
}

// Run tests
if (require.main === module) {
  console.log('🚀 BILT Platform Local Test');
  console.log('Created: April 13, 2026');
  console.log('Purpose: Verify platform works before deployment\n');
  
  testLocal().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { testLocal };