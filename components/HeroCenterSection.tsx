import UserComment from "./UserComment";

const HeroCenterSection = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 flex flex-col items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20">
     
      <div className="flex flex-col gap-10 lg:gap-10 items-center justify-center text-center lg:max-w-[70%]">
        <h1 className="font-jalnanGothic font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
          재밌게 같이 게임하자!
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          게임 실력도 UP, 재미도 UP! 믿을 수 있는 메이트와 함께하세요.
        </p>
        <button className="btn btn-primary rounded-3xl shadow-xl">
          게임 메이트와 함께하기
        </button>

        <UserComment priority={true} />
      </div>
    </section>
  );
};

export default HeroCenterSection;
