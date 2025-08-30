import { NextResponse } from "next/server";
import { getProfileInfo, updateProfileInfo } from '@/app/apis/service/profile/infoService'
import { handleApiError, createBadRequestError, createValidationError } from '@/app/apis/base'

export async function GET() {
  try {
    const result = await getProfileInfo()
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const result = await updateProfileInfo(requestData)
    if ('status' in result && result.status === 400) {
      throw createValidationError(result.error, result.details)
    }
    return NextResponse.json(result)
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return handleApiError(createBadRequestError('잘못된 요청 형식입니다.'))
    }
    return handleApiError(error)
  }
}
