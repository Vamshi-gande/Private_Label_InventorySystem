import { useQuery } from '@tanstack/react-query';
import { getHealth } from '@/services/healthService';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    staleTime: 60 * 1000,
  });
}
