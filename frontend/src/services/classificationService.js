import { apiClient } from '@/lib/api';

/**
 * Classification Service
 * Handles CRUD interactions related to classification rules/products
 */
class ClassificationService {
  /**
   * Fetch all classification rules.
   * @returns {Promise<Object>} Raw response
   */
  async getRules() {
    try {
      const res = await apiClient.get('/classification/rules');
      return res.data;
    } catch (error) {
      console.error('Classification rules fetch error:', error);
      const msg = error?.response?.data?.error;
      throw new Error(msg || 'Failed to fetch classification rules');
    }
  }

  /**
   * Add a new classification rule.
   * @param {Object} payload { ruleType, rulePattern, confidenceScore }
   */
  async addRule(payload) {
    try {
      const res = await apiClient.post('/classification/rules', payload);
      return res.data;
    } catch (error) {
      console.error('Add classification rule error:', error);
      const msg = error?.response?.data?.error;
      throw new Error(msg || 'Failed to add classification rule');
    }
  }

  /**
   * Transform rules response for UI usage.
   */
  transformRulesForUI(raw) {
    if (!raw?.success) return null;

    return {
      rules: (raw.rules || []).map((r) => ({
        ...r,
        created_at: r.created_at ? new Date(r.created_at) : null,
      })),
    };
  }
}

export const classificationService = new ClassificationService(); 