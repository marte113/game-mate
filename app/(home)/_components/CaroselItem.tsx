import Image from "next/image"

type Props = {
  src: string
  alt: string
}

export default function CaroselItem({ src, alt }: Props) {
  return (
    <div className="carousel-item w-[300px] hover:scale-105 transition-transform duration-200">
      <div className="relative aspect-[3/4] w-full rounded-box overflow-hidden">
        <Image src={src} alt={alt} fill sizes="300px" className="object-cover" priority />
      </div>
    </div>
  )
}
