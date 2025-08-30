import { NextResponse } from "next/server";
import { getAlbumGallery, uploadAlbumImage, deleteAlbumImage, setThumbnail } from "@/app/apis/service/profile/albumService";
import { handleApiError, createUnauthorizedError, createValidationError } from "@/app/apis/base";
import { albumUploadFormDataSchema, albumDeleteBodySchema, albumSetThumbnailBodySchema } from '@/libs/schemas/server/album.schema'

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
    const parsed = albumUploadFormDataSchema.safeParse({
      file: formData.get('file'),
      index: formData.get('index')
    })
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      return handleApiError(createValidationError('요청 본문이 유효하지 않습니다.', details))
    }
    const newImage = await uploadAlbumImage(formData);
    return NextResponse.json({ success: true, data: newImage });

  } catch (error: any) {
    if (typeof error?.message === 'string') {
      if (error.message === '사용자 인증 오류') {
        return handleApiError(createUnauthorizedError(error.message));
      }
      if (error.message.includes('필수 정보') || error.message.includes('인덱스')) {
        return handleApiError(createValidationError(error.message));
      }
    }
    return handleApiError(error);
  }
}

// DELETE: 앨범 이미지 삭제
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => undefined)
    const parsed = albumDeleteBodySchema.safeParse(body)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      return handleApiError(createValidationError('요청 본문이 유효하지 않습니다.', details))
    }
    const result = await deleteAlbumImage(parsed.data.imageId);
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
    const body = await request.json().catch(() => undefined)
    const parsed = albumSetThumbnailBodySchema.safeParse(body)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      return handleApiError(createValidationError('요청 본문이 유효하지 않습니다.', details))
    }
    const result = await setThumbnail(parsed.data.imageUrl);
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