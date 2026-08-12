import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api-client';

export function useAuthGuard() {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    
    apiClient<any>('/Auth/me')
      .then((data) => {
        if (mounted) {
          setUser({
            id: data.id,
            email: data.email,
            globalPrivateFlag: false,
            profileData: {
              name: data.name
            },
          });
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          router.push('/login');
        }
      });
      
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, setUser, router]);

  return { isLoading };
}
