import BoardList from '@/components/BoardList'

export default {
  title: 'Components/BoardList',
  component: BoardList,
  tags: ['autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  }
}

export const Default = {
  args: {
    posts: [
      {
        id: 1,
        title: '첫 번째 게시글',
        user_metadata: { name: '작성자1' },
        user_email: 'user1@example.com',
        created_at: new Date().toISOString(),
        views: 42
      }
    ],
    totalPages: 1
  }
}

export const Loading = {
  args: {
    isLoading: true
  }
} 