import { BlogSection } from '@/components/BlogSection'

export default {
  title: 'Components/BlogSection',
  component: BlogSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export const Default = {
  args: {
    posts: [
      {
        id: 1,
        title: '샘플 블로그 포스트',
        date: '2024-03-20',
        content: '# 안녕하세요\n이것은 샘플 블로그 포스트입니다.'
      }
    ]
  }
} 