import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ✅ READ cookies (allowed)
        get(name: string) {
          return cookieStore.get(name)?.value
        },

        // ❌ DO NOTHING on set (Next.js 16 restriction)
        set() {},

        // ❌ DO NOTHING on remove
        remove() {},
      },
    }
  )
}
