import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://mpxngnawfsvrlvrmdajv.supabase.co'

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1weG5nbmF3ZnN2cmx2cm1kYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MTI0MzAsImV4cCI6MjA2MTQ4ODQzMH0.rU-qO1r2P1kY_d5y2V12tF85K5C_e4O2Q2L1O1D0R48'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
