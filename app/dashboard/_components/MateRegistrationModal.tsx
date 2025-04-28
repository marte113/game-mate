"use client";

import { useRef, useEffect } from "react";
import { X } from "lucide-react";

interface MateRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function MateRegistrationModal({
  isOpen,
  onClose,
  onConfirm,
}: MateRegistrationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ESC 키 누를 때 모달 닫기
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-base-100 rounded-lg shadow-xl w-full max-w-md p-6 relative"
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 모달 제목 */}
        <h3 className="text-xl font-bold mb-4">메이트 등록</h3>

        {/* 모달 내용 */}
        <div className="mb-6">
          <p className="text-center text-gray-700 mb-2 px-4">
            메이트로 등록하실 경우 외부 사용자에게 사용자님의 프로필이 검색되며
            다른 사용자들이 게임 파트너로 당신을 찾을 수 있습니다.
          </p>
         
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-center gap-4">
          <button onClick={onClose} className="btn btn-outline">
            취소
          </button>
          <button onClick={onConfirm} className="btn btn-primary px-2">
            메이트 등록
          </button>
        </div>
      </div>
    </div>
  );
}
