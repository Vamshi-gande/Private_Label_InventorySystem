import { apiClient } from '@/lib/api';

/**
 * Inventory Service
 * Single Responsibility: Handle inventory-related API interactions and data transformation
 */
class InventoryService {
  /**
   * Fetch inventory data for a given product
   * @param {string|number} productId - Product identifier
   * @returns {Promise<Object>} Raw inventory payload from backend
   */
  async getInventory(productId) {
    if (!productId) throw new Error('Product ID is required');

    try {
      const response = await apiClient.get(`/inventory/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Inventory fetch error:', error);

      // Attempt to surface backend error message if available
      const backendMsg = error?.response?.data?.error;
      throw new Error(backendMsg || 'Failed to fetch inventory data');
    }
  }

  /**
   * Transform raw inventory payload into a UI-friendly structure.
   * Currently keeps most fields intact but ensures presence of summary totals.
   * @param {Object} raw - Raw inventory response from the backend
   * @returns {Object|null} Transformed inventory object or null when invalid
   */
  transformInventoryForUI(raw) {
    if (!raw?.success) return null;

    const { product, isPrivateLabel, profitMargin, inventoryByWarehouse = [], summary } = raw;

    // Ensure summary always exists
    const ensuredSummary =
      summary ??
      inventoryByWarehouse.reduce(
        (acc, row) => {
          acc.totalAvailable += row.available_quantity ?? 0;
          acc.totalReserved += row.reserved_quantity ?? 0;
          return acc;
        },
        { totalAvailable: 0, totalReserved: 0 },
      );

    return {
      product,
      isPrivateLabel,
      profitMargin,
      inventoryByWarehouse,
      summary: ensuredSummary,
    };
  }
}

export const inventoryService = new InventoryService();
