export default function Queue() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Multi-Queue Processing System</h1>
      <p className="text-gray-600">
        Priority-based multi-queue processing with intelligent task distribution and dynamic
        priority adjustment.
      </p>
      <div className="text-sm text-gray-500">
        Backend endpoints: POST /api/queue/add, POST /api/queue/process, GET /api/queue/status, POST
        /api/queue/load-demo, GET /api/queue/demo
      </div>
    </div>
  );
}
