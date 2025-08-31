import { NextResponse } from "next/server";
import { uploadMyAvatar } from '@/app/apis/service/storage/uploadService'
import { handleApiError, createValidationError } from '@/app/apis/base'
import { avatarUploadFormDataSchema } from '@/libs/schemas/server/upload.schema'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const parsed = avatarUploadFormDataSchema.safeParse({ file: formData.get('file') })
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError('요청 본문이 유효하지 않습니다.', details)
    }
    const { file } = parsed.data
    const result = await uploadMyAvatar(file)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
