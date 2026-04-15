// SIMPLIFIED SUPABASE CLIENT - FIX FOR PRODUCTION
import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client with basic configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Configuration object
export const config = {
  supabaseUrl,
  supabaseAnonKey: supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'missing',
  usingEnvVars: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  timestamp: new Date().toISOString()
}

// Health check function
export async function checkSupabaseHealth() {
  try {
    // Try to connect to Supabase
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    
    return {
      connected: !error,
      error: error?.message,
      usingFallback: !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  } catch (error: any) {
    return {
      connected: false,
      error: error.message,
      usingFallback: !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  }
}

// Basic helper functions
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    return null
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Unexpected error' }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}