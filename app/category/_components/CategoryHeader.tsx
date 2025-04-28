import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { fetchGameHeader } from "../_api/CategoryApi";
import { useParams } from "next/navigation";

export default function CategoryHeader() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const {
    data: gameHeader,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["gameHeader", categoryId],
    queryFn: () => fetchGameHeader(categoryId),
  });

  if (isLoading) {
    return <CategoryHeaderSkeleton />;
  }

  if (error) {
    // TODO: Implement a more user-friendly error display
    return <div>Error loading category header.</div>;
  }

  if (!gameHeader) {
    // This case might happen if the API returns null or an empty object successfully
    // Or if the data is somehow invalid after loading
    return <div>Category data not found.</div>; // Or render nothing, or a specific message
  }

  return (
    <div className="flex items-start p-4 border-b border-gray-100">
      {gameHeader.image_url && (
        <Image
          src={gameHeader.image_url}
          alt="Category Header"
          width={135}
          height={180}
          className="rounded-md"
        />
      )}
      <div className="m-4">
        <p className="text-4xl font-bold">{gameHeader.description}</p>
        <ul className="flex gap-2 py-2">
          {gameHeader.genre.map((genre) => (
            <li key={genre} className="text-xs text-gray-500 border border-gray-200 rounded-md px-1">
              {genre}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CategoryHeaderSkeleton() {
  return (
    <div className="flex animate-pulse items-center p-4 border-b border-gray-950">
      <div className="w-[135px] h-[180px] bg-gray-300 rounded" />
      <div className="ml-4 flex-1 space-y-4 py-1">
        <div className="h-6 bg-gray-300 rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-300 rounded w-16" />
          <div className="h-6 bg-gray-300 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
