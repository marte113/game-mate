type TokenOption = {
  orderName: string
  tokenAmount: number
  totalAmount: number
  originalPrice: number
  discount: string
}

type Props = {
  selectedOption: TokenOption | null
  processing: boolean
  onPayment: () => void
  onClose: () => void
}

export default function PaymentActions({ selectedOption, processing, onPayment, onClose }: Props) {
  return (
    <div className="space-y-2">
      <button
        className="btn btn-primary w-full h-12 text-base font-semibold"
        disabled={!selectedOption || processing}
        onClick={onPayment}
      >
        {processing ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            처리 중...
          </>
        ) : (
          "결제하기"
        )}
      </button>
      <button className="btn btn-outline w-full h-12" onClick={onClose} disabled={processing}>
        취소
      </button>
    </div>
  )
}
