import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { Database } from '@/types/database.types';

// 클라이언트 컴포넌트에서 사용할 Supabase 클라이언트
export const createClient = () => {
  return createClientComponentClient<Database>();
};

// 서버 컴포넌트에서 사용할 Supabase 클라이언트
export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

// 서버 액션에서 사용할 Supabase 클라이언트
export const createActionClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}; 