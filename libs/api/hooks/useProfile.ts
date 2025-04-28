import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { 
  fetchProfileData, 
  updateProfile, 
  uploadProfileImage, 
  uploadAlbumImage, 
  deleteAlbumImage,
  ProfileData,
  ProfileUpdateData
} from '../profile';

// 프로필 데이터 쿼리 키
const PROFILE_QUERY_KEY = 'profile';

/**
 * 프로필 데이터를 가져오는 훅
 */
export const useProfileData = () => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY],
    queryFn: async () => {
      const response = await fetchProfileData();
      
      if (response.error) {
        toast.error(response.error);
        throw new Error(response.error);
      }
      
      if (!response.data) {
        throw new Error('프로필 데이터를 불러오는데 실패했습니다');
      }
      
      return response.data;
    },
  });
};

/**
 * 프로필 데이터를 업데이트하는 훅
 */
export const useProfileUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const response = await updateProfile(data);
      
      if (response.error) {
        toast.error(response.error);
        throw new Error(response.error);
      }
      
      if (response.data !== true) {
        throw new Error('프로필 업데이트에 실패했습니다');
      }
      
      return true;
    },
    onSuccess: () => {
      toast.success('프로필이 성공적으로 업데이트되었습니다');
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
    },
  });
};

/**
 * 프로필 이미지를 업로드하는 훅
 */
export const useProfileImageUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await uploadProfileImage(file);
      
      if (response.error) {
        toast.error(response.error);
        throw new Error(response.error);
      }
      
      if (!response.data) {
        throw new Error('이미지 업로드에 실패했습니다');
      }
      
      return response.data;
    },
    onSuccess: (newImageUrl: string) => {
      toast.success('프로필 이미지가 업데이트되었습니다');
      
      // 캐시된 프로필 데이터 업데이트
      queryClient.setQueryData<ProfileData | undefined>(
        [PROFILE_QUERY_KEY],
        (oldData: ProfileData | undefined) => {
          if (!oldData) return undefined;
          
          return {
            ...oldData,
            profileImage: newImageUrl,
          };
        }
      );
    },
  });
};

/**
 * 앨범 이미지를 업로드하는 훅
 */
export const useAlbumImageUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, index }: { file: File; index: number }) => {
      const response = await uploadAlbumImage(file, index);
      
      if (response.error) {
        toast.error(response.error);
        throw new Error(response.error);
      }
      
      if (!response.data || !response.data.id || !response.data.url) {
        throw new Error('이미지 업로드에 실패했습니다');
      }
      
      return { 
        id: response.data.id, 
        url: response.data.url, 
        index 
      };
    },
    onSuccess: (data: { id: string; url: string; index: number }) => {
      toast.success('앨범 이미지가 업데이트되었습니다');
      
      // 캐시된 프로필 데이터 업데이트
      queryClient.setQueryData<ProfileData | undefined>(
        [PROFILE_QUERY_KEY],
        (oldData: ProfileData | undefined) => {
          if (!oldData) return undefined;
          
          const newAlbumImages = [...oldData.albumImages];
          newAlbumImages[data.index] = {
            id: data.id,
            url: data.url,
            order: data.index,
          };
          
          return {
            ...oldData,
            albumImages: newAlbumImages,
          };
        }
      );
    },
  });
};

/**
 * 앨범 이미지를 삭제하는 훅
 */
export const useAlbumImageDelete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ imageId, index }: { imageId: string; index: number }) => {
      const response = await deleteAlbumImage(imageId);
      
      if (response.error) {
        toast.error(response.error);
        throw new Error(response.error);
      }
      
      if (response.data !== true) {
        throw new Error('이미지 삭제에 실패했습니다');
      }
      
      return { success: true, index };
    },
    onSuccess: (data: { success: boolean; index: number }) => {
      toast.success('앨범 이미지가 삭제되었습니다');
      
      // 캐시된 프로필 데이터 업데이트
      queryClient.setQueryData<ProfileData | undefined>(
        [PROFILE_QUERY_KEY],
        (oldData: ProfileData | undefined) => {
          if (!oldData) return undefined;
          
          const newAlbumImages = [...oldData.albumImages];
          newAlbumImages[data.index] = null;
          
          return {
            ...oldData,
            albumImages: newAlbumImages,
          };
        }
      );
    },
  });
}; 