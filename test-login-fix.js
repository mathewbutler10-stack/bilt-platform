// Test script to verify login fix works
const { supabase } = require('./lib/supabase/robust-client');

async function testLoginFix() {
  console.log('🔍 Testing BILT Login Fix...');
  console.log('=============================');
  
  // Test 1: Check Supabase client configuration
  console.log('\n1. Supabase Configuration:');
  console.log('   URL:', supabase.supabaseUrl);
  console.log('   Anon Key:', supabase.supabaseKey ? '✅ Set (hidden)' : '❌ Missing');
  
  // Test 2: Try to get session (non-blocking)
  console.log('\n2. Testing Supabase Connection:');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('   ❌ Connection error:', error.message);
    } else {
      console.log('   ✅ Connected successfully');
      console.log('   Session:', data.session ? 'Active' : 'None');
    }
  } catch (error) {
    console.log('   ❌ Exception:', error.message);
  }
  
  // Test 3: Try to sign in
  console.log('\n3. Testing Login:');
  console.log('   Email: owner@bilt.com');
  console.log('   Password: password123');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'owner@bilt.com',
      password: 'password123'
    });
    
    if (error) {
      console.log('   ❌ Login error:', error.message);
      console.log('   💡 Check: User exists in Supabase Auth?');
      console.log('   💡 Run: node create-auth-users-simple.js');
    } else {
      console.log('   ✅ Login successful!');
      console.log('   User:', data.user.email);
      console.log('   Session created');
    }
  } catch (error) {
    console.log('   ❌ Login exception:', error.message);
  }
  
  console.log('\n=============================');
  console.log('✅ Test complete');
  console.log('\nIf login fails:');
  console.log('1. Check user exists: node create-auth-users-simple.js');
  console.log('2. Check Supabase project: https://sniuhfijadbghoxfsnft.supabase.co');
  console.log('3. Check CORS settings in Supabase dashboard');
}

// Run test
testLoginFix().catch(console.error);