import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers';

import { Database } from '@/types/database.types';

// 서버 컴포넌트에서 사용할 Supabase 클라이언트
export const createServerClientComponent = async () => {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  );
};

// 서버 액션에서 사용할 Supabase 클라이언트
export const createActionClient = async (cookieStore: ReturnType<typeof cookies>) => {
  const resolvedCookieStore = await cookieStore;
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return resolvedCookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            resolvedCookieStore.set(name, value, options)
          })
        },
      },
    }
  );
};
