import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventoryService';

/**
 * Custom hook to retrieve inventory data for a specific product.
 * Encapsulates querying logic, caching, and error handling.
 * @param {string|number|null} productId - Identifier of the product whose inventory we need
 */
export function useInventory(productId) {
  return useQuery({
    queryKey: ['inventory', productId],
    enabled: Boolean(productId),
    queryFn: async () => {
      const raw = await inventoryService.getInventory(productId);
      return inventoryService.transformInventoryForUI(raw);
    },
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    onError: (err) => console.error('Inventory query error:', err),
  });
}
