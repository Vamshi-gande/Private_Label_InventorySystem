'use client';

import { StatsCard } from '@/components/dashboard';
import { ClassificationRulesTable, AddRuleForm } from '@/components/classification';
import { useClassificationRules } from '@/hooks';
import { Button } from '@/components';

export default function Classification() {
  const {
    data,
    isLoading,
    error,
    addRule,
    addRuleStatus,
  } = useClassificationRules();

  const rules = data?.rules ?? [];

  const onAddRule = (payload) => {
    addRule(payload);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Classification Engine</h1>
        <p className="text-gray-600">
          Manage rule-based product classification. Add new rules and review existing ones.
        </p>
        <div className="text-xs text-gray-400 mt-1">
          Backend endpoints: GET /api/classification/rules, POST /api/classification/rules
        </div>
      </div>

      {/* Summary */}
      <StatsCard
        title="Total Rules"
        value={rules.length}
        isLoading={isLoading}
        error={error?.message}
        colorClass="text-purple-600"
      />

      {/* Add rule form */}
      <AddRuleForm onSubmit={onAddRule} isSubmitting={addRuleStatus.isLoading} />
      {addRuleStatus.isError && (
        <p className="text-sm text-red-600">{addRuleStatus.error.message}</p>
      )}
      {addRuleStatus.isSuccess && (
        <p className="text-sm text-green-700">Rule added successfully.</p>
      )}

      {/* Rules table */}
      <ClassificationRulesTable rows={rules} isLoading={isLoading} error={error?.message} />
    </div>
  );
}
