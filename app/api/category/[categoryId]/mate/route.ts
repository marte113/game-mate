import { NextRequest, NextResponse } from "next/server";

import type { MatesApiResponse } from "@/app/category/_types/categoryPage.types";
import { getCategoryMates } from '@/app/apis/service/category/mateService'
import { toErrorResponse, BadRequestError } from '@/app/apis/base'

// 페이지 크기 및 쿼리 결과 타입은 Service로 이동

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params; // 예: "League_of_legend"
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") ?? "0", 10);

  if (!categoryId || isNaN(page) || page < 0) {
    throw new BadRequestError("Invalid category ID or page number");
  }

  try {
    const result = await getCategoryMates(categoryId, page)
    const response: MatesApiResponse = result
    return NextResponse.json(response)
  } catch (err) {
    return toErrorResponse(err)
  }
}

