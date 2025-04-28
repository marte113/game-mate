import { Plus, Check, ChevronDown } from "lucide-react";
import Image from "next/image";

interface Game {
    id: number;
    title: string;
    image: string;
}

interface SelectedGameDropDownProps {
    selectedGames: number[];
    games: Game[];
    setSelectedGames: (games: number[]) => void;
  }
  

export default function SelectedGameDropDown({games, selectedGames, setSelectedGames}: SelectedGameDropDownProps) {
    return (
        <details className="dropdown w-full">
                <summary className="flex items-center justify-between w-full px-4 py-3 bg-base-100 hover:bg-black hover:text-white rounded-lg cursor-pointer border border-base-300 transition-colors">
                  <div className="flex items-center">
                    <Plus className="w-5 h-5" />
                    <span>&nbsp;게임 추가하기</span>
                  </div>
                  <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="dropdown-content bg-gray-100 rounded-b-md w-full p-4 shadow-2xl">
                  <div className="grid grid-cols-3 gap-3">
                    {games.map((game) => (
                      <div
                        key={game.id}
                        className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer group ${
                          selectedGames.includes(game.id) ? 'ring-2 ring-yellow-400' : ''
                        }`}
                        onClick={() => {
                          setSelectedGames(prev =>
                            prev.includes(game.id)
                              ? prev.filter(id => id !== game.id)
                              : [...prev, game.id]
                          );
                        }}
                      >
                        <Image
                          src={game.image}
                          alt={game.title}
                          fill
                          className="object-cover"
                        />
                        {selectedGames.includes(game.id) && (
                          <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <span className="text-white text-sm font-medium">{game.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
    )
}
