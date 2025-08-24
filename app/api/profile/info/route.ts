import { NextResponse } from "next/server";
import { getProfileInfo, updateProfileInfo } from '@/app/apis/service/profile/infoService'

export async function GET() {
  try {
    const result = await getProfileInfo()
    return NextResponse.json(result)
  } catch (error) {
    console.error('API GET error:', error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const result = await updateProfileInfo(requestData)
    if ('status' in result && result.status === 400) {
      return NextResponse.json({ error: result.error, details: result.details }, { status: 400 })
    }
    return NextResponse.json(result)
  } catch (error: any) {
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
    }
    console.error('API POST error:', error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다", details: error.message }, { status: 500 });
  }
}
