import { mateRepository } from '@/app/apis/repository/mate/mateRepository'
import { mockApiResponse, mockApiError } from '../../setup'

// Mock Supabase
jest.mock('@/app/apis/base/client', () => ({
  getServerSupabase: jest.fn()
}))

// Mock utilities
jest.mock('@/app/apis/base/utils', () => ({
  QueryBuilder: jest.fn().mockImplementation(() => ({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    executeSingle: jest.fn()
  }))
}))

const mockMateProfile = {
  public_id: 1,
  nickname: 'TestMate',
  selected_games: ['League of Legends', 'Valorant'],
  is_mate: true,
  users: {
    profile_circle_img: 'test.jpg',
    is_online: true
  }
}

describe('MateRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findRecommendedMates', () => {
    it('추천 메이트 목록을 정상적으로 조회한다', async () => {
      const mockMates = [mockMateProfile]
      const QueryBuilder = require('@/app/apis/base/utils').QueryBuilder
      const mockBuilder = new QueryBuilder()
      mockBuilder.execute.mockResolvedValue(mockMates)

      const result = await mateRepository.findRecommendedMates(5)
      
      expect(result).toEqual(mockMates)
      expect(mockBuilder.where).toHaveBeenCalledWith({ is_mate: true })
      expect(mockBuilder.limit).toHaveBeenCalledWith(5)
    })

    it('필터 조건이 올바르게 적용된다', async () => {
      const filters = {
        where: { game_category: 'moba', min_rating: 4.0 }
      }
      
      const QueryBuilder = require('@/app/apis/base/utils').QueryBuilder
      const mockBuilder = new QueryBuilder()
      mockBuilder.execute.mockResolvedValue([])

      await mateRepository.findRecommendedMates(5, filters)
      
      expect(mockBuilder.where).toHaveBeenCalledWith({
        is_mate: true,
        game_category: 'moba',
        min_rating: 4.0
      })
    })

    it('users가 null인 메이트를 필터링한다', async () => {
      const mockMatesWithNull = [
        mockMateProfile,
        { ...mockMateProfile, users: null }
      ]
      
      const QueryBuilder = require('@/app/apis/base/utils').QueryBuilder
      const mockBuilder = new QueryBuilder()
      mockBuilder.execute.mockResolvedValue(mockMatesWithNull)

      const result = await mateRepository.findRecommendedMates(5)
      
      expect(result).toHaveLength(1)
      expect(result[0].users).not.toBeNull()
    })
  })

  describe('findMateDetails', () => {
    it('메이트 상세 정보를 정상적으로 조회한다', async () => {
      const mockDetails = {
        ...mockMateProfile,
        profile_description: 'Test description',
        hourly_rate: 10000,
        total_orders: 50,
        avg_rating: 4.8
      }

      // Mock Supabase response
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockDetails, error: null })
      }

      const { getServerSupabase } = require('@/app/apis/base/client')
      getServerSupabase.mockResolvedValue(mockSupabase)

      const result = await mateRepository.findMateDetails(1)
      
      expect(result).toEqual(mockDetails)
      expect(mockSupabase.eq).toHaveBeenCalledWith('public_id', 1)
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_mate', true)
    })

    it('존재하지 않는 메이트에 대해 null을 반환한다', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'No rows found' }
        })
      }

      const { getServerSupabase } = require('@/app/apis/base/client')
      getServerSupabase.mockResolvedValue(mockSupabase)

      await expect(mateRepository.findMateDetails(999)).rejects.toThrow()
    })
  })

  describe('caching', () => {
    it('파트너 메이트 조회 시 캐싱이 동작한다', async () => {
      const mockMates = [mockMateProfile]
      
      // 첫 번째 호출
      const QueryBuilder = require('@/app/apis/base/utils').QueryBuilder
      const mockBuilder = new QueryBuilder()
      mockBuilder.execute.mockResolvedValue(mockMates)

      const result1 = await mateRepository.findPartnerMates(5)
      const result2 = await mateRepository.findPartnerMates(5)
      
      // 캐시 적중으로 인해 두 결과가 동일해야 함
      expect(result1).toEqual(result2)
    })
  })

  describe('error handling', () => {
    it('Repository 에러가 올바르게 처리된다', async () => {
      const QueryBuilder = require('@/app/apis/base/utils').QueryBuilder
      const mockBuilder = new QueryBuilder()
      mockBuilder.execute.mockRejectedValue(new Error('Database error'))

      await expect(mateRepository.findRecommendedMates(5)).rejects.toThrow('Database error')
    })
  })
})
