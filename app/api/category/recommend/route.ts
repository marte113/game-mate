//추천 메이트를 불러오는데 사용할 api
// 검증 필요 없음.
// recommend 

import { NextRequest, NextResponse } from "next/server";

import { RecommendedThemeResponse } from "@/app/(home)/_types/homePage.types";
import { buildRecommendedThemes } from "@/app/apis/service/category/recommendService";
import { handleApiError, createBadRequestError, createServiceError } from '@/app/apis/base'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") ?? "0", 10);

    if (isNaN(page) || page < 0) {
      throw createBadRequestError('Invalid page number')
    }

    const { themes, nextPage } = await buildRecommendedThemes(page);
    const response: RecommendedThemeResponse = { themes, nextPage };
    return NextResponse.json(response);
  } catch (err) {
    return handleApiError(createServiceError('Unexpected error fetching recommended mates', err))
  }
}