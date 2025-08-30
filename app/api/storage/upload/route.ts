import { NextResponse } from "next/server";
import { uploadMyAvatar } from '@/app/apis/service/storage/uploadService'
import { handleApiError, createBadRequestError } from '@/app/apis/base'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      throw createBadRequestError("파일이 제공되지 않았습니다")
    }

    if (!file.type.startsWith('image/')) {
      throw createBadRequestError("이미지 파일만 업로드할 수 있습니다")
    }

    if (file.size > 5 * 1024 * 1024) {
      throw createBadRequestError("파일 크기는 5MB를 초과할 수 없습니다")
    }

    const result = await uploadMyAvatar(file)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
