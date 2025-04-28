import { Order } from '../task/_types/orderTypes';

export interface CreateOrderRequest {
  providerId: string;
  game: string;
  scheduledDate: string;
  scheduledTime: string;
  price: number;
}

export interface ChangeOrderStatusRequest {
  requestId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'canceled';
}

export interface OrderResponse {
  order: Order;
}

export interface OrdersResponse {
  orders: Order[];
}

export const orderApi = {
  // 사용자가 받은 의뢰 목록 조회
  getReceivedOrders: async (): Promise<OrdersResponse> => {
    const response = await fetch('/api/order/received');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '의뢰 목록을 가져오는데 실패했습니다');
    }
    
    return await response.json();
  },
  
  // 사용자가 신청한 의뢰 목록 조회
  getRequestedOrders: async (): Promise<OrdersResponse> => {
    const response = await fetch('/api/order/requested');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '의뢰 목록을 가져오는데 실패했습니다');
    }
    
    return await response.json();
  },
  
  // 새 의뢰 생성 (결제 포함)
  createOrder: async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await fetch('/api/order/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '의뢰 생성에 실패했습니다');
    }
    
    return await response.json();
  },
  
  // 의뢰 상태 변경 (수락, 거절, 완료)
  changeOrderStatus: async (data: ChangeOrderStatusRequest): Promise<OrderResponse> => {
    const response = await fetch('/api/order/status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '의뢰 상태 변경에 실패했습니다');
    }
    
    return await response.json();
  },

  
  getProviderReservations: async (providerId: string): Promise<OrdersResponse> => {
    const response = await fetch(`/api/order/provider-reservations?providerId=${providerId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '예약 정보를 가져오는데 실패했습니다');
    }
    
    return await response.json();
  },


}; 