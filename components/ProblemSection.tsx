import { ArrowDown } from "lucide-react";

const Arrow = ({ extraStyle }) => {
  return (
    <ArrowDown
      className={`shrink-0 w-12 stroke-neutral-content opacity-70 ${extraStyle}`}
    />
  );
};

const Step = ({ emoji, text }) => {
  return (
    <div className="w-full md:w-48 flex flex-col gap-2 items-center justify-center">
      <span className="text-4xl">{emoji}</span>
      <h3 className="font-bold">{text}</h3>
    </div>
  );
};

// 이 상품이 고객의 어떤 문제를 해결하는지 구체적으로 설명해주세요.
const Problem = () => {
  return (
    <section className="bg-base-content text-neutral-content">
      <div className="max-w-7xl mx-auto px-8 py-16 md:py-32 text-center">
        <h2 className="max-w-3xl mx-auto font-extrabold text-3xl md:text-4xl tracking-tight mb-6 md:mb-8">
        🎮 게임 메이트 없이 지루한 플레이, 이제 그만!
        </h2>
        <p className="max-w-xl mx-auto text-lg opacity-90 leading-relaxed mb-12 md:mb-20">
        게임을 함께할 친구를 찾기 어렵고, 혼자 플레이하다 금방 지루하고, 즐거움보다 스트레스가 쌓이곤 합니다.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-6">
          <Step emoji="🧑‍💻" text="혼자서 게임 시작했는데 팀원은 랜덤 매칭..." />

          <Arrow extraStyle="max-md:-scale-x-100 md:-rotate-90" />

          <Step emoji="😮‍💨" text="같이 할 친구를 찾느라 커뮤니티에서 헤매는 시간 소모" />

          <Arrow extraStyle="md:-scale-x-100 md:-rotate-90" />

          <Step
            emoji="😔"
            text="실력 차이 나는 팀원 때문에 제대로 즐기지도 못하고 패배?"
          />
        </div>
      </div>
    </section>
  );
};

export default Problem;
