import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import { Database } from "@/types/database.types";

const BUCKET_NAME = 'albums';

// Helper function to get user
async function getUser(supabase: ReturnType<typeof createRouteHandlerClient<Database>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('사용자 인증 오류');
  }
  return user;
}

// GET: 앨범 이미지 목록 조회
export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const user = await getUser(supabase);

    const { data: imagesData, error: imagesError } = await supabase
      .from('album_images')
      .select('id, image_url, order_num')
      .eq('user_id', user.id)
      .order('order_num', { ascending: true });

    if (imagesError) throw imagesError;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('profile_thumbnail_img')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    const thumbnailUrl = userData?.profile_thumbnail_img;
    const formattedImages = Array(6).fill(null);
    let thumbnailIndex: number | null = null;

    imagesData.forEach((img) => {
      if (img.order_num >= 0 && img.order_num < 6) {
        const isThumbnail = img.image_url === thumbnailUrl;
        formattedImages[img.order_num] = {
          id: img.id,
          url: img.image_url,
          isThumbnail: isThumbnail,
        };
        if (isThumbnail) {
          thumbnailIndex = img.order_num;
        }
      }
    });

    return NextResponse.json({ success: true, data: formattedImages, thumbnailIndex });

  } catch (error: any) {
    console.error('GET /api/profile/image/image_gallery Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '앨범 이미지 조회 실패' },
      { status: error.message === '사용자 인증 오류' ? 401 : 500 }
    );
  }
}

// POST: 새 앨범 이미지 업로드
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const user = await getUser(supabase);
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const indexStr = formData.get('index') as string | null;

    if (!file || indexStr === null) {
      throw new Error('필수 정보(파일, 인덱스)가 누락되었습니다.');
    }
    const index = parseInt(indexStr, 10);
    if (isNaN(index) || index < 0 || index > 5) {
      throw new Error('유효하지 않은 인덱스입니다.');
    }

    // 1. 기존 이미지 정보 확인 (삭제 위함)
    const { data: existingImageData, error: selectError } = await supabase
      .from('album_images')
      .select('id, image_url')
      .eq('user_id', user.id)
      .eq('order_num', index)
      .maybeSingle(); // 이미지가 없을 수도 있음

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116: no rows found
        throw selectError;
    }

    // 2. 새 이미지 Storage 업로드
    const fileExt = file.name.split('.').pop();
    const fileName = `album_${index}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // 덮어쓰기 방지
      });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    // 3. 기존 이미지 DB 레코드 및 Storage 파일 삭제 (존재하는 경우)
    if (existingImageData) {
      const { error: deleteDbError } = await supabase
        .from('album_images')
        .delete()
        .eq('id', existingImageData.id);
      if (deleteDbError) {
        console.error('기존 DB 레코드 삭제 오류 (무시 가능):', deleteDbError);
        // 실패해도 계속 진행 (새 이미지 삽입 시도)
      }

      // Storage에서 기존 파일 삭제 (기존 URL에서 파일 경로 추출)
      try {
        const oldFilePath = existingImageData.image_url.split(`${BUCKET_NAME}/`)[1];
        if (oldFilePath) {
          const { error: deleteStorageError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([oldFilePath]);
          if (deleteStorageError) {
             console.error('기존 Storage 파일 삭제 오류 (무시 가능):', deleteStorageError);
          }
        }
      } catch (pathError) {
        console.error('기존 파일 경로 추출 오류 (무시 가능):', pathError);
      }
    }

    // 4. 새 이미지 정보 DB 삽입
    const { data: newImage, error: insertError } = await supabase
      .from('album_images')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        order_num: index,
      })
      .select('id, image_url, order_num')
      .single();
    if (insertError) throw insertError;

    return NextResponse.json({ success: true, data: { ...newImage, isThumbnail: false } }); // isThumbnail은 GET에서 판별

  } catch (error: any) {
    console.error('POST /api/profile/image/image_gallery Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '앨범 이미지 업로드 실패' },
      { status: error.message === '사용자 인증 오류' ? 401 : (error.message.includes('필수 정보') || error.message.includes('인덱스')) ? 400 : 500 }
    );
  }
}

// DELETE: 앨범 이미지 삭제
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const user = await getUser(supabase);
    const { imageId } = await request.json();

    if (!imageId) {
      throw new Error('이미지 ID가 누락되었습니다.');
    }

    // 1. 삭제할 이미지 정보 조회 (URL, 썸네일 여부 확인)
    const { data: imageToDelete, error: selectError } = await supabase
      .from('album_images')
      .select('id, image_url, order_num')
      .eq('id', imageId)
      .eq('user_id', user.id) // 본인 확인
      .single();

    if (selectError) {
      if (selectError.code === 'PGRST116') throw new Error('삭제할 이미지를 찾을 수 없습니다.');
      throw selectError;
    }

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('profile_thumbnail_img')
        .eq('id', user.id)
        .single();
    if (userError) throw userError;

    const wasThumbnail = imageToDelete.image_url === userData?.profile_thumbnail_img;

    // 2. DB 레코드 삭제
    const { error: deleteDbError } = await supabase
      .from('album_images')
      .delete()
      .eq('id', imageToDelete.id);
    if (deleteDbError) throw deleteDbError;

    // 3. Storage 파일 삭제
    try {
      const filePath = imageToDelete.image_url.split(`${BUCKET_NAME}/`)[1];
      if (filePath) {
        const { error: deleteStorageError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([filePath]);
        if (deleteStorageError) {
          console.error('Storage 파일 삭제 오류 (무시 가능):', deleteStorageError);
        }
      }
    } catch (pathError) {
       console.error('파일 경로 추출 오류 (무시 가능):', pathError);
    }

    // 4. 썸네일 재설정 로직
    let newThumbnailUrl: string | null = null;
    if (wasThumbnail) {
      const { data: remainingImages, error: remainingError } = await supabase
        .from('album_images')
        .select('image_url')
        .eq('user_id', user.id)
        .order('order_num', { ascending: true })
        .limit(1);

      if (remainingError) {
         console.error('남은 이미지 조회 오류 (썸네일 재설정 실패):', remainingError);
      } else if (remainingImages && remainingImages.length > 0) {
        newThumbnailUrl = remainingImages[0].image_url;
      }
      // else: 남은 이미지 없으면 null 유지

      const { error: updateThumbError } = await supabase
        .from('users')
        .update({ profile_thumbnail_img: newThumbnailUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateThumbError) {
        console.error('썸네일 자동 재설정 오류:', updateThumbError);
        // 실패해도 삭제 성공으로 간주
      }
    }

    return NextResponse.json({ success: true, deletedImageId: imageId, newThumbnailUrl });

  } catch (error: any) {
    console.error('DELETE /api/profile/image/image_gallery Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '앨범 이미지 삭제 실패' },
      { status: error.message === '사용자 인증 오류' ? 401 : error.message.includes('ID가 누락') ? 400 : 500 }
    );
  }
}

// PATCH: 이미지를 썸네일로 설정
export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const user = await getUser(supabase);
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      throw new Error('이미지 URL이 누락되었습니다.');
    }

    // 사용자 테이블의 썸네일 업데이트
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_thumbnail_img: imageUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, newThumbnailUrl: imageUrl });

  } catch (error: any) {
    console.error('PATCH /api/profile/image/image_gallery Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '썸네일 설정 실패' },
      { status: error.message === '사용자 인증 오류' ? 401 : error.message.includes('URL이 누락') ? 400 : 500 }
    );
  }
}