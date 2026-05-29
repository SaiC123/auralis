import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for server-side usage (Server Components, Server Actions, Route Handlers).
 * Call this function inside each request — do NOT cache the result across requests.
 */
export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    const cookieStore = await cookies()
    return createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            cookie: cookieStore.toString(),
          },
        },
      }
    )
  }

  // Fallback mock server client
  return {
    auth: {
      async getUser() {
        return {
          data: {
            user: {
              id: 'mock-user-id',
              email: 'mock@example.com',
              user_metadata: { name: 'Mock User' },
            },
          },
          error: null,
        }
      },
    },
    from(tableName) {
      const chain = {
        select: () => chain,
        insert: () => chain,
        update: () => chain,
        delete: () => chain,
        eq: () => chain,
        order: () => chain,
        single: async () => ({ data: null, error: null }),
        then: (onfulfilled) => Promise.resolve({ data: [], error: null }).then(onfulfilled),
      }
      return chain
    },
  }
}
