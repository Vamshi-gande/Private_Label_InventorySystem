'use client';

import { StatsCard } from '@/components/dashboard';
import { ConsensusReportTable } from '@/components/consensus';
import { Button } from '@/components';
import { useConsensusReport } from '@/hooks';
import { useState } from 'react';

export default function Consensus() {
  const [threshold, setThreshold] = useState(null);

  const { data, isLoading, error, refetch } = useConsensusReport(threshold);

  const onRunAgain = () => {
    refetch();
  };

  const strongRows = data?.strong ?? [];
  const weakRows = data?.weak ?? [];
  const emergencyRows = data?.emergencies ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Regional Consensus Engine</h1>
        <p className="text-gray-600">
          Geographic clustering and consensus validation across regional clusters with dynamic
          threshold tuning.
        </p>
        <div className="text-sm text-gray-500">Backend endpoint: POST /api/consensus/run</div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Strong Consensus"
          value={strongRows.length}
          isLoading={isLoading}
          error={error?.message}
          colorClass="text-green-600"
        />
        <StatsCard
          title="Weak Consensus"
          value={weakRows.length}
          isLoading={isLoading}
          error={error?.message}
          colorClass="text-orange-600"
        />
        <StatsCard
          title="Emergency Alerts"
          value={emergencyRows.length}
          isLoading={isLoading}
          error={error?.message}
          colorClass="text-red-600"
        />
      </div>

      {/* Strong Consensus Table */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Strong Consensus</h2>
        <ConsensusReportTable
          rows={strongRows}
          isLoading={isLoading}
          error={error?.message}
          variant="strong"
        />
      </div>

      {/* Weak Consensus Table */}
      {weakRows.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Weak / Moderate Consensus</h2>
          <ConsensusReportTable
            rows={weakRows}
            isLoading={isLoading}
            error={error?.message}
            variant="weak"
          />
        </div>
      )}

      {/* Emergency Alerts Table */}
      {emergencyRows.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 text-red-700">Emergency Alerts</h2>
          <ConsensusReportTable
            rows={emergencyRows}
            isLoading={isLoading}
            error={error?.message}
            variant="emergencies"
          />
        </div>
      )}

      {/* Rerun button */}
      <div className="pt-4">
        <Button onClick={onRunAgain} disabled={isLoading}>
          {isLoading ? 'Running…' : 'Run Consensus'}
        </Button>
      </div>
    </div>
  );
}
