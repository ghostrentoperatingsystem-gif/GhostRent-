import { createClient } from '@supabase/supabase-js'

// Client-side Supabase connector — safe to use in 'use client' components.
// Uses the public anon key, protected by your RLS policies (sql/rls_policies.sql).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
