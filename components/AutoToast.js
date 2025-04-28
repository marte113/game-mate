"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

const messages = [
  "해당 페이지에 오신 걸 환영합니다! 🎉",
  "현재 127명이 구매를 고려중입니다 💭",
  "지금 238명이 이 페이지를 보고 있습니다 👀",
  "오늘 하루 32명이 구매했습니다 🎈",
];

export function AutoToast() {
  // 자동 토스트 메시지 표시
  // - 사용자 활동 알림
  // - 실시간 상태 업데이트
  // - 랜덤 타이밍 메시지

  useEffect(() => {
    let timer;
    // 사용 가능한 메시지 인덱스 배열 (0번은 제외하고 시작)
    const availableIndices = Array.from(
      { length: messages.length - 1 },
      (_, i) => i + 1
    );

    // 첫 번째 메시지 표시 (2초 후)
    const firstTimer = setTimeout(() => {
      toast(messages[0], {
        duration: 3000,
        position: "top-right",
      });
    }, 2000);

    // 나머지 메시지들 순차적으로 랜덤 표시
    const showRandomMessage = () => {
      if (availableIndices.length === 0) return; // 모든 메시지를 다 보여줬다면 중단

      // 남은 메시지 중에서 랜덤하게 선택
      const randomArrayIndex = Math.floor(
        Math.random() * availableIndices.length
      );
      const messageIndex = availableIndices[randomArrayIndex];

      // 사용한 인덱스 제거
      availableIndices.splice(randomArrayIndex, 1);

      const randomDelay = Math.floor(Math.random() * (8000 - 5000) + 5000);

      timer = setTimeout(() => {
        toast(messages[messageIndex], {
          duration: 3000,
          position: "top-right",
        });
        showRandomMessage(); // 다음 메시지 예약
      }, randomDelay);
    };

    // 첫 메시지 후 5초 뒤에 랜덤 메시지 시작
    const initialTimer = setTimeout(() => {
      showRandomMessage();
    }, 5000);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(initialTimer);
      clearTimeout(timer);
    };
  }, []);

  return null;
}

function EmergencyAlert({ message, type }) {
  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">
        {message}
      </div>
    </div>
  )
}
