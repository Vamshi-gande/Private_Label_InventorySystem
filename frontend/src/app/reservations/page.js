export default function Reservations() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Inventory Reservations</h1>
      <p className="text-gray-600">
        View active inventory reservations and manage cleanup of expired reservations.
      </p>
      <div className="text-sm text-gray-500">
        Backend endpoints: GET /api/reservations/active, POST /api/reservations/cleanup
      </div>
    </div>
  );
}
