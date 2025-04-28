"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { AtSign, CreditCard, UserCircle2, Paintbrush } from "lucide-react";
import CaroselItem from "./CaroselItem";
import ExpertSection from "./ExpertSection";

// 기능 배열은 아코디언에 표시될 기능 목록입니다.
// - title: 기능의 제목
// - description: 기능에 대한 설명(클릭 시)
// - type: 미디어 유형(비디오 또는 이미지)
// - path: 미디어 경로(더 나은 SEO를 위해 로컬 경로를 사용해 보세요)
// - format: 미디어의 형식(유형이 '비디오'인 경우)
// - alt: 이미지의 대체 텍스트(유형이 'image'인 경우)
const features = [
  {
    title: "신뢰할 수 있는 리뷰!",
    description:
      "실제 게임을 함께 한 유저들의 솔직한 리뷰를 확인할 수 있습니다. 모든 리뷰는 실제 게임 매칭 후에만 작성 가능하여 신뢰도가 높습니다. 다른 유저들의 평가를 통해 나에게 맞는 게임 메이트를 찾아보세요.",
    type: "image",
    path: "/feature-accordion/supabase-logo-light.png",
    format: "image",
    alt: "Supabase Logo",
    svg: <AtSign className="w-6 h-6" />,
  },
  {
    title: "게이머",
    description:
      "다양한 게임을 즐기는 게이머들이 모여 있습니다. 리그 오브 레전드, 오버워치, 발로란트 등 인기 게임부터 다양한 장르의 게임까지 함께할 메이트를 찾을 수 있습니다. 자신의 게임 스타일과 실력에 맞는 파트너를 만나보세요.",
    type: "image",
    path: "/feature-accordion/tosspayments-logo.png",
    format: "image",
    alt: "tosspayments-logo",
    svg: <CreditCard className="w-6 h-6" />,
  },
  {
    title: "메이트",
    description:
      "검증된 게임 메이트들이 여러분을 기다리고 있습니다. 메이트로 등록된 유저들은 프로필 인증과 평점 시스템을 통해 신뢰성이 검증되었습니다. 원하는 시간에 함께 게임할 수 있는 메이트를 찾아 더 즐거운 게임 경험을 만들어보세요.",
    type: "image",
    path: "/feature-accordion/login.png",
    format: "image",
    alt: "login feature image",
    svg: <UserCircle2 className="w-6 h-6" />,
  },
  {
    title: "신규 회원 이벤트",
    description:
      "지금 가입하시면 다양한 혜택을 드립니다! 신규 회원을 위한 특별 토큰 지급, 프리미엄 메이트와의 첫 게임 할인, 프로필 커스터마이징 특별 옵션 등 다양한 혜택을 놓치지 마세요. 한정된 기간 동안만 제공되는 특별한 기회입니다.",
    type: "image",
    path: "/feature-accordion/component.png",
    format: "image",
    alt: "component example image",
    svg: <Paintbrush className="w-6 h-6" />,
  },
];

// An SEO-friendly accordion component including the title and a description (when clicked.)
const Item = ({ feature, isOpen, setFeatureSelected }) => {
  const accordion = useRef(null);
  const { title, description, svg } = feature;

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-medium text-left md:text-lg"
        onClick={(e) => {
          e.preventDefault();
          setFeatureSelected();
        }}
        aria-expanded={isOpen}
      >
        <span className={`duration-100 ${isOpen ? "text-primary" : ""}`}>
          {svg}
        </span>
        <span
          className={`flex-1 text-base-content ${
            isOpen ? "text-primary font-semibold" : ""
          }`}
        >
          <h3 className="inline">{title}</h3>
        </span>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out text-base-content-secondary overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{description}</div>
      </div>
    </li>
  );
};

// A component to display the media (video or image) of the feature. If the type is not specified, it will display an empty div.
// Video are set to autoplay for best UX.
const Media = ({ feature }) => {
  const { type, path, format, alt } = feature;
  const style = "rounded-2xl aspect-square w-full sm:w-[26rem]";
  const size = {
    width: 500,
    height: 500,
  };

  if (type === "video") {
    return (
      <video
        className={style}
        autoPlay
        muted
        loop
        playsInline
        controls
        width={size.width}
        height={size.height}
      >
        <source src={path} type={format} />
      </video>
    );
  } else if (type === "image") {
    return (
      <div className="flex justify-center border rounded-2xl p-4 object-contain object-center">
        <Image
          src={path}
          alt={alt}
          className={`${style} object-contain object-center`}
          width={size.width}
          height={size.height}
        />
      </div>
    );
  } else {
    return <div className={`${style} !border-none`}></div>;
  }
};

// A component to display 2 to 5 features in an accordion.
// By default, the first feature is selected. When a feature is clicked, the others are closed.
const FeaturesAccordion = () => {
  const [featureSelected, setFeatureSelected] = useState(0);

  return (
    <section
      className="py-24 md:py-32 space-y-24 md:space-y-32 max-w-7xl mx-auto bg-base-100 "
      id="features"
    >
      <div className="px-8">
        <h2 className="font-extrabold text-4xl lg:text-6xl tracking-tight mb-8 md:mb-18">
          게임 메이트는 여러분을 기다리고 있습니다.
          <span className="bg-neutral text-neutral-content px-2 md:px-4 ml-1 md:ml-1.5 leading-relaxed whitespace-nowrap">
            함께 해요!
          </span>
        </h2>

        <ExpertSection />

        <div className="carousel carousel-center gap-3 p-4 rounded-box max-w-full overflow-x-auto">
          <CaroselItem src="/images/lol2.webp" alt="League of Legends" />
          <CaroselItem src="/images/valrorant.webp" alt="Valrorant" />
          <CaroselItem src="/images/tft.jpg" alt="TFT" />
          <CaroselItem src="/images/eternalreturn.jpg" alt="Eternal Return" />
          <CaroselItem src="/images/bg.jpg" alt="Battle Ground" />
        </div>

        <div className=" flex flex-col md:flex-row gap-12 md:gap-24">
          <div className="grid grid-cols-1 items-stretch gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20">
            <ul className="w-full">
              {features.map((feature, i) => (
                <Item
                  key={feature.title}
                  index={i}
                  feature={feature}
                  isOpen={featureSelected === i}
                  setFeatureSelected={() => setFeatureSelected(i)}
                />
              ))}
            </ul>

            <Media feature={features[featureSelected]} key={featureSelected} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesAccordion;
