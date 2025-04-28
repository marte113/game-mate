'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Plus, X, ChevronDown, Check } from 'lucide-react';
import { useFormContext, Controller, ControllerRenderProps } from 'react-hook-form';

import { ProfileDataSchema } from '@/libs/schemas/profile.schema';


// TODO: Move games data to a constants file or fetch from API
const games = [
  { id: 1, title: "리그 오브 레전드", image: "/images/lol.webp" },
  { id: 2, title: "오버워치", image: "/images/overwatch.jpg" },
  { id: 3, title: "발로란트", image: "/images/valrorant.webp" },
  { id: 4, title: "이터널리턴", image: "/images/eternalreturn.jpg" },
  { id: 5, title: "피파온라인4", image: "/images/fifaonline4.webp" },
  { id: 6, title: "TFT", image: "/images/teamfight.avif" },
];

// Define props including the 'name' for react-hook-form field identification
interface GameSelectionCardProps {
  name: keyof ProfileDataSchema;
}

// Use React.memo for potential performance optimization if props are stable
const GameSelectionCard = React.memo(({ name }: GameSelectionCardProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { control, getValues, setValue, formState: { errors } } = useFormContext<ProfileDataSchema>();
  const fieldError = errors[name]?.message;

  // Helper to get game info remains the same
  const getSelectedGameInfo = (gameTitle: string) => {
    return games.find(game => game.title === gameTitle);
  };

  // Update form state when toggling game selection (wrapped with useCallback)
  const toggleGameSelection = useCallback((gameTitle: string) => {
    const currentSelection = (getValues(name) as string[] | undefined) ?? [];
    let newSelection: string[];
    if (currentSelection.includes(gameTitle)) {
      newSelection = currentSelection.filter(title => title !== gameTitle);
    } else {
      newSelection = [...currentSelection, gameTitle];
    }
    // Added name to dependencies as it's used in setValue/getValues
    setValue(name, newSelection, { shouldValidate: true, shouldDirty: true });
  }, [getValues, setValue, name]); // Add dependencies

  // Update form state when removing a game (wrapped with useCallback)
  const removeGame = useCallback((gameTitle: string) => {
    const currentSelection = (getValues(name) as string[] | undefined) ?? [];
    const newSelection = currentSelection.filter(title => title !== gameTitle);
    // Added name to dependencies as it's used in setValue/getValues
    setValue(name, newSelection, { shouldValidate: true, shouldDirty: true });
  }, [getValues, setValue, name]); // Add dependencies

  return (
    <div className="form-control mt-4">
      <label className="label">
        <span className="label-text">게임 카테고리</span>
        {fieldError && <span className="label-text-alt text-error">{fieldError}</span>}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field }: { field: ControllerRenderProps<ProfileDataSchema, typeof name> }) => {
          const selectedGamesValue = (field.value as string[] | undefined) ?? [];

          return (
            <>
              <div className="grid grid-cols-3 gap-2 my-4">
                {selectedGamesValue.map((gameTitle: string) => {
                  const game = getSelectedGameInfo(gameTitle);
                  if (!game) return null;
                  return (
                    <div key={game.id} className="card bg-base-200 relative">
                      <div className="card-body p-3">
                        <div className="w-full aspect-video relative rounded-lg overflow-hidden mb-2">
                          <Image src={game.image} alt={game.title} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGame(game.title)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-base-100/80 hover:bg-error/80 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-center font-medium">{game.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <details
                className="dropdown w-full"
                open={isDropdownOpen}
                onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <summary className="flex items-center justify-between w-full px-4 py-3 bg-base-100 hover:bg-black hover:text-white rounded-lg cursor-pointer border border-base-300 transition-colors">
                  <div className="flex items-center">
                    <Plus className="w-5 h-5" />
                    <span>&nbsp;게임 추가하기</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </summary>
                <div className="dropdown-content bg-gray-100 rounded-b-md w-full p-4 shadow-2xl z-10">
                  <div className="grid grid-cols-3 gap-3">
                    {games.map((game) => (
                      <div
                        key={game.id}
                        className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer group ${
                          selectedGamesValue.includes(game.title) ? 'ring-2 ring-yellow-400' : ''
                        }`}
                        onClick={() => toggleGameSelection(game.title)}
                      >
                        <Image
                          src={game.image}
                          alt={game.title}
                          fill
                          className="object-cover"
                        />
                        {selectedGamesValue.includes(game.title) && (
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
            </>
          );
        }}
      />
    </div>
  );
});

GameSelectionCard.displayName = 'GameSelectionCard';

export default GameSelectionCard; 