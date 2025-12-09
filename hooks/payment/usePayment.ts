import { useState } from "react"
import { useRouter } from "next/navigation"
import * as PortOne from "@portone/browser-sdk/v2"
import { toast } from "react-hot-toast"
import { v4 as uuidv4 } from "uuid"
import { useUser } from "@/stores/authStore"

type TokenOption = {
  orderName: string
  tokenAmount: number
  totalAmount: number
  originalPrice: number
  discount: string
}

export default function usePayment() {
  const [processing, setProcessing] = useState<boolean>(false)
  const router = useRouter()
  const user = useUser()

  const processPayment = async (selectedOption: TokenOption) => {
    try {
      // 로그인 확인
      if (!user) {
        toast.error("로그인이 필요합니다")
        return
      }

      // 토큰 선택 확인
      if (!selectedOption) {
        toast.error("토큰을 선택해주세요")
        return
      }

      // 결제 요청
      setProcessing(true)

      // 고유한 결제 ID 생성
      const paymentId = `payment-${uuidv4()}`

      // 환경 변수 확인 (클라이언트 공개 키)
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY
      if (!storeId || !channelKey) {
        toast.error("결제 설정이 누락되었습니다. 관리자에게 문의해주세요.")
        return
      }

      // PortOne 결제 파라미터
      const paymentRequest = {
        storeId,
        channelKey,
        paymentId: paymentId,
        orderName: `token-${selectedOption.tokenAmount}`,
        totalAmount: selectedOption.totalAmount,
        currency: "KRW",
        payMethod: "CARD",
        customer: (() => {
          const obj: { customerId: string; email?: string } = { customerId: user.id }
          // authStore의 user에는 email이 없으므로 안전 캐스팅
          const email = (user as unknown as { email?: string })?.email
          if (typeof email === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            obj.email = email
          }
          return obj
        })(),
        customData: JSON.stringify({ userId: user.id }),
      }

      console.log("결제 요청 정보:", paymentRequest)

      const response = await PortOne.requestPayment(
        paymentRequest as unknown as Parameters<typeof PortOne.requestPayment>[0],
      )

      console.log("포트원 응답:", response)

      // 응답이 없거나 에러 형태일 수 있음에 대비한 가드
      if (!response) {
        toast.error("결제가 취소되었거나 응답이 없습니다.")
        return
      }

      if ("code" in response && (response as any).code !== undefined) {
        toast.error((response as any).message ?? "결제 오류가 발생했습니다.")
        return
      }

      const paymentIdFromRes = (response as any).paymentId as string | undefined
      if (!paymentIdFromRes) {
        toast.error("결제 식별자(paymentId)를 확인할 수 없습니다.")
        return
      }

      router.push(`/payment/complete?paymentId=${paymentIdFromRes}`)
    } catch (error) {
      console.error("결제 요청 중 오류 발생:", error)
      toast.error("결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setProcessing(false)
    }
  }

  return {
    processing,
    processPayment,
  }
}
