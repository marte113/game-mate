import { NextResponse } from "next/server";
import { getAlbumGallery, uploadAlbumImage, deleteAlbumImage, setThumbnail } from "@/app/apis/service/profile/albumService";

// GET: 앨범 이미지 목록 조회
export async function GET() {
  try {
    const { formatted, thumbnailIndex } = await getAlbumGallery();
    return NextResponse.json({ success: true, data: formatted, thumbnailIndex });

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
    const formData = await request.formData();
    const newImage = await uploadAlbumImage(formData);
    return NextResponse.json({ success: true, data: newImage });

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
    const { imageId } = await request.json();
    if (!imageId) throw new Error('이미지 ID가 누락되었습니다.');
    const result = await deleteAlbumImage(imageId);
    return NextResponse.json({ success: true, ...result });

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
    const { imageUrl } = await request.json();
    const result = await setThumbnail(imageUrl);
    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    console.error('PATCH /api/profile/image/image_gallery Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '썸네일 설정 실패' },
      { status: error.message === '사용자 인증 오류' ? 401 : error.message.includes('URL이 누락') ? 400 : 500 }
    );
  }
}