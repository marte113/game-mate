// app/api/profile/image/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { Database } from "@/types/database.types";
import { handleApiError, createUnauthorizedError, createBadRequestError, createServiceError } from "@/app/apis/base";

// 프로필 이미지 정보 가져오기
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw createUnauthorizedError("사용자 인증 오류");
    }

    const { data, error } = await supabase
      .from('users')
      .select('profile_circle_img, profile_thumbnail_img')
      .eq('id', user.id)
      .single();
    
    if (error) {
      throw createServiceError('프로필 이미지 조회 실패', error);
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        profileImage: data.profile_circle_img,
        thumbnailImage: data.profile_thumbnail_img
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 프로필 이미지 업데이트
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw createUnauthorizedError("사용자 인증 오류");
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      throw createBadRequestError("이미지 URL이 제공되지 않았습니다");
    }

    // 사용자 정보 업데이트
    const { error } = await supabase
      .from("users")
      .update({
        profile_circle_img: imageUrl,
        profile_thumbnail_img: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      throw createServiceError('프로필 이미지 업데이트 실패', error);
    }

    return NextResponse.json({ 
      success: true, 
      data: { imageUrl } 
    });
  } catch (error) {
    return handleApiError(error);
  }
}