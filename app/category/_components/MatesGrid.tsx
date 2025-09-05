"use client"

import { memo } from "react"

import { useMates } from "../_context/MatesContexts"

import { MateCard } from "./MateCard"

function MatesGridInner() {
  const { mates } = useMates()

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {mates.map((mate) => (
        <MateCard key={mate.id} mate={mate} />
      ))}
    </div>
  )
}

const MatesGrid = memo(MatesGridInner)
export default MatesGrid
