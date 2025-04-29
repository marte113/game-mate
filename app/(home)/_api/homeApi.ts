import { RecommendedThemeResponse } from "@/app/(home)/_types/homePage.types";

export async function fetchRecommendedThemes({ 
  pageParam = 0 
}: { 
  pageParam: number 
}): Promise<RecommendedThemeResponse> {
  const response = await fetch(`/api/category/recommend?page=${pageParam}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch recommended themes');
  }
  
  return response.json();
}
