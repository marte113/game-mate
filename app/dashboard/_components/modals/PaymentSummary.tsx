import Image from "next/image"

type TokenOption = {
  orderName: string
  tokenAmount: number
  totalAmount: number
  originalPrice: number
  discount: string
}

type Props = {
  selectedOption: TokenOption | null
}

export default function PaymentSummary({ selectedOption }: Props) {
  return (
    <div className="bg-base-200 p-2 rounded-lg border-t-4 border-t-primary">
      <h4 className="font-bold mb-4 text-center md:text-left">결제 정보</h4>
      {selectedOption ? (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center">
                <Image
                  src="/images/tokken.png"
                  alt="token"
                  width={20}
                  height={20}
                  className="w-4 h-4 md:w-5 md:h-5"
                />
                <span className="font-bold text-base mr-2">
                  {selectedOption.tokenAmount.toLocaleString()}
                </span>
                <span className="text-error font-semibold text-xs">{selectedOption.discount}!</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-bold text-base">결제 금액 : </span>
            <span className="font-bold text-base text-primary">
              ₩{selectedOption.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-base-content/70 text-center py-4">토큰을 선택해주세요</p>
      )}
    </div>
  )
}
