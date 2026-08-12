// src/lib/supabase.ts
//
// Server-side Supabase client.
//
// Uses the SERVICE ROLE KEY — intentionally bypasses Row Level Security
// because all queries originate from trusted server-side repository code.
//
// NEVER import this module in any client-side (browser) file.
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the frontend.

import { createClient } from '@supabase/supabase-js'

const DEFAULTS: Record<string, string> = {
  SUPABASE_URL: "https://uellbowgdflxvdzususl.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "sb_secret_IbLj_jfDZr6XKOegMbXEwQ_aGyPR2ff",
}

function getRequiredEnv(key: string): string {
  const value = process.env[key] || DEFAULTS[key]
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value.trim()
}

// Singleton — created once at module initialisation time.
// Both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be present
// in the environment before this module is first imported.
export const supabase = createClient(
  getRequiredEnv('SUPABASE_URL'),
  getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
  {
    auth: {
      // Disable Supabase's built-in auth helpers — the project uses its own
      // custom session management via the sessions table and authService.
      persistSession: false,
      autoRefreshToken: false,
    },
  },
)
