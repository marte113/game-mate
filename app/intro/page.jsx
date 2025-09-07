"use client"

import HeroCenterSection from "@/app/(home)/_components/HeroCenterSection"
import ProblemSection from "@/app/(home)/_components/ProblemSection"
import FeaturesAccordionSection from "@/app/(home)/_components/FeaturesAccordionSection"
import Footer from "@/components/layout/Footer"
import ProgressBar from "@/components/ui/ProgressBar"
import { AutoToast } from "@/components/feedback/AutoToast"

export default function Intro() {
  return (
    <>
      {/* main 태그 안에 컴포넌트를 추가해주세요. */}
      <main>
        <AutoToast />
        <ProgressBar />
        <HeroCenterSection />
        <ProblemSection />
        <FeaturesAccordionSection />
      </main>
      <Footer />
    </>
  )
}
