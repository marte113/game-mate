import { create } from 'zustand';
// import { Task } from '../../../types/task.types' // 삭제
import { Order } from '../_types/orderTypes'; // 올바른 Order 타입 임포트 (task 폴더 내부 타입)

// 상태 인터페이스 분리
interface ModalState {
  isOpen: boolean;
  task: Order | null;
}

// 전체 스토어 상태 및 액션 인터페이스
interface TaskStoreState {
  taskDetailModal: ModalState;
  reviewModal: ModalState;
  // 액션을 상태와 분리
  openTaskDetailModal: (task: Order) => void;
  closeTaskDetailModal: () => void;
  openReviewModal: (task: Order) => void;
  closeReviewModal: () => void;
}

export const useTaskStore = create<TaskStoreState>((set) => ({
  // 초기 상태
  taskDetailModal: { isOpen: false, task: null },
  reviewModal: { isOpen: false, task: null },

  // 액션 정의 (set 함수 간결화)
  openTaskDetailModal: (task) =>
    set({ taskDetailModal: { isOpen: true, task } }), // 변경되는 부분만 명시
  closeTaskDetailModal: () =>
    set({ taskDetailModal: { isOpen: false, task: null } }),

  openReviewModal: (task) =>
    set({ reviewModal: { isOpen: true, task } }),
  closeReviewModal: () =>
    set({ reviewModal: { isOpen: false, task: null } }),
})); 