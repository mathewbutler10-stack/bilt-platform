// Re-export from robust client (primary) and server
import { supabase as robustSupabase, getCurrentUser, signIn, signOut, checkSupabaseHealth, config } from './robust-client'
export { robustSupabase as supabase, getCurrentUser, signIn, signOut, checkSupabaseHealth, config }
export { createClient, getServerUser } from './server'

// Default export for backward compatibility
export default robustSupabase