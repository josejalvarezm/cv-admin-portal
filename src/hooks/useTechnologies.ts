/**
 * Technology Hooks - Single Responsibility Principle (SRP)
 * 
 * Each hook has one job:
 * - useTechnologies: Fetch all technologies
 * - useTechnology: Fetch single technology
 * - useTechnologiesCount: Fetch count statistics
 * - useStageTechnology: Stage a technology change
 * 
 * OWASP: Input validation happens in the API client layer
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@services/api';
import type { 
  Technology, 
  TechnologiesCount, 
  StageRequest, 
  StageResponse 
} from '@/types';
import { sanitizeId } from '@utils/sanitize';

/**
 * API response type - handles both array and wrapped responses
 */
interface TechnologiesResponse {
  data?: Technology[];
  technologies?: Technology[];
}

/**
 * Normalize API response to always return an array
 */
function normalizeResponse(response: Technology[] | TechnologiesResponse): Technology[] {
  if (Array.isArray(response)) {
    return response;
  }
  return response.data || response.technologies || [];
}

/**
 * Fetch all technologies
 */
export function useTechnologies() {
  return useQuery<Technology[]>({
    queryKey: ['technologies'],
    queryFn: async () => {
      const response = await apiClient.get<Technology[] | TechnologiesResponse>('/api/technologies');
      return normalizeResponse(response);
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Fetch a single technology by ID
 * OWASP: ID is sanitized before use
 */
export function useTechnology(id: string | undefined) {
  const sanitizedId = id ? sanitizeId(id) : null;
  
  return useQuery<Technology>({
    queryKey: ['technology', sanitizedId],
    queryFn: () => apiClient.get(`/api/technologies/${sanitizedId}`),
    enabled: sanitizedId !== null,
  });
}

/**
 * Fetch technology count statistics
 */
export function useTechnologiesCount() {
  return useQuery<TechnologiesCount>({
    queryKey: ['technologies', 'count'],
    queryFn: () => apiClient.get('/api/technologies/count'),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Stage a technology change (INSERT, UPDATE, DELETE)
 * Invalidates related queries on success
 */
export function useStageTechnology() {
  const queryClient = useQueryClient();

  return useMutation<StageResponse, Error, StageRequest>({
    mutationFn: (data) => apiClient.post('/api/stage', {
      operation: data.operation,
      entity_type: 'technology',
      entity_id: data.entityId,
      d1cv_payload: data.d1cvPayload,
      ai_payload: data.aiPayload,
    }),
    onSuccess: () => {
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      queryClient.invalidateQueries({ queryKey: ['staged'] });
    },
  });
}

