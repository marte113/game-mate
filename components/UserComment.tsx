import Image from "next/image";

const avatars = [
  {
    alt: "User profile",
    src: "https://plus.unsplash.com/premium_photo-1667520519383-37b138a2b72c?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    alt: "User profile",
    src: "https://images.unsplash.com/photo-1636487658586-2e83d26f5e8c?q=80&w=1772&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    alt: "User profile",
    src: "https://plus.unsplash.com/premium_photo-1678112180514-478cd1218101?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    alt: "User profile",
    src: "https://plus.unsplash.com/premium_photo-1683749808421-bf411cb88f20?q=80&w=1713&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    alt: "User profile",
    src: "https://images.unsplash.com/photo-1667023072347-973fba93805b?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"  },
  {
    alt: "User profile",
    src: "https://images.unsplash.com/photo-1649459666115-029794bc4095?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    alt: "User profile",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
  },
  {
    alt: "User profile",
    src: "https://plus.unsplash.com/premium_photo-1667518352065-cd4835cbe7b8?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const UserComment = ({ priority = false }) => {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-3">
      {/* AVATARS */}
      <div className={`-space-x-5 avatar-group justy-start`}>
        {avatars.map((image, i) => (
          <div className="avatar w-12 h-12" key={i}>
            <Image
              src={image.src}
              alt={image.alt}
              priority={priority}
              width={50}
              height={50}
            />
          </div>
        ))}
      </div>

      {/* RATING */}
      <div className="flex flex-col justify-center items-center md:items-start gap-1">
        <div className="rating rating-md">
          {/* 5개의 별 svg를 반복문으로 출력 */}
          {[...Array(5)].map((_, i) => (
            // 별 아이콘
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 fill-current text-yellow-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 0l2.245 6.892h7.255l-5.878 4.275 2.245 6.892L10 13.783 3.133 18.06l2.245-6.892-5.878-4.275h7.255L10 0z"
              />
            </svg>
          ))}
        </div>
        <div className="text-base text-base-content/80 flex flex-col items-center md:items-start">
        <span>게이머 만족도 리뷰!</span>
          
          <span className="font-semibold text-base-content">현재 1500개</span>
        </div>
      </div>
    </div>
  );
};

export default UserComment;
