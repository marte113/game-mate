import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import { Database } from "@/types/database.types";

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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "파일이 제공되지 않았습니다" }, 
        { status: 400 }
      );
    }

    // 파일 형식 검증
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: "이미지 파일만 업로드할 수 있습니다" }, 
        { status: 400 }
      );
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "파일 크기는 5MB를 초과할 수 없습니다" }, 
        { status: 400 }
      );
    }

    // 파일 이름 생성
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Supabase Storage에 업로드
    const { error, data } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message }, 
        { status: 500 }
      );
    }

    // 공개 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      success: true, 
      data: { url: publicUrl } 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" }, 
      { status: 500 }
    );
  }
}
