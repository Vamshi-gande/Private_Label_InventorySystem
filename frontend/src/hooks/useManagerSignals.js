import { useQuery } from '@tanstack/react-query';
import { managerActionsService } from '@/services/managerActionsService';

/**
 * useManagerSignals
 * Encapsulates retrieval and caching of manager action signals.
 */
export function useManagerSignals() {
  return useQuery({
    queryKey: ['managerActions', 'signals'],
    queryFn: async () => {
      const raw = await managerActionsService.getSignals();
      return managerActionsService.transformSignalsForUI(raw);
    },
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    onError: (err) => console.error('Manager action signals query error:', err),
  });
} 