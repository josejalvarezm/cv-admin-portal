/**
 * D1CV Hooks - Fetch and manage D1CV (Portfolio) data
 * 
 * These hooks interact with cv-admin-worker which proxies to the D1CV API.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@services/api';
import type { D1CVTechnology, StageRequest, StageResponse } from '@/types';
import { sanitizeId } from '@utils/sanitize';

interface D1CVTechnologiesResponse {
  data?: D1CVTechnology[];
  technologies?: D1CVTechnology[];
}

function normalizeD1CVResponse(response: D1CVTechnology[] | D1CVTechnologiesResponse): D1CVTechnology[] {
  if (Array.isArray(response)) {
    return response;
  }
  return response.data || response.technologies || [];
}

/**
 * Fetch all technologies from D1CV
 */
export function useD1CVTechnologies() {
  return useQuery<D1CVTechnology[], Error>({
    queryKey: ['d1cv', 'technologies'],
    queryFn: async () => {
      const response = await apiClient.get<D1CVTechnology[] | D1CVTechnologiesResponse>('/api/d1cv/technologies');
      return normalizeD1CVResponse(response);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single technology from D1CV by ID
 */
export function useD1CVTechnology(id: string | undefined) {
  const sanitizedId = id ? sanitizeId(id) : null;

  return useQuery<D1CVTechnology, Error>({
    queryKey: ['d1cv', 'technology', sanitizedId],
    queryFn: () => apiClient.get(`/api/d1cv/technologies/${sanitizedId}`),
    enabled: sanitizedId !== null,
  });
}

/**
 * Fetch categories from D1CV
 */
export function useD1CVCategories() {
  return useQuery<{ id: number; name: string }[], Error>({
    queryKey: ['d1cv', 'categories'],
    queryFn: async () => {
      const response = await apiClient.get<{ categories: { id: number; name: string }[] }>('/api/d1cv/categories');
      return response.categories || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes (categories don't change often)
  });
}

/**
 * Stage a technology change (works for both D1CV and AI Agent)
 */
export function useStageTechnology() {
  const queryClient = useQueryClient();

  return useMutation<StageResponse, Error, StageRequest>({
    mutationFn: (data) => apiClient.post('/stage', {
      operation: data.operation,
      entity_type: 'technology',
      entity_id: data.entityId,
      d1cv_payload: data.d1cvPayload,
      ai_payload: data.aiPayload,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d1cv', 'technologies'] });
      queryClient.invalidateQueries({ queryKey: ['staged'] });
    },
  });
}
