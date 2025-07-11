import { apiClient } from '@/lib/api';

/**
 * Dashboard Statistics Service
 * Handles all dashboard-related API interactions
 */
class DashboardService {
  /**
   * Fetch dashboard statistics from backend
   * @returns {Promise<Object>} Dashboard stats object
   */
  async getStats() {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Dashboard stats fetch error:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  /**
   * Transform raw stats data for UI consumption
   * @param {Object} rawStats - stats from API
   * @returns {Object} Transformed stats for UI
   */
  transformStatsForUI(rawStats) {
    if (!rawStats?.stats) {
      return {
        totalProducts: 0,
        privateLabelCount: 0,
        thirdPartyCount: 0,
        averagePrivateLabelPriority: 0,
        averageThirdPartyPriority: 0,
        privateLabelPercentage: 0,
        thirdPartyPercentage: 0,
      };
    }

    const { stats } = rawStats;
    const privateLabelPercentage =
      stats.totalProducts > 0
        ? ((stats.privateLabelCount / stats.totalProducts) * 100).toFixed(1)
        : 0;
    const thirdPartyPercentage =
      stats.totalProducts > 0
        ? ((stats.thirdPartyCount / stats.totalProducts) * 100).toFixed(1)
        : 0;

    return {
      ...stats,
      privateLabelPercentage: parseFloat(privateLabelPercentage),
      thirdPartyPercentage: parseFloat(thirdPartyPercentage),
    };
  }
}

export const dashboardService = new DashboardService();
