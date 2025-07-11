import { Spinner } from '@/components';
import clsx from 'clsx';

/**
 * ReservationsTable Component
 * Displays active reservations in tabular form
 */
export function ReservationsTable({ rows = [], isLoading = false, error = null }) {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 py-4">
        <Spinner size="sm" />
        <span className="text-sm text-gray-500">Loading reservations…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-sm text-red-600">Error loading reservations: {error}</div>
    );
  }

  if (!rows.length) {
    return <p className="py-4 text-sm text-gray-500">No active reservations.</p>;
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md max-h-[70vh]">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Reservation ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Product</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Warehouse</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Store</th>
            <th className="px-4 py-2 text-right font-medium text-gray-700">Quantity</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Reserved At</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Expires In</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.reservationId} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap">{row.reservationId}</td>
              <td className="px-4 py-2 whitespace-nowrap">{row.productName}</td>
              <td className="px-4 py-2 whitespace-nowrap">{row.warehouseName}</td>
              <td className="px-4 py-2 whitespace-nowrap">{row.storeName}</td>
              <td className="px-4 py-2 whitespace-nowrap text-right font-medium">
                {row.reservedQuantity}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {row.reservationTime ? row.reservationTime.toLocaleString() : '-'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <span
                  className={clsx(
                    'font-medium',
                    row.isExpiringSoon ? 'text-red-600' : 'text-gray-900',
                  )}
                >
                  {Math.max(Math.round(row.secondsUntilExpiry), 0)}s
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 