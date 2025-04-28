'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { fetchProfileImage, updateProfileImage } from '@/app/dashboard/_api/profileSectionApi';

export function useProfileImage() {
  const queryClient = useQueryClient();
  const QUERY_KEY = ['profileImage'];
  
  const { 
    data, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchProfileImage,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfileImage,
    onSuccess: () => {
      toast.success('프로필 이미지가 업데이트되었습니다');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(`프로필 이미지 업데이트에 실패했습니다: ${error.message}`);
    }
  });

  const retryFetch = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  return { 
    profileData: data, 
    isLoading, 
    isError, 
    updateProfileImage: updateMutation.mutate,
    isPendingUpdate: updateMutation.isPending,
    retryFetch
  };
}