// BILT Login Console Diagnostic
// Copy and paste this into browser console on https://bilt-prod-production.up.railway.app/auth/login

console.log('🔍 BILT Login Diagnostic - Running...');

// Test 1: Check if Supabase client exists
console.log('\n=== Test 1: Supabase Client Check ===');
try {
  // Try to access the Supabase client from the global scope
  if (typeof window !== 'undefined') {
    // Check if the Supabase client module is loaded
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const supabaseScript = scripts.find(s => s.src.includes('supabase'));
    
    if (supabaseScript) {
      console.log('✅ Supabase script loaded:', supabaseScript.src);
    } else {
      console.log('⚠️ No Supabase script found in page');
    }
    
    // Try to check if supabase object exists
    setTimeout(() => {
      console.log('Checking for supabase object...');
      // This is a hack - we can't directly access the module
    }, 1000);
  }
} catch (error) {
  console.log('❌ Error checking Supabase client:', error.message);
}

// Test 2: Check environment variables
console.log('\n=== Test 2: Environment Variables ===');
try {
  // Try to fetch the page source to check for env vars
  fetch(window.location.href)
    .then(response => response.text())
    .then(html => {
      const hasSupabaseUrl = html.includes('NEXT_PUBLIC_SUPABASE_URL') || html.includes('sniuhfijadbghoxfsnft');
      const hasSupabaseKey = html.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY') || html.includes('sb_publishable');
      
      console.log('📄 Page source analysis:');
      console.log('   Supabase URL in page:', hasSupabaseUrl ? '✅ Found' : '❌ Not found');
      console.log('   Supabase Key in page:', hasSupabaseKey ? '✅ Found' : '❌ Not found');
      
      if (!hasSupabaseUrl || !hasSupabaseKey) {
        console.log('🚨 ISSUE: Environment variables may not be embedded in the build');
        console.log('   Solution: Redeploy with correct environment variables in Railway');
      }
    })
    .catch(error => {
      console.log('❌ Cannot analyze page source:', error.message);
    });
} catch (error) {
  console.log('❌ Error checking environment variables:', error.message);
}

// Test 3: Test Supabase connection directly
console.log('\n=== Test 3: Direct Supabase Connection Test ===');
async function testDirectConnection() {
  try {
    const supabaseUrl = 'https://sniuhfijadbghoxfsnft.supabase.co';
    const anonKey = 'sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb';
    
    console.log('Testing connection to:', supabaseUrl);
    
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    
    if (response.status === 401 || response.status === 403) {
      console.log('✅ Supabase is accessible (expected auth error for settings endpoint)');
      console.log('   This means the Supabase project is reachable from this browser.');
    } else if (response.ok) {
      console.log('✅ Supabase is accessible and working!');
    } else {
      console.log(`❌ Supabase connection failed (Status: ${response.status})`);
      console.log('   Possible CORS issue. Railway domain needs to be added to Supabase CORS settings.');
      console.log('   Current domain:', window.location.origin);
    }
  } catch (error) {
    console.log('❌ Cannot connect to Supabase:', error.message);
    console.log('   This is likely a CORS issue.');
    console.log('   Add this to Supabase CORS settings:', window.location.origin);
  }
}

testDirectConnection();

// Test 4: Test authentication
console.log('\n=== Test 4: Authentication Test ===');
async function testAuth() {
  try {
    const supabaseUrl = 'https://sniuhfijadbghoxfsnft.supabase.co';
    const anonKey = 'sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb';
    
    console.log('Testing authentication for owner@bilt.com...');
    
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'owner@bilt.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Authentication SUCCESS!');
      console.log('   User:', data.user.email);
      console.log('   Token:', data.access_token.substring(0, 50) + '...');
      console.log('   ✅ Users exist in Supabase Auth');
      console.log('   ✅ Credentials are correct');
      console.log('   ✅ Supabase Auth is working');
    } else {
      console.log(`❌ Authentication failed (Status: ${response.status})`);
      console.log('   Error:', data.message || 'Unknown error');
    }
  } catch (error) {
    console.log('❌ Authentication test failed:', error.message);
  }
}

// Run auth test after connection test
setTimeout(testAuth, 1000);

// Test 5: Check for JavaScript errors
console.log('\n=== Test 5: JavaScript Error Check ===');
console.log('Checking console for errors...');

// Listen for errors
window.addEventListener('error', function(event) {
  console.log('🚨 JavaScript Error detected:');
  console.log('   Message:', event.message);
  console.log('   File:', event.filename);
  console.log('   Line:', event.lineno);
  console.log('   Column:', event.colno);
});

// Also check for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  console.log('🚨 Unhandled Promise Rejection:');
  console.log('   Reason:', event.reason);
});

console.log('\n=== Diagnostic Complete ===');
console.log('Summary of findings will appear above.');
console.log('\n🔍 Next steps based on results:');
console.log('1. If CORS error → Add Railway domain to Supabase CORS settings');
console.log('2. If env vars missing → Redeploy with correct Railway environment variables');
console.log('3. If auth works but login doesn\'t → JavaScript error in login page');
console.log('4. If no errors but login silent → Supabase client is null (env vars issue)');

// Check login form
setTimeout(() => {
  console.log('\n=== Login Form Check ===');
  const loginForm = document.querySelector('form');
  if (loginForm) {
    console.log('✅ Login form found on page');
    console.log('   Form action:', loginForm.action || 'none (JavaScript handled)');
    
    // Check if form has submit handler
    const hasSubmitHandler = loginForm.onsubmit !== null;
    console.log('   Has submit handler:', hasSubmitHandler ? '✅ Yes' : '⚠️ No (might be React controlled)');
    
    // Check submit button
    const submitButton = loginForm.querySelector('button[type="submit"]');
    if (submitButton) {
      console.log('✅ Submit button found');
      console.log('   Button text:', submitButton.textContent);
      console.log('   Disabled:', submitButton.disabled);
    } else {
      console.log('⚠️ No submit button found in form');
    }
  } else {
    console.log('❌ No login form found on page');
  }
}, 2000);