import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { Database } from "@/types/database.types";
import { profileSchema } from '@/libs/schemas/profile.schema';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "사용자 인증 오류" }, { status: 401 });
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({ profileData: null }, { status: 200 });
      }
      console.error('Profile GET error:', profileError);
      return NextResponse.json({ error: "프로필 정보를 가져오는데 실패했습니다." }, { status: 500 });
    }

    const responsePayload = {
        ...profileData,
        nickname: profileData.nickname ?? '',
        username: profileData.username ?? '',
        description: profileData.description ?? '',
        selected_games: profileData.selected_games ?? [],
        selected_tags: profileData.selected_tags ?? [],
        youtube_urls: profileData.youtube_urls ?? [],
        is_mate: profileData.is_mate ?? false,
    };

    return NextResponse.json({ profileData: responsePayload });
  } catch (error) {
    console.error('API GET error:', error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "사용자 인증 오류" }, { status: 401 });
    }

    const requestData = await request.json();

    const partialProfileSchema = profileSchema.partial();
    const validationResult = partialProfileSchema.safeParse(requestData);

    if (!validationResult.success) {
      console.error('Server-side validation failed:', validationResult.error.flatten());
      return NextResponse.json({
        error: '입력값이 유효하지 않습니다.',
        details: validationResult.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const validatedData = validationResult.data;

    const updatePayload: Partial<Database['public']['Tables']['profiles']['Update']> = {};
    if (validatedData.nickname !== undefined) updatePayload.nickname = validatedData.nickname;
    if (validatedData.username !== undefined) updatePayload.username = validatedData.username;
    if (validatedData.description !== undefined) updatePayload.description = validatedData.description;
    if (validatedData.selectedGames !== undefined) updatePayload.selected_games = validatedData.selectedGames;
    if (validatedData.selectedTags !== undefined) updatePayload.selected_tags = validatedData.selectedTags;
    if (validatedData.youtubeUrls !== undefined) updatePayload.youtube_urls = validatedData.youtubeUrls;
    if (validatedData.is_mate !== undefined) updatePayload.is_mate = validatedData.is_mate;

    if (Object.keys(updatePayload).length === 0) {
        return NextResponse.json({ success: true, message: "No changes detected" });
    }

    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: "프로필 업데이트에 실패했습니다.", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
    }
    console.error('API POST error:', error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다", details: error.message }, { status: 500 });
  }
}
