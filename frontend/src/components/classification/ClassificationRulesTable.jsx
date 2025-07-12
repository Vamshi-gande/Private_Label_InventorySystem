import { Spinner, Button } from '@/components';

export function ClassificationRulesTable({ 
  rows = [], 
  isLoading = false, 
  error = null, 
  onDeleteRule = null,
  deleteRuleStatus = null 
}) {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 py-4">
        <Spinner size="sm" />
        <span className="text-sm text-gray-500">Loading rules…</span>
      </div>
    );
  }

  if (error) {
    return <div className="py-4 text-sm text-red-600">Error loading rules: {error}</div>;
  }

  if (!rows.length) {
    return <p className="py-4 text-sm text-gray-500">No classification rules defined.</p>;
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Rule ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Type</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Pattern</th>
            <th className="px-4 py-2 text-right font-medium text-gray-700">Confidence</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Created At</th>
            {onDeleteRule && (
              <th className="px-4 py-2 text-center font-medium text-gray-700">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((rule) => (
            <tr key={rule.rule_id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap">{rule.rule_id}</td>
              <td className="px-4 py-2 whitespace-nowrap">{rule.rule_type}</td>
              <td className="px-4 py-2 whitespace-nowrap font-mono text-xs">{rule.rule_pattern}</td>
              <td className="px-4 py-2 whitespace-nowrap text-right">
                {parseFloat(rule.confidence_score).toFixed(2)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {rule.created_at ? rule.created_at.toLocaleDateString() : '-'}
              </td>
              {onDeleteRule && (
                <td className="px-4 py-2 whitespace-nowrap text-center">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDeleteRule(rule.rule_id)}
                    disabled={deleteRuleStatus?.isLoading}
                  >
                    {deleteRuleStatus?.isLoading ? 'Deleting...' : 'Delete'}
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 