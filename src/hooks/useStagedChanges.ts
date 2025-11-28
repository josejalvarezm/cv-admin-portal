/**
 * Staged Changes Hooks - Single Responsibility Principle (SRP)
 * 
 * Each hook has one job:
 * - useStagedChanges: Fetch all staged changes
 * - useStagedChangesCount: Fetch count summary
 * - useApplyD1CV: Apply changes to D1CV database
 * - useApplyAI: Apply changes to AI agent (triggers reindex)
 * - useDeleteStagedChange: Remove a staged change
 * 
 * OWASP: All operations go through authenticated API endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@services/api';
import type { StagedChangesResponse, StagedChangesCount, ApplyResponse } from '@/types';
import { sanitizeId } from '@utils/sanitize';

/**
 * Fetch all staged changes (both D1CV and AI queues)
 */
export function useStagedChanges() {
  return useQuery<StagedChangesResponse>({
    queryKey: ['staged'],
    queryFn: () => apiClient.get('/api/staged'),
    // Refetch frequently as this is a working queue
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Fetch staged changes count summary
 */
export function useStagedChangesCount() {
  return useQuery<StagedChangesCount>({
    queryKey: ['staged', 'count'],
    queryFn: () => apiClient.get('/api/staged/count'),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Apply pending D1CV changes
 * This is typically fast and can be auto-triggered
 */
export function useApplyD1CV() {
  const queryClient = useQueryClient();

  return useMutation<ApplyResponse, Error, void>({
    mutationFn: () => apiClient.post('/api/apply/d1cv', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staged'] });
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
    },
  });
}

/**
 * Apply pending AI changes
 * This triggers reindexing and may take several minutes
 */
export function useApplyAI() {
  const queryClient = useQueryClient();

  return useMutation<ApplyResponse, Error, void>({
    mutationFn: () => apiClient.post('/api/apply/ai', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staged'] });
    },
  });
}

/**
 * Delete a staged change
 * OWASP: ID is sanitized before use
 */
export function useDeleteStagedChange() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { type: 'd1cv' | 'ai'; id: number }>({
    mutationFn: ({ type, id }) => {
      const sanitizedId = sanitizeId(id);
      if (sanitizedId === null) {
        throw new Error('Invalid ID');
      }
      // Validate type is one of allowed values (whitelist)
      if (type !== 'd1cv' && type !== 'ai') {
        throw new Error('Invalid type');
      }
      return apiClient.delete(`/api/staged/${type}/${sanitizedId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staged'] });
    },
  });
}

