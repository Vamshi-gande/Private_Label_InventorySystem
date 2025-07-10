import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

/**
 * Custom hook for dashboard statistics
 * Encapsulates data fetching logic and provides consistent interface
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const rawStats = await dashboardService.getStats();
      return dashboardService.transformStatsForUI(rawStats);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Dashboard stats query error:', error);
    },
  });
}
