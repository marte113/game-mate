'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import ReservationModal from '@/app/dashboard/chat/_components/reserveModal/ReservationModal';

interface GameCardProps {
  game: {
    id: string | number;
    title: string;
    name?: string;
    icon?: string;
    image: string;
    price?: number;
  };
  rating: number;
  reviewCount: number;
  isOwner?: boolean;
}

export default function GameCard({ game, rating, reviewCount, isOwner = false }: GameCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="card bg-base-100 shadow-md overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
              <Image
                src={game.icon || game.image}
                alt={game.name || game.title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium">{game.title}</h3>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center gap-0.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-medium">
                    {rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-base-content/60">
                  ({reviewCount})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-3">
            <span className="text-amber-500 font-bold">
              {game.price?.toLocaleString() || "450"}
            </span>
            <span className="text-xs text-base-content/70">
              /판
            </span>
          </div>

          {isOwner ? (
            <button
              className="btn btn-block rounded-full mt-4 bg-black text-white hover:bg-gray-800"
            >
              수정하기
            </button>
          ) : (
            <button
              className="btn btn-primary btn-block rounded-full mt-4"
              onClick={handleOpenModal}
            >
              신청하기
            </button>
          )}
        </div>
      </div>

      {/* 예약 모달 - 각 게임 카드마다 독립적인 모달 */}
      {!isOwner && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          
        />
      )}
    </>
  );
} 