import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsService } from '@/services/reservationsService';

/**
 * Hook that returns active reservations data and exposes a cleanup mutation.
 */
export function useReservations() {
  const queryClient = useQueryClient();

  const activeQuery = useQuery({
    queryKey: ['reservations', 'active'],
    queryFn: async () => {
      const raw = await reservationsService.getActive();
      return reservationsService.transformActiveForUI(raw);
    },
    staleTime: 30 * 1000,
    cacheTime: 2 * 60 * 1000,
    retry: 3,
  });

  const cleanupMutation = useMutation({
    mutationFn: () => reservationsService.cleanupExpired(),
    onSuccess: () => {
      // Refresh active reservations list
      queryClient.invalidateQueries({ queryKey: ['reservations', 'active'] });
    },
  });

  return {
    ...activeQuery,
    cleanup: cleanupMutation.mutate,
    cleanupStatus: cleanupMutation,
  };
} 