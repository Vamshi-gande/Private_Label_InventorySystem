import { Spinner } from '@/components';

/**
 * ManagerSignalsTable Component
 * Displays manager action signals in a tabular format.
 */
export function ManagerSignalsTable({ rows = [], isLoading = false, error = null }) {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 py-4">
        <Spinner size="sm" />
        <span className="text-sm text-gray-500">Loading signals…</span>
      </div>
    );
  }

  if (error) {
    return <div className="py-4 text-sm text-red-600">Error loading signals: {error}</div>;
  }

  if (!rows.length) {
    return <p className="py-4 text-sm text-gray-500">No signals detected.</p>;
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Store</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Product</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Signal</th>
            <th className="px-4 py-2 text-right font-medium text-gray-700">Confidence</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Magnitude</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Trigger</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap">{row.store_id}</td>
              <td className="px-4 py-2 whitespace-nowrap">{row.product_id}</td>
              <td className="px-4 py-2 whitespace-nowrap">{row.signal}</td>
              <td className="px-4 py-2 whitespace-nowrap text-right">
                {parseFloat(row.confidence).toFixed(2)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">{row.magnitude}</td>
              <td className="px-4 py-2 whitespace-nowrap">{row.trigger}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 