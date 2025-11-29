/**
 * Portfolio Data Hooks - Fetch and manage portfolio data
 * 
 * These hooks interact with the admin API which proxies to backend services.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@services/api';
import type { D1CVTechnology, StageRequest, StageResponse, D1CVTechnologyWithAIMatch, TechnologiesWithAIMatchResponse, AIAgentTechnology } from '@/types';

// D1CV API returns this nested structure
interface D1CVTechnologiesAPIResponse {
  heroSkills?: D1CVTechnology[];
  technologyCategories?: Array<{
    name: string;
    icon: string;
    technologies: D1CVTechnology[];
  }>;
  // Also handle flat array or wrapped responses
  data?: D1CVTechnology[];
  technologies?: D1CVTechnology[];
}

/**
 * Normalize D1CV response to flat array of technologies
 */
function normalizeD1CVResponse(response: D1CVTechnology[] | D1CVTechnologiesAPIResponse): D1CVTechnology[] {
  // Already an array
  if (Array.isArray(response)) {
    return response;
  }
  
  // Handle nested structure from D1CV v2 API
  if (response.technologyCategories) {
    const allTechs: D1CVTechnology[] = [];
    
    // Add hero skills
    if (response.heroSkills) {
      allTechs.push(...response.heroSkills);
    }
    
    // Flatten category technologies
    for (const category of response.technologyCategories) {
      if (category.technologies) {
        // Add category name to each tech
        const techsWithCategory = category.technologies.map(tech => ({
          ...tech,
          category: category.name,
        }));
        allTechs.push(...techsWithCategory);
      }
    }
    
    return allTechs;
  }
  
  // Handle wrapped responses
  return response.data || response.technologies || [];
}

/**
 * Fetch all technologies from the portfolio database
 */
export function useD1CVTechnologies() {
  return useQuery<D1CVTechnology[], Error>({
    queryKey: ['d1cv', 'technologies'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<D1CVTechnology[] | D1CVTechnologiesAPIResponse>('/api/d1cv/technologies');
        return normalizeD1CVResponse(response);
      } catch (error) {
        // Re-throw with user-friendly message (don't expose internal service names)
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error('Failed to load technologies');
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch all technologies with AI Agent match status
 * Returns technologies with hasAiMatch flag and aiMatch data
 */
export function useD1CVTechnologiesWithAIMatch() {
  return useQuery<D1CVTechnologyWithAIMatch[], Error>({
    queryKey: ['d1cv', 'technologies', 'with-ai-match'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<TechnologiesWithAIMatchResponse>('/api/d1cv/technologies/with-ai-match');
        return response.technologies || [];
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error('Failed to load technologies');
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single technology from D1CV by name
 * D1CV v2 API doesn't use IDs, so we identify technologies by name
 */
export function useD1CVTechnology(name: string | undefined) {
  const encodedName = name ? encodeURIComponent(name) : null;

  return useQuery<D1CVTechnology, Error>({
    queryKey: ['d1cv', 'technology', name],
    queryFn: () => apiClient.get(`/api/d1cv/technologies/${encodedName}`),
    enabled: encodedName !== null,
  });
}

/**
 * Fetch a single D1CV technology with its AI Agent match data
 * Returns the D1CV tech plus AI enrichment data if available
 */
export function useD1CVTechnologyWithAIMatch(name: string | undefined) {
  const encodedName = name ? encodeURIComponent(name) : null;

  return useQuery<D1CVTechnologyWithAIMatch, Error>({
    queryKey: ['d1cv', 'technology', name, 'with-ai-match'],
    queryFn: async () => {
      // Fetch D1CV technology
      const d1cvTech = await apiClient.get<D1CVTechnology>(`/api/d1cv/technologies/${encodedName}`);
      
      // Try to fetch matching AI Agent technology by name
      let aiMatch: AIAgentTechnology | null = null;
      try {
        const aiResponse = await apiClient.get<AIAgentTechnology[]>('/api/ai-agent/technologies');
        const normalizedAi = Array.isArray(aiResponse) ? aiResponse : 
          ((aiResponse as { data?: AIAgentTechnology[] }).data || (aiResponse as { technologies?: AIAgentTechnology[] }).technologies || []);
        aiMatch = normalizedAi.find(t => t.name.toLowerCase() === d1cvTech.name.toLowerCase()) || null;
      } catch {
        // AI Agent fetch failed, continue without AI match
      }
      
      return {
        ...d1cvTech,
        hasAiMatch: Boolean(aiMatch),
        aiMatch,
      };
    },
    enabled: encodedName !== null,
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
      entity_name: data.entityName, // For D1CV technologies (identified by name)
      d1cv_payload: data.d1cvPayload,
      ai_payload: data.aiPayload,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d1cv', 'technologies'] });
      queryClient.invalidateQueries({ queryKey: ['staged'] });
    },
  });
}
