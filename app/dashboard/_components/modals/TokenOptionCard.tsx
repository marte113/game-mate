import Image from "next/image"

type TokenOption = {
  orderName: string
  tokenAmount: number
  totalAmount: number
  originalPrice: number
  discount: string
}

type Props = {
  option: TokenOption
  isSelected: boolean
  onSelect: (option: TokenOption) => void
}

export default function TokenOptionCard({ option, isSelected, onSelect }: Props) {
  return (
    <div
      className={`card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors ${
        isSelected ? "border-2 border-primary" : ""
      }`}
      onClick={() => onSelect(option)}
    >
      <div className="card-body py-3 px-4 md:py-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/images/tokken.png"
              alt="token"
              width={20}
              height={20}
              className="w-4 h-4 md:w-5 md:h-5"
            />
            <span className="font-bold text-base md:text-lg">
              {option.tokenAmount.toLocaleString()}
            </span>
            <span className="text-error font-semibold text-xs md:text-sm">{option.discount}</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-sm md:text-base">
              ₩{option.totalAmount.toLocaleString()}
            </div>
            <div className="text-xs line-through text-base-content/50">
              ₩{option.originalPrice.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
