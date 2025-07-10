export default function Inventory() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
      <p className="text-gray-600">
        Real-time inventory status tracking and management across all warehouses and stores.
      </p>
      <div className="text-sm text-gray-500">Backend endpoints: GET /api/inventory/:productId</div>
    </div>
  );
}
