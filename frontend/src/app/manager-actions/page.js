'use client';

import { StatsCard } from '@/components/dashboard';
import { ManagerSignalsTable } from '@/components/managerActions';
import { useManagerSignals } from '@/hooks';

export default function ManagerActions() {
  const { data, isLoading, error } = useManagerSignals();

  const signals = data?.signals ?? [];
  const totalSignals = data?.totalSignals ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manager Action Tracker</h1>
        <p className="text-gray-600">
          Event-driven manager action logging with behavioral intelligence extraction and signal
          analysis.
        </p>
        <div className="text-sm text-gray-500">
          Backend endpoints: POST /api/manager-actions, GET /api/manager-actions/signals
        </div>
      </div>

      {/* Summary Card */}
      <StatsCard
        title="Total Signals"
        value={totalSignals}
        isLoading={isLoading}
        error={error?.message}
        colorClass="text-teal-600"
      />

      {/* Signals Table */}
      <ManagerSignalsTable rows={signals} isLoading={isLoading} error={error?.message} />
    </div>
  );
}
