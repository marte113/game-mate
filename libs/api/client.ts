import { createBrowserClient } from '@supabase/ssr'

import { Database } from '@/types/database.types';

// 클라이언트 컴포넌트에서 사용할 Supabase 클라이언트
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
