export default function Classification() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Product Classification Engine</h1>
      <p className="text-gray-600">
        Intelligent product classification with rule-based automation and batch processing
        capabilities.
      </p>
      <div className="text-sm text-gray-500">
        Backend endpoints: POST /api/classification/products/register, POST
        /api/classification/classify/batch, GET /api/classification/rules, POST
        /api/classification/rules
      </div>
    </div>
  );
}
