import { NextResponse } from "next/server";
import { getAlbumGallery, uploadAlbumImage, deleteAlbumImage, setThumbnail } from "@/app/apis/service/profile/albumService";
import { handleApiError, createUnauthorizedError, createBadRequestError } from "@/app/apis/base";

// GET: 앨범 이미지 목록 조회
export async function GET() {
  try {
    const { formatted, thumbnailIndex } = await getAlbumGallery();
    return NextResponse.json({ success: true, data: formatted, thumbnailIndex });

  } catch (error: any) {
    if (typeof error?.message === 'string') {
      if (error.message === '사용자 인증 오류') {
        return handleApiError(createUnauthorizedError(error.message));
      }
    }
    return handleApiError(error);
  }
}

// POST: 새 앨범 이미지 업로드
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const newImage = await uploadAlbumImage(formData);
    return NextResponse.json({ success: true, data: newImage });

  } catch (error: any) {
    if (typeof error?.message === 'string') {
      if (error.message === '사용자 인증 오류') {
        return handleApiError(createUnauthorizedError(error.message));
      }
      if (error.message.includes('필수 정보') || error.message.includes('인덱스')) {
        return handleApiError(createBadRequestError(error.message));
      }
    }
    return handleApiError(error);
  }
}

// DELETE: 앨범 이미지 삭제
export async function DELETE(request: Request) {
  try {
    const { imageId } = await request.json();
    if (!imageId) throw createBadRequestError('이미지 ID가 누락되었습니다.');
    const result = await deleteAlbumImage(imageId);
    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    if (typeof error?.message === 'string') {
      if (error.message === '사용자 인증 오류') {
        return handleApiError(createUnauthorizedError(error.message));
      }
    }
    return handleApiError(error);
  }
}

// PATCH: 이미지를 썸네일로 설정
export async function PATCH(request: Request) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) throw createBadRequestError('URL이 누락되었습니다.');
    const result = await setThumbnail(imageUrl);
    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    if (typeof error?.message === 'string') {
      if (error.message === '사용자 인증 오류') {
        return handleApiError(createUnauthorizedError(error.message));
      }
    }
    return handleApiError(error);
  }
}