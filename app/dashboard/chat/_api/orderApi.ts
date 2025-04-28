// app/dashboard/chat/_api/chatApi.ts
import { 
    Order,
    OrderResponse
  } from '../_types/orderTypes'
  
  export const orderApi = {
    getOrder: async (): Promise<Order[]> => {
      const response = await fetch('/api/chat/verify', {
        credentials: 'include'
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '예약 목록을 가져오는데 실패했습니다')
      }
      const data: OrderResponse = await response.json()
      return data.orders
    },


    // 예약 생성    
    postOrder: async (order: Order): Promise<Order[]> => {
      const response = await fetch('/api/chat/verify', {
        method: 'POST',
        body: JSON.stringify(order),
        credentials: 'include'  
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '예약에 실패했습니다')
      }
      const data: OrderResponse = await response.json()
      return data.orders
    },

   
  }