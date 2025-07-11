import { apiClient } from '@/lib/api';

/**
 * ConsensusService
 * Single Responsibility: Handle API interactions related to regional consensus engine
 */
class ConsensusService {
  /**
   * Run the consensus engine and obtain a report.
   * @param {number|null} threshold Optional consensus threshold override
   * @returns {Promise<Object>} Raw consensus report payload
   */
  async runConsensus(threshold = null) {
    try {
      const payload = threshold != null ? { consensusThreshold: threshold } : {};
      const res = await apiClient.post('/consensus/run', payload);
      return res.data;
    } catch (error) {
      console.error('Consensus run error:', error);
      const msg = error?.response?.data?.error;
      throw new Error(msg || 'Failed to generate consensus report');
    }
  }

  /**
   * Transform consensus engine response into UI-friendly structure.
   * @param {Object} raw Raw response from backend
   */
  transformReportForUI(raw) {
    if (!raw?.success) return null;

    const {
      consensusThreshold = 0,
      report: {
        timestamp,
        total_regions = 0,
        strong_consensus = [],
        weak_consensus = [],
        no_consensus = [],
        emergency_alerts = [],
      } = {},
    } = raw;

    const formatConsensusRow = (c, idx) => ({
      id: `${c.region}-${c.signal_type}-${idx}`,
      ...c,
      consensus_strength: Number(c.consensus_strength ?? 0),
      confidence: Number(c.confidence ?? 0),
      participation_rate: Number(c.participation_rate ?? 0),
    });

    return {
      generatedAt: timestamp ? new Date(timestamp) : new Date(),
      consensusThreshold,
      totalRegions: total_regions,
      strong: strong_consensus.map(formatConsensusRow),
      weak: weak_consensus.map(formatConsensusRow),
      none: no_consensus.map(formatConsensusRow),
      emergencies: emergency_alerts.map(formatConsensusRow),
    };
  }
}

export const consensusService = new ConsensusService(); 