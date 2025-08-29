import { NextResponse } from "next/server";
import { uploadMyAvatar } from '@/app/apis/service/storage/uploadService'
import { toErrorResponse, BadRequestError } from '@/app/apis/base'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      throw new BadRequestError("파일이 제공되지 않았습니다")
    }

    if (!file.type.startsWith('image/')) {
      throw new BadRequestError("이미지 파일만 업로드할 수 있습니다")
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestError("파일 크기는 5MB를 초과할 수 없습니다")
    }

    const result = await uploadMyAvatar(file)
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
