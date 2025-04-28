// app/api/profile/image/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Database } from "@/types/database.types";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// 프로필 이미지 정보 가져오기
export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "사용자 인증 오류" }, 
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('users')
      .select('profile_circle_img, profile_thumbnail_img')
      .eq('id', user.id)
      .single();
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        profileImage: data.profile_circle_img,
        thumbnailImage: data.profile_thumbnail_img
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" }, 
      { status: 500 }
    );
  }
}

// 프로필 이미지 업데이트
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "사용자 인증 오류" }, 
        { status: 401 }
      );
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "이미지 URL이 제공되지 않았습니다" }, 
        { status: 400 }
      );
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
      return NextResponse.json(
        { success: false, error: error.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: { imageUrl } 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" }, 
      { status: 500 }
    );
  }
}