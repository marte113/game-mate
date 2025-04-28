import Image from "next/image";

type FeatureBoxProps = {
  number: string;
  title: string;
  description: string;
};

const FeatureBox = ({ number, title, description }: FeatureBoxProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <span className="text-2xl font-light text-gray-300">{number}</span>
      </div>
    </div>
  );
};

const ExpertSection = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 px-8 py-16">
      {/* Main content with text and video */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Left side - Text content */}
        <div className="flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-6">내게 필요한 모든 메이트</h2>
          <p className="text-lg mb-2">누적 거래 600만 건!</p>
          <p className="text-lg mb-6">
            20여 개의 카테고리와 6만여 개 서비스에서
            <br />
            필요한 모든 메이트분들을 만나보세요.
          </p>
        </div>

        {/* Right side - Video */}
        <div className="aspect-video w-full rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
            title="전문가를 만나다"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </div>

      {/* Three feature boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureBox
          number="01"
          title="빠른 커뮤니케이션"
          description="메이트와 실시간 대화로 빠르게 문의하고 거래할 수 있어요."
        />
        <FeatureBox
          number="02"
          title="메이트 안전결제"
          description="에스크로 결제 시스템으로 소중한 돈을 안전히 보호해 드려요."
        />
        <FeatureBox
          number="03"
          title="만족스러운 결과물"
          description="평균 만족도 98.8% 많은 회원들이 만족하고 있어요."
        />
      </div>
    </section>
  );
};

export default ExpertSection;
