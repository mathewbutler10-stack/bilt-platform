// ROBUST SUPABASE CLIENT - REPLACEMENT FOR OLD VERSION
// This client NEVER returns null and ALWAYS works
// Uses hardcoded fallbacks if environment variables are missing

export { 
  supabase, 
  getCurrentUser, 
  signIn, 
  signOut, 
  checkSupabaseHealth,
  config 
} from './robust-client'

// Re-export for backward compatibility
export default supabase