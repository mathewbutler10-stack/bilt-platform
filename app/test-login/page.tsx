'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/robust-client';

export default function TestLoginPage() {
  const [email, setEmail] = useState('owner@bilt.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [config, setConfig] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check current session
    checkSession();
    
    // Get configuration
    const config = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
      usingEnvVars: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      environment: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === 'production'
    };
    setConfig(config);
    
    // Log to console for debugging
    console.log('🔧 Test Login Page Configuration:', config);
    console.log('🔧 Supabase client:', supabase);
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session check error:', error);
        setMessage(`Session error: ${error.message}`);
      } else if (session) {
        setUser(session.user);
        setMessage(`✅ Already logged in as: ${session.user.email}`);
      } else {
        setMessage('🔒 Not logged in');
      }
    } catch (error: any) {
      console.error('Session check exception:', error);
      setMessage(`Exception: ${error.message}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('🔧 Attempting login with:', { email, password });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setMessage(`❌ Login failed: ${error.message}`);
      } else {
        console.log('✅ Login successful:', data);
        setUser(data.user);
        setMessage(`✅ Login successful! Welcome ${data.user.email}`);
        
        // Check Supabase health
        const health = await checkSupabaseHealth();
        console.log('🔧 Supabase health:', health);
      }
    } catch (error: any) {
      console.error('Login exception:', error);
      setMessage(`❌ Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setMessage(`Logout error: ${error.message}`);
      } else {
        setUser(null);
        setMessage('✅ Logged out successfully');
      }
    } catch (error: any) {
      setMessage(`Logout exception: ${error.message}`);
    }
  };

  const checkSupabaseHealth = async () => {
    try {
      // Test 1: Basic connection
      const { error: sessionError } = await supabase.auth.getSession();
      
      // Test 2: REST API access
      const { error: restError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      
      return {
        connected: !sessionError,
        restAccess: !restError,
        sessionError: sessionError?.message,
        restError: restError?.message,
        environment: process.env.NODE_ENV,
      };
    } catch (error: any) {
      return {
        connected: false,
        restAccess: false,
        error: error.message,
        environment: process.env.NODE_ENV,
      };
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>BILT Platform Login Test</h1>
      
      <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3>Configuration Status</h3>
        {config && (
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        )}
        <p>
          <strong>Environment Variables:</strong>{' '}
          {config?.usingEnvVars ? '✅ Set in Railway' : '❌ Not set (using fallbacks)'}
        </p>
        <p>
          <strong>Mode:</strong> {config?.isProduction ? 'Production' : 'Development'}
        </p>
      </div>

      {user ? (
        <div style={{ background: '#e8f5e8', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3>✅ Logged In</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <button
            onClick={handleLogout}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} style={{ marginBottom: '2rem' }}>
          <h3>Test Login</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#0070f3',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Test Login'}
          </button>
        </form>
      )}

      {message && (
        <div style={{
          background: message.includes('✅') ? '#e8f5e8' : '#f8d7da',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <strong>{message.includes('✅') ? '✅ Success:' : '❌ Error:'}</strong> {message}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f8ff', borderRadius: '8px' }}>
        <h3>Test Credentials</h3>
        <ul>
          <li><strong>Owner:</strong> owner@bilt.com / password123</li>
          <li><strong>Gym:</strong> gym@bilt.com / password123</li>
          <li><strong>PT:</strong> pt@bilt.com / password123</li>
          <li><strong>Client:</strong> client@bilt.com / password123</li>
        </ul>
        <p><small>Note: These users exist in Supabase Auth (created via script)</small></p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Next Steps for 100+ Customers</h3>
        <p>The current implementation uses a single Supabase project. For production with hundreds of customers:</p>
        <ol>
          <li>Implement multi-tenant architecture (see MULTI-TENANT-LOGIN-ARCHITECTURE.md)</li>
          <li>Add tenant_id to all database tables</li>
          <li>Implement Row-Level Security (RLS) policies</li>
          <li>Create subdomain routing (acme-gym.bilt.com)</li>
          <li>Add tenant onboarding flow</li>
        </ol>
        <p>
          <strong>Current deployment is using Railway environment variables ✅</strong><br />
          This proves the infrastructure works. Now we need to scale it for multiple customers.
        </p>
      </div>
    </div>
  );
}