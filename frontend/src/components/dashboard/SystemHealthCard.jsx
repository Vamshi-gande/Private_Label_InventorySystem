import { Card, Spinner } from '@/components';
import { useHealth } from '@/hooks';
import { clsx } from 'clsx';

/**
 * System Health Status Card Component
 * Single Responsibility: Display system health information
 */
export function SystemHealthCard() {
  const { data: health, isLoading, error } = useHealth();

  const getHealthColor = (status) => {
    if (!status) return 'text-gray-500';

    const statusLower = status.toLowerCase();
    if (statusLower.includes('up') || statusLower.includes('ok')) {
      return 'text-green-600';
    }
    if (statusLower.includes('warning')) {
      return 'text-yellow-600';
    }
    return 'text-red-600';
  };

  const getHealthIcon = (status) => {
    if (!status) return '❓';

    const statusLower = status.toLowerCase();
    if (statusLower.includes('up') || statusLower.includes('ok')) {
      return '✅';
    }
    if (statusLower.includes('warning')) {
      return '⚠️';
    }
    return '❌';
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900">System Health</h3>

      {error ? (
        <div className="mt-2">
          <p className="text-sm text-red-600">❌ Health check failed</p>
          <p className="text-xs text-gray-500 mt-1">Cannot connect to backend</p>
        </div>
      ) : isLoading ? (
        <div className="mt-2 flex items-center">
          <Spinner size="sm" />
          <span className="ml-2 text-sm text-gray-500">Checking...</span>
        </div>
      ) : (
        <div className="mt-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getHealthIcon(health?.status)}</span>
            <p className={clsx('text-sm font-medium', getHealthColor(health?.status))}>
              {health?.status || 'Unknown'}
            </p>
          </div>

          {health?.databaseConnection && (
            <p className="text-xs text-gray-500 mt-1">Database: {health.databaseConnection}</p>
          )}

          {health?.timestamp && (
            <p className="text-xs text-gray-400 mt-1">
              Last checked: {new Date(health.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
