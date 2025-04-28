"use client";

import HeroCenterSection from "@/components/HeroCenterSection";
import ProblemSection from "@/components/ProblemSection";
import FeaturesAccordionSection from "@/components/FeaturesAccordionSection";
import Footer from "@/components/Footer";
import ProgressBar from "@/components/ProgressBar";
import { AutoToast } from "@/components/AutoToast";

export default function Intro() {
    return <>
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
}