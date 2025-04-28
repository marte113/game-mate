// 공통으로 사용되는 타입 정의

export interface ReservationOrder {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string | null;
}

export interface ProviderOrdersResponse {
  orders: ReservationOrder[];
}

export interface Game {
  id: number;
  game: string;
  image: string;
}

export interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export interface Reservation {
  id: number;
  date: Date;
  game: Game;
}

// 컴포넌트별 Props 인터페이스
export interface DateTimeSelectorProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedTime: Date | null;
  setSelectedTime: (time: Date | null) => void;
  availableTimes: Date[];
  selectedGame: Game | null;
  isLoading: boolean;
  handleAddReservation: () => void;
}

export interface ReservationListProps {
  reservations: Reservation[];
  formatDate: (date: Date) => string;
  handleRemoveReservation: (id: number) => void;
  isLoading: boolean;
}

export interface GameSelectorProps {
  games: Game[];
  selectedGame: Game | null;
  setSelectedGame: (game: Game | null) => void;
  isLoading: boolean;
}

export interface ReservationSummaryProps {
  gameReservationCounts: Array<{ count: number; game: Game }>;
  totalTokens: number;
}

export interface PaymentInfoProps {
  gameReservationCounts: Array<{ count: number; game: Game }>;
  reservations: Reservation[];
  formatDate: (date: Date) => string;
  totalTokens: number;
} 