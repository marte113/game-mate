"use client"

import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import usePayment from "@/hooks/payment/usePayment"
import TokenOptionCard from "./TokenOptionCard"
import PaymentSummary from "./PaymentSummary"
import PaymentActions from "./PaymentActions"

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
  const { processing, processPayment } = usePayment()
  const isMountedRef = useRef<boolean>(false)

  // 컴포넌트가 마운트된 후 isMounted 값을 true로 설정
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handleOnClickPayment = async () => {
    if (!selectedOption) return
    await processPayment(selectedOption)
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

        <div className="relative bg-white rounded-lg max-w-xl w-full mx-4 md:mx-auto z-50">
          <div className="p-4 md:p-6">
            <h3 className="font-bold text-lg mb-4 text-center">토큰 충전</h3>

            {/* 모바일: 세로 배치, 데스크톱: 좌우 배치 */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* 토큰 옵션 선택 영역 */}
              <div className="w-full md:w-2/3 space-y-2 md:pr-4 max-h-[400px] md:max-h-[460px] overflow-y-auto">
                {TOKEN_OPTIONS.map((option) => (
                  <TokenOptionCard
                    key={option.orderName}
                    option={option}
                    isSelected={selectedOption?.orderName === option.orderName}
                    onSelect={setSelectedOption}
                  />
                ))}
              </div>

              {/* 결제 정보 및 버튼 영역 */}
              <div className="w-full md:w-1/3 space-y-4">
                <PaymentSummary selectedOption={selectedOption} />
                <PaymentActions
                  selectedOption={selectedOption}
                  processing={processing}
                  onPayment={handleOnClickPayment}
                  onClose={onClose}
                />
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
