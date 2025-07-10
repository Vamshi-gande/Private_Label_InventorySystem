'use client';

import { StatsCard, SystemHealthCard } from '@/components/dashboard';
import { useDashboardStats } from '@/hooks';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Real-time system overview and key performance indicators across all inventory management
          components.
        </p>
        <div className="text-sm text-gray-500 mt-1">
          Backend endpoints: GET /api/health, GET /api/dashboard/stats
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Health - Independent component */}
        <SystemHealthCard />

        {/* Total Products */}
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts}
          isLoading={statsLoading}
          error={statsError?.message}
          colorClass="text-indigo-600"
        />

        {/* Private Label Products */}
        <StatsCard
          title="Private Label"
          value={stats?.privateLabelCount}
          subtitle={
            stats?.privateLabelPercentage ? `${stats.privateLabelPercentage}% of total` : undefined
          }
          isLoading={statsLoading}
          error={statsError?.message}
          colorClass="text-green-600"
        />

        {/* Third Party Products */}
        <StatsCard
          title="Third Party"
          value={stats?.thirdPartyCount}
          subtitle={
            stats?.thirdPartyPercentage ? `${stats.thirdPartyPercentage}% of total` : undefined
          }
          isLoading={statsLoading}
          error={statsError?.message}
          colorClass="text-orange-600"
        />
      </div>

      {/* Priority Analysis Section */}
      {stats && (stats.averagePrivateLabelPriority > 0 || stats.averageThirdPartyPriority > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard
            title="Private Label Priority"
            value={stats.averagePrivateLabelPriority?.toFixed(2)}
            subtitle="Average calculated priority"
            isLoading={statsLoading}
            error={statsError?.message}
            colorClass="text-blue-600"
          />

          <StatsCard
            title="Third Party Priority"
            value={stats.averageThirdPartyPriority?.toFixed(2)}
            subtitle="Average calculated priority"
            isLoading={statsLoading}
            error={statsError?.message}
            colorClass="text-purple-600"
          />
        </div>
      )}

      {/* Error State for Stats */}
      {statsError && !statsLoading && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Dashboard Statistics Error</h3>
              <p className="mt-1 text-xs text-red-600">Error: {statsError.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
