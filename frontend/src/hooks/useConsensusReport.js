import { useQuery } from '@tanstack/react-query';
import { consensusService } from '@/services/consensusService';

/**
 * useConsensusReport
 * Runs regional consensus engine and returns processed report.
 * @param {number|null} threshold Optional consensus threshold to override default
 */
export function useConsensusReport(threshold = null) {
  return useQuery({
    queryKey: ['consensus', 'report', threshold ?? 'default'],
    queryFn: async () => {
      const raw = await consensusService.runConsensus(threshold);
      return consensusService.transformReportForUI(raw);
    },
    staleTime: 0, // always fresh since we trigger engine run
    cacheTime: 0,
    retry: 2,
    onError: (err) => console.error('Consensus report query error:', err),
  });
} 