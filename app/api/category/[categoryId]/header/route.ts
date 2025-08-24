import { NextRequest, NextResponse } from "next/server";
import { getCategoryHeader } from '@/app/apis/service/category/headerService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params; // 예: "League_of_legend"

  try {
    const result = await getCategoryHeader(categoryId)
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })
    return NextResponse.json(result)
  } catch (err) {
    console.error("Unexpected error fetching mates:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
