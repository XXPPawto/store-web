import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Only create client if we have the required variables
let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn("Supabase environment variables are missing")
}

export { supabase }
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)
