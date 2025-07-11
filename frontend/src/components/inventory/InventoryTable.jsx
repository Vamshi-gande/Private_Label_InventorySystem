import { Spinner } from '@/components';

/**
 * InventoryTable Component
 * Single Responsibility: Render inventory information grouped by warehouse
 */
export function InventoryTable({ rows = [], isLoading = false, error = null }) {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 py-4">
        <Spinner size="sm" />
        <span className="text-sm text-gray-500">Loading inventory…</span>
      </div>
    );
  }

  if (error) {
    return <div className="py-4 text-sm text-red-600">Error loading inventory data: {error}</div>;
  }

  if (!rows.length) {
    return <p className="py-4 text-sm text-gray-500">No inventory records found.</p>;
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium tracking-wide text-gray-700">
              Warehouse
            </th>
            <th className="px-4 py-2 text-right font-medium tracking-wide text-gray-700">
              Available
            </th>
            <th className="px-4 py-2 text-right font-medium tracking-wide text-gray-700">
              Reserved
            </th>
            <th className="px-4 py-2 text-right font-medium tracking-wide text-gray-700">
              Safety Stock
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.inventory_id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap text-gray-900">{row.warehouse_name}</td>
              <td className="px-4 py-2 whitespace-nowrap text-right font-medium text-green-700">
                {row.available_quantity}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right font-medium text-orange-600">
                {row.reserved_quantity}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-gray-700">
                {row.safety_stock_level}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
