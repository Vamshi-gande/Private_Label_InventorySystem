import { Spinner } from '@/components';
import { clsx } from 'clsx';

/**
 * ConsensusReportTable
 * Displays a list of regional consensus results.
 */
export function ConsensusReportTable({ rows = [], isLoading = false, error = null, variant = 'strong' }) {
  const titleColor = {
    strong: 'text-green-700',
    weak: 'text-orange-600',
    none: 'text-gray-700',
    emergencies: 'text-red-700',
  }[variant] || 'text-gray-800';

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 py-4">
        <Spinner size="sm" />
        <span className="text-sm text-gray-500">Calculating consensus…</span>
      </div>
    );
  }

  if (error) {
    return <div className="py-4 text-sm text-red-600">Error loading consensus: {error}</div>;
  }

  if (!rows.length) {
    return <p className="py-4 text-sm text-gray-500">No results.</p>;
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Region</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Signal</th>
            <th className="px-4 py-2 text-right font-medium text-gray-700">Consensus Strength</th>
            <th className="px-4 py-2 text-right font-medium text-gray-700">Confidence</th>
            <th className="px-4 py-2 text-right font-medium text-gray-700">Participation</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Reasoning</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap">{row.region}</td>
              <td className={clsx('px-4 py-2 whitespace-nowrap font-medium', titleColor)}>
                {row.signal_type}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right">
                {row.consensus_strength.toFixed(2)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right">
                {row.confidence.toFixed(2)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right">
                {Math.round(row.participation_rate * 100)}%
              </td>
              <td className="px-4 py-2 whitespace-pre-wrap text-gray-700 max-w-sm">
                {row.reasoning}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 