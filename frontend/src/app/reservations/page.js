'use client';

import { ReservationsTable } from '@/components/reservations';
import { StatsCard } from '@/components/dashboard';
import { Button } from '@/components';
import { useReservations } from '@/hooks';

export default function Reservations() {
  const {
    data,
    isLoading,
    error,
    cleanup,
    cleanupStatus,
  } = useReservations();

  const reservations = data?.reservations ?? [];
  const count = data?.activeReservations ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Reservations</h1>
        <p className="text-gray-600">Monitor active inventory reservations and clean up expired ones.</p>
        <div className="text-xs text-gray-400 mt-1">
          Backend endpoints: GET /api/reservations/active, POST /api/reservations/cleanup
        </div>
      </div>

      {/* Summary */}
      <StatsCard
        title="Active Reservations"
        value={count}
        isLoading={isLoading}
        error={error?.message}
        colorClass="text-indigo-600"
      />

      {/* Table */}
      <ReservationsTable rows={reservations} isLoading={isLoading} error={error?.message} />

      {/* Cleanup */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => cleanup()}
          disabled={cleanupStatus.isLoading}
          variant="primary"
        >
          {cleanupStatus.isLoading ? 'Cleaning…' : 'Cleanup Expired Reservations'}
        </Button>
        {cleanupStatus.isError && (
          <span className="text-sm text-red-600">{cleanupStatus.error.message}</span>
        )}
        {cleanupStatus.isSuccess && (
          <span className="text-sm text-green-700">{cleanupStatus.data.message}</span>
        )}
      </div>
    </div>
  );
}
