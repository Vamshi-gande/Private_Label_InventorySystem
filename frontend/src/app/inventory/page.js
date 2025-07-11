'use client';

import { useState } from 'react';
import { StatsCard } from '@/components/dashboard';
import { InventoryTable } from '@/components/inventory';
import { useInventory } from '@/hooks';
import { Button } from '@/components';

export default function Inventory() {
  const [productIdInput, setProductIdInput] = useState('');
  const [productId, setProductId] = useState(null);

  const { data: inventory, isLoading, error } = useInventory(productId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numeric = Number(productIdInput);
    setProductId(Number.isFinite(numeric) && numeric > 0 ? numeric : null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600">
          Check real-time inventory status by product across all warehouses.
        </p>
      </div>

      {/* Product selector */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-4">
        <div>
          <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
            Product ID
          </label>
          <input
            id="productId"
            type="number"
            min="1"
            step="1"
            value={productIdInput}
            onChange={(e) => setProductIdInput(e.target.value)}
            placeholder="e.g. 1"
            className="mt-1 block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <Button type="submit">Load Inventory</Button>
      </form>

      {/* Stats summary */}
      {inventory?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard
            title="Total Available"
            value={inventory.summary.totalAvailable}
            isLoading={isLoading}
            error={error?.message}
            colorClass="text-green-600"
          />
          <StatsCard
            title="Total Reserved"
            value={inventory.summary.totalReserved}
            isLoading={isLoading}
            error={error?.message}
            colorClass="text-orange-600"
          />
        </div>
      )}

      {/* Inventory by warehouse */}
      {productId && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-2">Inventory by Warehouse</h2>
          <InventoryTable
            rows={inventory?.inventoryByWarehouse ?? []}
            isLoading={isLoading}
            error={error?.message}
          />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700 font-medium">Error: {error.message}</p>
        </div>
      )}

      <div className="text-xs text-gray-400">Backend endpoint: GET /api/inventory/:productId</div>
    </div>
  );
}
