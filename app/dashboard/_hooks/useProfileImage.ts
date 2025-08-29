'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { updateProfileImage } from '@/app/dashboard/_api/profileSectionApi';
import { useProfileImageQuery } from '@/hooks/api/profile/useProfileQueries';
import { queryKeys } from '@/constants/queryKeys';

export function useProfileImage() {
  const queryClient = useQueryClient();
  const QUERY_KEY = queryKeys.profile.image();
  
  const { data, isLoading, isError } = useProfileImageQuery();

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