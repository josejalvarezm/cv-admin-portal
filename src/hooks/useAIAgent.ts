/**
 * AI Agent Hooks - Fetch and manage cv-ai-agent data
 * 
 * These hooks interact with cv-admin-worker which proxies to the cv-ai-agent API.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@services/api';
import type { AIAgentTechnology, VectorizeStatus } from '@/types';

interface AIAgentTechnologiesResponse {
  data?: AIAgentTechnology[];
  technologies?: AIAgentTechnology[];
}

function normalizeAIAgentResponse(response: AIAgentTechnology[] | AIAgentTechnologiesResponse): AIAgentTechnology[] {
  if (Array.isArray(response)) {
    return response;
  }
  return response.data || response.technologies || [];
}

/**
 * Fetch all technologies from cv-ai-agent
 */
export function useAIAgentTechnologies() {
  return useQuery<AIAgentTechnology[], Error>({
    queryKey: ['ai-agent', 'technologies'],
    queryFn: async () => {
      const response = await apiClient.get<AIAgentTechnology[] | AIAgentTechnologiesResponse>('/api/ai-agent/technologies');
      return normalizeAIAgentResponse(response);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single technology from cv-ai-agent by stable_id
 */
export function useAIAgentTechnology(stableId: string | undefined) {
  return useQuery<AIAgentTechnology, Error>({
    queryKey: ['ai-agent', 'technology', stableId],
    queryFn: () => apiClient.get(`/api/ai-agent/technologies/${stableId}`),
    enabled: Boolean(stableId),
  });
}

/**
 * Fetch Vectorize index status
 */
export function useVectorizeStatus() {
  return useQuery<VectorizeStatus, Error>({
    queryKey: ['ai-agent', 'vectorize', 'status'],
    queryFn: () => apiClient.get('/api/ai-agent/vectorize/status'),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Trigger Vectorize reindex
 */
export function useVectorizeReindex() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error>({
    mutationFn: () => apiClient.post('/api/ai-agent/vectorize/reindex', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agent', 'vectorize'] });
      queryClient.invalidateQueries({ queryKey: ['ai-agent', 'technologies'] });
    },
  });
}
