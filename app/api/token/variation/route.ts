import { NextResponse } from "next/server";
import { getMyMonthlyUsage } from '@/app/apis/service/token/variationService'
import { handleApiError } from '@/app/apis/base'

export async function GET() {
  try {
    const result = await getMyMonthlyUsage()
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
