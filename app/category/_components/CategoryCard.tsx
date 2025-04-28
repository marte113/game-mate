import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  genre: string[];
  image_url: string;
}

// const mockData: CategoryCardProps[] = [
//   {
//     id: "1",
//     name: "리그 오브 레전드",
//     genre: ["AOS", "MOBA", ""],
//     description:
//       "리그오브레전드는 5명의 플레이어가 팀을 이루어 상대와 대전하는 세계적인 AOS 게임입니다.",
//     image_url: "/images/lol2.webp",
//   },
//   {
//     id: "2",
//     name: "League_of_Legends",
//     genre: ["AOS", "MOBA", ""],
//     description:
//       "리그오브레전드는 5명의 플레이어가 팀을 이루어 상대와 대전하는 세계적인 AOS 게임입니다.",
//     image_url: "/images/lol2.webp",
//   },
//   {
//     id: "1",
//     name: "League_of_Legends",
//     genre: ["AOS", "MOBA", ""],
//     description:
//       "리그오브레전드는 5명의 플레이어가 팀을 이루어 상대와 대전하는 세계적인 AOS 게임입니다.",
//     image_url: "/images/lol2.webp",
//   },
//   {
//     id: "1",
//     name: "League_of_Legends",
//     genre: ["AOS", "MOBA", ""],
//     description:
//       "리그오브레전드는 5명의 플레이어가 팀을 이루어 상대와 대전하는 세계적인 AOS 게임입니다.",
//     image_url: "/images/lol2.webp",
//   },
//   {
//     id: "1",
//     name: "League_of_Legends",
//     genre: ["AOS", "MOBA", ""],
//     description:
//       "리그오브레전드는 5명의 플레이어가 팀을 이루어 상대와 대전하는 세계적인 AOS 게임입니다.",
//     image_url: "/images/lol2.webp",
//   },
//   {
//     id: "1",
//     name: "League_of_Legends",
//     genre: ["AOS", "MOBA", ""],
//     description:
//       "리그오브레전드는 5명의 플레이어가 팀을 이루어 상대와 대전하는 세계적인 AOS 게임입니다.",
//     image_url: "/images/lol2.webp",
//   },
// ];

export default function CategoryCard({
  name,
  genre,
  image_url,
  description,
}: CategoryCardProps) {
  return (
    <li className="card bg-base-100 shadow-md overflow-hidden">
      <Link href={`/category/${name}`}>
        <div className="relative aspect-[10/12] overflow-hidden">
          <Image src={image_url} alt={description} fill className="object-fill" />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-bold truncate">{description}</h3>
          <div className="flex gap-1.5 pt-1">
            {genre.map((g) => (
              <p
                key={g}
                className="text-xs text-gray-500 truncate rounded-xl bg-gray-100 p-1 border border-gray-200"
              >
                {g}
              </p>
            ))}
          </div>
        </div>
      </Link>   
    </li>
  );
}
