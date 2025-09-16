import HeaderLeft from "./header/HeaderLeft"
import HeaderRight from "./header/HeaderRight"

export default function Header() {
  return (
    <div className="w-full md:w-[calc(100%-16rem)] md:ml-64 min-w-0 sticky top-0 z-50 flex items-center justify-between gap-4 h-14 px-2 border-b border-gray-300 bg-base-100 overflow-x-hidden">
      <HeaderLeft />
      <HeaderRight />
    </div>
  )
}
