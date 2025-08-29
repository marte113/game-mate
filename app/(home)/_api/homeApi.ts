import { RecommendedThemeResponse } from "@/app/(home)/_types/homePage.types";
import { fetchJson } from "@/libs/api/fetchJson";

export async function fetchRecommendedThemes({ 
  pageParam = 0 
}: { 
  pageParam: number 
}): Promise<RecommendedThemeResponse> {
  const pageNum = Number(pageParam) || 0;
  return fetchJson<RecommendedThemeResponse>(`/api/category/recommend?page=${pageNum}`);
}
