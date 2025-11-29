/**
 * AI Agent Hooks - Fetch and manage cv-ai-agent data
 * 
 * These hooks interact with cv-admin-worker which proxies to the cv-ai-agent API.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@services/api';
import type { AIAgentTechnology, AIAgentTechnologyWithD1CVMatch, VectorizeStatus, D1CVTechnology } from '@/types';

interface AIAgentTechnologiesResponse {
  data?: AIAgentTechnology[];
  technologies?: AIAgentTechnology[];
}

interface D1CVTechnologiesResponse {
  heroSkills?: D1CVTechnology[];
  technologyCategories?: Array<{
    name: string;
    icon: string;
    technologies: D1CVTechnology[];
  }>;
  data?: D1CVTechnology[];
  technologies?: D1CVTechnology[];
}

function normalizeAIAgentResponse(response: AIAgentTechnology[] | AIAgentTechnologiesResponse): AIAgentTechnology[] {
  if (Array.isArray(response)) {
    return response;
  }
  return response.data || response.technologies || [];
}

function normalizeD1CVResponse(response: D1CVTechnology[] | D1CVTechnologiesResponse): D1CVTechnology[] {
  if (Array.isArray(response)) {
    return response;
  }
  if (response.technologyCategories) {
    const allTechs: D1CVTechnology[] = [];
    if (response.heroSkills) {
      allTechs.push(...response.heroSkills);
    }
    for (const category of response.technologyCategories) {
      if (category.technologies) {
        allTechs.push(...category.technologies);
      }
    }
    return allTechs;
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
 * Fetch all AI Agent technologies with D1CV match status
 * Combines AI Agent data with D1CV lookup
 */
export function useAIAgentTechnologiesWithD1CVMatch() {
  return useQuery<AIAgentTechnologyWithD1CVMatch[], Error>({
    queryKey: ['ai-agent', 'technologies', 'with-d1cv-match'],
    queryFn: async () => {
      // Fetch both AI Agent and D1CV technologies in parallel
      const [aiAgentResponse, d1cvResponse] = await Promise.all([
        apiClient.get<AIAgentTechnology[] | AIAgentTechnologiesResponse>('/api/ai-agent/technologies'),
        apiClient.get<D1CVTechnology[] | D1CVTechnologiesResponse>('/api/d1cv/technologies'),
      ]);

      const aiAgentTechnologies = normalizeAIAgentResponse(aiAgentResponse);
      const d1cvTechnologies = normalizeD1CVResponse(d1cvResponse);

      // Create a map of D1CV technologies by normalized name for quick lookup
      const d1cvByName = new Map<string, D1CVTechnology>();
      for (const tech of d1cvTechnologies) {
        d1cvByName.set(tech.name.toLowerCase(), tech);
      }

      // Enrich AI Agent technologies with D1CV match status
      return aiAgentTechnologies.map((tech): AIAgentTechnologyWithD1CVMatch => {
        const d1cvMatch = d1cvByName.get(tech.name.toLowerCase());
        return {
          ...tech,
          hasD1CVMatch: Boolean(d1cvMatch),
          d1cvMatchName: d1cvMatch?.name || null,
        };
      });
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
