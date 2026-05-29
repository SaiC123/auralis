import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://acoauqmdmgaljqtdjuuh.supabase.co/'

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjb2F1cW1kbWdhbGpxdGRqdXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTU1NTksImV4cCI6MjA5NTYzMTU1OX0.7lTC3EM5VpLByx1u_mjQqzsjra4BNDidu9H_AfuiZ5A'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
