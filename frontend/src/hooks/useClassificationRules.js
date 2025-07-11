import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classificationService } from '@/services/classificationService';

export function useClassificationRules() {
  const queryClient = useQueryClient();

  const rulesQuery = useQuery({
    queryKey: ['classification', 'rules'],
    queryFn: async () => {
      const raw = await classificationService.getRules();
      return classificationService.transformRulesForUI(raw);
    },
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });

  const addRuleMutation = useMutation({
    mutationFn: classificationService.addRule.bind(classificationService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification', 'rules'] });
    },
  });

  return {
    ...rulesQuery,
    addRule: addRuleMutation.mutate,
    addRuleStatus: addRuleMutation,
  };
} 