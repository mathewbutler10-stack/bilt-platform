// ROBUST SUPABASE CLIENT - PRODUCTION-READY WITH ENVIRONMENT VARIABLES ONLY
// No hardcoded values - uses environment variables exclusively for security

import { createClient } from '@supabase/supabase-js'

// PRODUCTION CONFIGURATION - Environment variables only (no hardcoded fallbacks)
const getSupabaseConfig = () => {
  // REQUIRED environment variables for production
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = '❌ Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
    
    if (typeof window !== 'undefined') {
      // Browser context - show user-friendly error
      console.error(errorMessage)
      throw new Error('Application configuration error. Please contact support.')
    } else {
      // Server/Node context - throw detailed error
      throw new Error(errorMessage)
    }
  }
  
  // Diagnostic logging (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Supabase Configuration:')
    console.log('   Using: Environment Variables ✅')
    console.log('   URL:', supabaseUrl)
    console.log('   Environment:', process.env.NODE_ENV)
    console.log('   Mode: Production-ready')
  }
  
  return {
    supabaseUrl,
    supabaseAnonKey
  }
}

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

// CREATE CLIENT - PRODUCTION-READY WITH MULTI-TENANT SUPPORT
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // More secure for production
  },
  global: {
    headers: {
      'x-application-name': 'BILT-Platform',
      'x-application-version': '1.0.0'
    }
  }
})

// TEST CONNECTION ON STARTUP (non-blocking)
const testConnection = async () => {
  try {
    const { error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message)
      console.log('🔍 Configuration Status:')
      console.log('   Using environment variables:', usingEnvVars ? '✅ Yes' : '❌ No')
      console.log('   Supabase URL:', supabaseUrl)
      console.log('   Environment:', process.env.NODE_ENV || 'unknown')
      console.log('🔍 Possible issues:')
      console.log('   1. CORS: Add Railway domain to Supabase CORS settings')
      console.log('   2. Network: Check if Supabase project is active')
      console.log('   3. Key: Verify anon key is correct')
      console.log('   4. Environment variables not set in Railway')
      console.log('   Railway domain:', typeof window !== 'undefined' ? window.location.origin : 'Server')
    } else {
      console.log('✅ Supabase connected successfully')
      console.log('   Configuration:', usingEnvVars ? 'Environment Variables ✅' : 'Development Fallbacks ⚠️')
    }
  } catch (error) {
    console.error('❌ Supabase connection test exception:', error.message)
  }
}

// Run test in background (don't block startup)
if (typeof window !== 'undefined') {
  // Browser - test after page load
  setTimeout(testConnection, 1000)
} else {
  // Server/Node - test immediately
  testConnection()
}

// ENHANCED HELPER FUNCTIONS WITH ERROR HANDLING
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Sign in error:', error.message)
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Sign in exception:', error)
    return { success: false, error: 'Unexpected error' }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error }
  }
}

// DIAGNOSTIC FUNCTION - Check Supabase health
export async function checkSupabaseHealth() {
  try {
    // Test 1: Basic connection
    const { error: sessionError } = await supabase.auth.getSession()
    
    // Test 2: REST API access
    const { error: restError } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    
    return {
      connected: !sessionError,
      restAccess: !restError,
      sessionError: sessionError?.message,
      restError: restError?.message,
      supabaseUrl,
      environment: process.env.NODE_ENV,
      usingFallback: !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  } catch (error) {
    return {
      connected: false,
      restAccess: false,
      error: error.message,
      supabaseUrl,
      environment: process.env.NODE_ENV,
      usingFallback: true
    }
  }
}

// Export configuration for debugging
export const config = {
  supabaseUrl,
  environment: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production'
}

console.log('🚀 Robust Supabase client initialized')
console.log('   URL:', supabaseUrl)
console.log('   Using environment variables: ✅ Yes')
console.log('   Environment:', config.environment || 'unknown')
console.log('   Mode:', config.isProduction ? 'Production' : 'Development')