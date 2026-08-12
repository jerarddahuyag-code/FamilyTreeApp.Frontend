import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  birthDate?: string | null;
  avatarUrl?: string;
  phoneNumber?: string;
  gender?: string | null;
  bio?: string;
  isPublic?: boolean;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.id;

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = await apiClient('Profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return response;
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      }
    },
  });
}
