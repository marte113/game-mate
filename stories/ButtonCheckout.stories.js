import ButtonCheckout from '@/components/ButtonCheckout'

export default {
  title: 'Components/ButtonCheckout',
  component: ButtonCheckout,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    item: {
      name: '프리미엄 구독',
      amount: 9900
    }
  }
}

export const Loading = {
  args: {
    item: {
      name: '프리미엄 구독',
      amount: 9900
    },
    isLoading: true
  }
} 