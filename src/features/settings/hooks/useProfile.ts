import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export interface UserProfile {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  gender?: string;
  bio?: string;
  isPublic?: boolean;
}

export function useProfile() {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<UserProfile> => {
      // The apiClient automatically prepends /api/ so we just pass the endpoint
      // wait, `apiClient` does: url = `/api/${endpoint.replace(/^\//, '')}`
      // So if we pass `Users/${userId}`, it becomes `/api/Users/...`
      const response = await apiClient<{ value: UserProfile }>(`Users/${userId}`);
      return response.value; // The backend returns Result<GetUserByIdQueryResponse> which serializes to { value: { ... } } or we just return response if it returns the object directly.
      // Wait, UsersController GetUserById returns `Ok(result)`, where result is `Result<GetUserByIdQueryResponse>`.
      // The Result object in Domain.Common has `Value`. JSON serialization makes it lowercase `value` typically.
    },
    enabled: !!userId,
  });
}
