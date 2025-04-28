import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export const formatMessageTime = (timestamp: string | null) => {
  if (!timestamp) return ''
  return format(new Date(timestamp), 'a h:mm', { locale: ko })
}