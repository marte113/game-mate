"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import * as PortOne from "@portone/browser-sdk/v2"
import { toast } from "react-hot-toast"
import { v4 as uuidv4 } from "uuid"
import { useAuthStore } from "@/stores/authStore"
import { createPortal } from "react-dom"

type TokenOption = {
  orderName: string
  tokenAmount: number
  totalAmount: number
  originalPrice: number
  discount: string
}

const TOKEN_OPTIONS: TokenOption[] = [
  {
    orderName: "token-500",
    tokenAmount: 500,
    totalAmount: 200,
    originalPrice: 6000,
    discount: "22% OFF",
  },
  {
    orderName: "token-1000",
    tokenAmount: 1000,
    totalAmount: 9360,
    originalPrice: 12000,
    discount: "22% OFF",
  },
  {
    orderName: "token-2000",
    tokenAmount: 2000,
    totalAmount: 18720,
    originalPrice: 24000,
    discount: "22% OFF",
  },
  {
    orderName: "token-5000",
    tokenAmount: 5000,
    totalAmount: 45600,
    originalPrice: 60000,
    discount: "24% OFF",
  },
  {
    orderName: "token-10000",
    tokenAmount: 10000,
    totalAmount: 91200,
    originalPrice: 120000,
    discount: "24% OFF",
  },
  {
    orderName: "token-30000",
    tokenAmount: 30000,
    totalAmount: 266400,
    originalPrice: 360000,
    discount: "26% OFF",
  },
  {
    orderName: "token-50000",
    tokenAmount: 50000,
    totalAmount: 444000,
    originalPrice: 600000,
    discount: "26% OFF",
  },
]

type Props = { isOpen: boolean; onClose: () => void }

export default function TokenChargeModal({ isOpen, onClose }: Props) {
  const [selectedOption, setSelectedOption] = useState<TokenOption | null>(null)
  const router = useRouter()
  const [processing, setProcessing] = useState<boolean>(false)
  const { user } = useAuthStore()
  const isMountedRef = useRef<boolean>(false)

  // 컴포넌트가 마운트된 후 isMounted 값을 true로 설정
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handleOnClickPayment = async () => {
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

  // 마운트 되지 않았거나 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isMountedRef.current || !isOpen) return null

  // 모달 컴포넌트
  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-lg max-w-xl w-full mx-auto z-50">
          <div className="p-6">
            <h3 className="font-bold text-lg mb-4">토큰 충전</h3>

            <div className="flex gap-4">
              {/* 토큰 옵션 선택 영역 */}
              <div className="w-2/3 space-y-2 pr-4 max-h-[460px] overflow-y-auto">
                {TOKEN_OPTIONS.map((option) => (
                  <div
                    key={option.orderName}
                    className={`card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors ${
                      selectedOption?.orderName === option.orderName
                        ? "border-2 border-primary"
                        : ""
                    }`}
                    onClick={() => setSelectedOption(option)}
                  >
                    <div className="card-body py-4 px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image
                            src="/images/tokken.png"
                            alt="token"
                            width={20}
                            height={20}
                            className="w-5 h-5"
                          />
                          <span className="font-bold text-lg">
                            {option.tokenAmount.toLocaleString()}
                          </span>
                          <span className="text-error font-semibold text-sm">
                            {option.discount}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₩{option.totalAmount.toLocaleString()}</div>
                          <div className="text-xs line-through text-base-content/50">
                            ₩{option.originalPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 결제 정보 영역 */}
              <div className="w-1/3 space-y-4">
                <div className="bg-base-200 p-4 rounded-lg">
                  <h4 className="font-bold mb-4">결제 정보</h4>
                  {selectedOption ? (
                    <>
                      <div className="flex justify-between mb-2">
                        <span>결제 금액</span>
                        <span className="font-bold">
                          ₩{selectedOption.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-base-content/70">
                        <span>할인 금액</span>
                        <span>
                          ₩
                          {(
                            selectedOption.originalPrice - selectedOption.totalAmount
                          ).toLocaleString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-base-content/70">토큰을 선택해주세요</p>
                  )}
                </div>
                <button
                  className="btn btn-primary w-full"
                  disabled={!selectedOption || processing}
                  onClick={handleOnClickPayment}
                >
                  결제하기
                </button>
                <button className="btn btn-ghost w-full" onClick={onClose}>
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // React Portal을 사용하여 모달을 document.body에 렌더링
  return createPortal(modalContent, document.body)
}
