"use client";

import { useState, useEffect, ChangeEvent, MouseEvent } from "react";
import { X, Star, StarHalf } from "lucide-react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewApi } from "@/app/dashboard/_api/reviewApi";
import { useTaskStore } from "../store/useTaskStore";
import { useAuthStore } from "@/stores/authStore";

// 별점 텍스트 데이터 (기존 정의 사용)
const StarRatingTexts = [
  { rating: 1, text: "형편없음, 기대와 동떨어짐" },
  { rating: 1.5, text: "형편없음/미흡함" },
  { rating: 2, text: "미흡함, 꽤 실망함" },
  { rating: 2.5, text: "미흡함, 보통" },
  { rating: 3, text: "보통, 개선이 필요함" },
  { rating: 3.5, text: "보통, 좋음" },
  { rating: 4, text: "좋음, 기대에 부흥함" },
  { rating: 4.5, text: "좋음, 우수" },
  { rating: 5, text: "우수, 기대를 넘어섬" },
];

export default function ReviewModal() {
  // 스토어에서 직접 상태, 액션, 사용자 정보 가져오기
  const isOpen = useTaskStore((state) => state.reviewModal.isOpen);
  const task = useTaskStore((state) => state.reviewModal.task);
  const closeModal = useTaskStore((state) => state.closeReviewModal);
  const user = useAuthStore((state) => state.user);

  const [phase, setPhase] = useState<number>(1);
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [content, setContent] = useState<string>("");
  const queryClient = useQueryClient();

  // 스토어에서 가져온 값 사용 (기존 prop 이름에 맞춤)
  const requestId = task?.id;
  const reviewedId = task?.provider_id;
  const reviewedName = task?.provider?.name || "메이트";
  const reviewerName = user?.name || "나";
  const reviewerImg = user?.profile_circle_img;

  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setPhase(1);
      setRating(null);
      setHoverRating(null);
      setContent("");
    }
  }, [isOpen]);

  // 별점 텍스트 찾기
  const getRatingText = (currentRating: number | null): string => {
    if (currentRating === null) return "평점 선택";
    // 0.5 단위 가장 가까운 텍스트 찾기 (간단 구현)
    const closest = StarRatingTexts.reduce((prev, curr) =>
      Math.abs(curr.rating - currentRating) <
      Math.abs(prev.rating - currentRating)
        ? curr
        : prev
    );
    return closest.text;
  };

  const currentRating = hoverRating ?? rating; // 현재 표시될 별점 (호버 우선)

  // --- 별점 이벤트 핸들러 (0.5 단위 처리) ---
  const handleStarMouseEnter = (value: number) => {
    setHoverRating(value);
  };

  const handleStarMouseLeave = () => {
    setHoverRating(null);
  };

  const handleStarClick = (value: number) => {
    setRating(value);
    setHoverRating(null); // 클릭 후 호버 상태 초기화
  };
  // --- ---

  // 다음 페이즈 이동
  const handleNextPhase = () => {
    if (phase === 1 && rating === null) {
      alert("별점을 선택해주세요.");
      return;
    }
    if (phase < 3) {
      setPhase(phase + 1);
    } else {
      // Phase 3: 저장 및 종료 로직 (API 호출)
      handleSubmitReview();
    }
  };

  // 이전 페이즈 이동
  const handlePrevPhase = () => {
    if (phase > 1) {
      setPhase(phase - 1);
    }
  };

  // --- 리뷰 생성 뮤테이션 (onClose 대신 closeModal 사용) ---
  const createReviewMutation = useMutation({
    mutationFn: reviewApi.createReview,
    onSuccess: (data) => {
      console.log("Review created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["requestedOrders"] });
      alert("리뷰가 성공적으로 등록되었습니다.");
      closeModal(); // 스토어의 closeModal 사용
    },
    onError: (error) => {
      console.error("Error creating review:", error);
      alert(`리뷰 등록 중 오류 발생: ${error.message}`);
    },
  });
  // --- ---

  // 리뷰 제출 핸들러 수정 (스토어에서 가져온 값 사용)
  const handleSubmitReview = () => {
    if (rating === null || !requestId || !reviewedId) {
      alert("리뷰 정보가 올바르지 않습니다. 다시 시도해주세요."); // 필요한 정보 확인
      return;
    }

    const reviewData = {
      rating: rating,
      content: content || "후기를 작성하지 않았습니다", // 빈 내용 처리
      requestId: requestId,
      reviewedId: reviewedId,
    };
    console.log("Attempting to submit review:", reviewData);
    createReviewMutation.mutate(reviewData); // 뮤테이션 실행
  };

  // --- 별 아이콘 렌더링 함수 ---
  const renderStarIcon = (index: number, ratingValue: number | null) => {
    const value = ratingValue ?? 0;
    if (value >= index + 1) {
      // 꽉 찬 별
      return <Star className="w-full h-full text-amber-400 fill-amber-400" />;
    } else if (value >= index + 0.5) {
      // 반 별
      return (
        <StarHalf className="w-full h-full text-amber-400 fill-amber-400" />
      );
    } else {
      // 빈 별
      return <Star className="w-full h-full text-gray-300" />;
    }
  };
  // --- ---

  // 모달 컨텐츠 렌더링
  const renderPhaseContent = () => {
    switch (phase) {
      case 1: // 별점 선택
        return (
          <>
            <h3 className="text-lg font-bold mb-2 text-center">
              {reviewedName}님을 어떻게 평가하시겠어요?
            </h3>
            <p className="text-center text-sm text-base-content/60 mb-4 min-h-[20px]">
              {getRatingText(currentRating)}
            </p>
            {/* 0.5 단위 별점 입력 UI */}
            <div
              className="flex justify-center items-center space-x-1 mb-6"
              onMouseLeave={handleStarMouseLeave} // 컨테이너 벗어나면 호버 해제
            >
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="relative w-8 h-8 cursor-pointer">
                  {/* 투명한 왼쪽 절반 영역 (0.5점) */}
                  <div
                    className="absolute top-0 left-0 w-1/2 h-full z-10"
                    onMouseEnter={() => handleStarMouseEnter(index + 0.5)}
                    onClick={() => handleStarClick(index + 0.5)}
                  ></div>
                  {/* 투명한 오른쪽 절반 영역 (1.0점) */}
                  <div
                    className="absolute top-0 right-0 w-1/2 h-full z-10"
                    onMouseEnter={() => handleStarMouseEnter(index + 1)}
                    onClick={() => handleStarClick(index + 1)}
                  ></div>
                  {/* 실제 보이는 별 아이콘 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {renderStarIcon(index, currentRating)}
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case 2: // 리뷰 내용 작성
        return (
          <>
            <h3 className="text-lg font-bold mb-2 text-center">
              이러한 평점을 남긴 이유를 알려주세요.
            </h3>
            {/* 선택된 별점 표시 (0.5 단위) */}
            <div className="flex justify-center items-center space-x-1 mb-1">
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="relative w-5 h-5">
                  {" "}
                  {/* 크기 조정 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {renderStarIcon(index, rating)}{" "}
                    {/* 클릭된 rating 값으로 표시 */}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-base-content/60 mb-4 min-h-[20px]">
              {getRatingText(rating)}
            </p>
            <textarea
              className="textarea textarea-bordered w-full h-32 resize-none"
              placeholder="개인적인 경험을 공유해주세요. (선택 사항)"
              value={content}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setContent(e.target.value)
              }
            ></textarea>
          </>
        );
      case 3: // 미리보기 및 제출
        return (
          <>
            <h3 className="text-lg font-bold mb-4 text-center">
              커뮤니티를 도와주셔서 감사합니다!
            </h3>
            <p className="text-center text-sm text-base-content/80 mb-6">
              귀하의 후기가 곧 공개될 예정입니다.
            </p>
            <div className="border p-4 rounded-lg bg-base-200">
              <p className="text-sm font-medium text-base-content/70 mb-3">
                작성된 후기 미리보기:
              </p>
              <div className="flex gap-4">
                <div>
                  <div className="w-4 h-4 rounded-full">
                    <img
                      src={
                        reviewerImg ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${reviewerName}`
                      }
                      alt={reviewerName}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{reviewerName}</span>
                  </div>
                  <div className="flex gap-1 items-center mb-2">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <div key={index} className="relative w-4 h-4">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {renderStarIcon(index, rating)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-base-content/90">
                    {content || "(후기를 작성하지 않았습니다.)"}
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // isOpen이 false거나 task/user 정보가 없으면 null 반환 (안전장치)
  if (!isOpen || !task || !user) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box relative">
        {/* 닫기 버튼 (onClose 대신 closeModal 사용) */}
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={closeModal}
        >
          <X size={20} />
        </button>

        {/* 페이즈 컨텐츠 */}
        <div className="py-4">{renderPhaseContent()}</div>

        {/* 네비게이션 버튼 */}
        <div className="modal-action mt-6">
          {phase > 1 && (
            <button className="btn" onClick={handlePrevPhase}>
              뒤로
            </button>
          )}
          <button
            className={`btn btn-primary ${
              phase === 1 && rating === null ? "btn-disabled" : ""
            }`}
            onClick={handleNextPhase}
            disabled={phase === 1 && rating === null}
          >
            {phase === 3 ? "저장 및 종료" : "다음"}
          </button>
        </div>
      </div>
      {/* 배경 클릭 시 닫기 (closeModal 사용) */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal}>close</button>
      </form>
    </div>
  );
}
