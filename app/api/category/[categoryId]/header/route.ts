import { NextRequest, NextResponse } from "next/server";
import { getCategoryHeader } from '@/app/apis/service/category/headerService'
import { handleApiError, createNotFoundError, createServiceError } from '@/app/apis/base'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params; // 예: "League_of_legend"

  try {
    const result = await getCategoryHeader(categoryId)
    if ('error' in result) {
      if (result.status === 404) throw createNotFoundError(result.error)
      throw createServiceError(result.error)
    }
    return NextResponse.json(result)
  } catch (err) {
    return handleApiError(err)
  }
}
