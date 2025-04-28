import { AutoToast } from '@/components/AutoToast'

export default {
  title: 'Components/AutoToast',
  component: AutoToast,
  tags: ['autodocs'],
}

export const Default = {}

export const EmergencyAlert = {
  args: {
    message: '긴급 알림 메시지입니다!',
    type: 'error'
  }
} 