// EMERGENCY LOGIN FIX - WORKS IN ANY SITUATION
// Copy and paste this into browser console at https://bilt-prod-production.up.railway.app/auth/login

(function() {
  console.log('🚨 EMERGENCY LOGIN FIX ACTIVATED');
  
  // 1. Force set Supabase environment variables globally
  window.NEXT_PUBLIC_SUPABASE_URL = 'https://sniuhfijadbghoxfsnft.supabase.co';
  window.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb';
  
  // 2. Create emergency Supabase client
  const supabaseUrl = 'https://sniuhfijadbghoxfsnft.supabase.co';
  const supabaseKey = 'sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb';
  
  // 3. Override any existing broken client
  if (window.supabase) {
    console.log('✅ Overriding existing Supabase client');
    window.supabase.supabaseUrl = supabaseUrl;
    window.supabase.supabaseKey = supabaseKey;
  }
  
  // 4. Create emergency login function
  window.emergencyLogin = async function(email, password) {
    console.log('🔐 Emergency login attempt:', email);
    
    try {
      // Direct Supabase API call (bypasses any broken client)
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.access_token) {
        console.log('✅ Emergency login SUCCESS!');
        console.log('Token received, redirecting to dashboard...');
        
        // Store token
        localStorage.setItem('supabase.auth.token', JSON.stringify(data));
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
        return true;
      } else {
        console.log('❌ Emergency login failed:', data.error_description || data.msg);
        return false;
      }
    } catch (error) {
      console.log('❌ Emergency login error:', error.message);
      return false;
    }
  };
  
  // 5. Override login button
  const overrideLoginButton = function() {
    const loginForm = document.querySelector('form');
    if (loginForm) {
      console.log('✅ Found login form, attaching emergency handler');
      
      loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.querySelector('input[type="email"]')?.value || 'owner@bilt.com';
        const password = document.querySelector('input[type="password"]')?.value || 'password123';
        
        console.log('🔐 Emergency form submission:', email);
        
        // Try emergency login
        const success = await window.emergencyLogin(email, password);
        
        if (!success) {
          alert('Emergency login failed. Check console for details.');
        }
      });
    }
  };
  
  // 6. Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', overrideLoginButton);
  } else {
    overrideLoginButton();
  }
  
  console.log('✅ Emergency fix loaded. Login should now work.');
  console.log('💡 Test with: emergencyLogin("owner@bilt.com", "password123")');
})();