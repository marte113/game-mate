import { X } from "lucide-react";
import Image from "next/image";

interface SelectedGameCardProps {
  selectedGames: number[];
  games: { id: number; title: string; image: string }[];
  setSelectedGames: (games: number[]) => void;
}

export default function SelectedGameCard({ selectedGames, games, setSelectedGames }: SelectedGameCardProps) {
  const handleRemoveGame = (gameId: number) => {
    setSelectedGames(selectedGames.filter((id) => id !== gameId));
  };
  return (
    <div className="grid grid-cols-3 gap-2 my-4">
      {selectedGames.map((gameId) => {
        const game = games.find((g) => g.id === gameId);
        if (!game) return null;
        return (
          <div key={game.id} className="card bg-base-200 relative">
            <div className="card-body p-1">
              <div className="w-full aspect-video relative rounded-lg overflow-hidden mb-1">
                <button className="absolute z-10 top-0 right-0 cursor-pointer" onClick={() => handleRemoveGame(game.id)}>
                  <X className="w-4 h-4 text-yellow-400 hover:text-gray-500 bold" />
                </button>
                <Image
                  src={game.image}
                  alt={game.title}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-xs text-center font-medium">{game.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
