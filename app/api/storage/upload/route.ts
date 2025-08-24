import { NextResponse } from "next/server";
import { uploadMyAvatar } from '@/app/apis/service/storage/uploadService'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: "파일이 제공되지 않았습니다" }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: "이미지 파일만 업로드할 수 있습니다" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "파일 크기는 5MB를 초과할 수 없습니다" }, { status: 400 })
    }

    const result = await uploadMyAvatar(file)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
