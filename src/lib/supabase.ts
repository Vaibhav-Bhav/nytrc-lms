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

// No hardcoded fallbacks. A committed service-role key bypasses RLS on the whole
// database, and a stale one fails as an opaque "Unregistered API key" 500 at the
// first query rather than at startup. Fail fast and loudly instead.
function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Set it in .env for local development (loaded by src/server.ts), or in the ` +
        `process environment on the server. See .env.example.`,
    )
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
