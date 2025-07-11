import { Card, Spinner } from '@/components';
import { clsx } from 'clsx';

/**
 * Reusable Statistics Card Component
 * Single Responsibility: Display a single metric with consistent styling
 */
export function StatsCard({
  title,
  value,
  subtitle,
  isLoading = false,
  error = null,
  colorClass = 'text-indigo-600',
  className = '',
}) {
  return (
    <Card className={clsx('p-6', className)}>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>

      {error ? (
        <div className="mt-2">
          <p className="text-sm text-red-600">Error loading data</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      ) : isLoading ? (
        <div className="mt-2 flex items-center">
          <Spinner size="sm" />
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      ) : (
        <div className="mt-2">
          <p className={clsx('text-2xl font-bold', colorClass)}>
            {typeof value === 'number' && !isNaN(value) ? value.toLocaleString() : value || '-'}
          </p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}
    </Card>
  );
}
