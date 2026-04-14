// Server-side Supabase client - Simple and reliable with hardcoded fallbacks
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// HARDCODED VALUES - ALWAYS WORK
const FALLBACK_SUPABASE_URL = 'https://sniuhfijadbghoxfsnft.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_xiu402i5-YXmceIq8s6DhA_50ySTuOb'

export async function createClient() {
  const cookieStore = await cookies()
  
  // Use environment variables or hardcoded fallbacks - NEVER return null
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY
  
  console.log('🔧 Server-side Supabase client initialized')
  console.log('   URL:', supabaseUrl)
  console.log('   Using environment variables:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // Silent fail during build time - expected
          }
        },
      },
    }
  )
}

// Safe server-side user fetch - won't crash during build
export async function getServerUser() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return null // No Supabase client during build
    }
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    // Expected during build time - return null instead of crashing
    return null
  }
}