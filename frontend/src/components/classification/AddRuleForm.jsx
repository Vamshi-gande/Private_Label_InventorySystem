import { useState } from 'react';
import { Button } from '@/components';

/**
 * AddRuleForm Component
 * Collects rule data and triggers onSubmit callback
 */
export function AddRuleForm({ onSubmit, isSubmitting = false }) {
  const [ruleType, setRuleType] = useState('BRAND');
  const [rulePattern, setRulePattern] = useState('');
  const [confidenceScore, setConfidenceScore] = useState('1.0');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ruleType, rulePattern, confidenceScore: parseFloat(confidenceScore) });
    setRulePattern('');
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div>
        <label htmlFor="ruleType" className="block text-sm font-medium text-gray-700">
          Rule Type
        </label>
        <select
          id="ruleType"
          value={ruleType}
          onChange={(e) => setRuleType(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="BRAND">BRAND</option>
          <option value="SKU_PATTERN">SKU_PATTERN</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label htmlFor="rulePattern" className="block text-sm font-medium text-gray-700">
          Rule Pattern
        </label>
        <input
          id="rulePattern"
          type="text"
          required
          value={rulePattern}
          onChange={(e) => setRulePattern(e.target.value)}
          placeholder="e.g. ^ABC.* or Nike"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
        />
      </div>

      <div>
        <label htmlFor="confidenceScore" className="block text-sm font-medium text-gray-700">
          Confidence
        </label>
        <input
          id="confidenceScore"
          type="number"
          step="0.01"
          min="0"
          max="1"
          required
          value={confidenceScore}
          onChange={(e) => setConfidenceScore(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="md:col-span-1">
        {isSubmitting ? 'Adding…' : 'Add Rule'}
      </Button>
    </form>
  );
} 