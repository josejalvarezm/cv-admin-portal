/**
 * Portfolio Data Hooks - Fetch and manage portfolio data
 * 
 * These hooks interact with the admin API which proxies to backend services.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@services/api';
import type { D1CVTechnology, StageRequest, StageResponse, D1CVTechnologyWithAIMatch, TechnologiesWithAIMatchResponse, AIAgentTechnology, ExperienceResponse, EducationResponse, ContactInfo, ProfileInfo, ContentSection } from '@/types';

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
 * Normalize a single technology item from D1CV API (camelCase to snake_case)
 */
function normalizeTech(tech: Record<string, unknown>, categoryName?: string): D1CVTechnology {
  return {
    id: tech.id as number || 0,
    name: tech.name as string,
    experience: tech.experience as string || '',
    experience_years: (tech.experience_years ?? tech.experienceYears ?? 0) as number,
    proficiency_percent: (tech.proficiency_percent ?? tech.proficiencyPercent ?? 0) as number,
    level: tech.level as string || 'Intermediate',
    category_id: tech.category_id as number,
    category: categoryName || tech.category as string,
    display_order: tech.display_order as number,
    is_active: tech.is_active !== false,
    created_at: tech.created_at as string,
    updated_at: tech.updated_at as string,
  };
}

/**
 * Normalize D1CV response to flat array of technologies
 */
function normalizeD1CVResponse(response: D1CVTechnology[] | D1CVTechnologiesAPIResponse): D1CVTechnology[] {
  // Already an array
  if (Array.isArray(response)) {
    return response.map(tech => normalizeTech(tech as unknown as Record<string, unknown>));
  }
  
  // Handle nested structure from D1CV v2 API
  if (response.technologyCategories) {
    const allTechs: D1CVTechnology[] = [];
    
    // Add hero skills (also need normalization)
    if (response.heroSkills) {
      for (const skill of response.heroSkills) {
        allTechs.push(normalizeTech(skill as unknown as Record<string, unknown>, 'Hero Skills'));
      }
    }
    
    // Flatten category technologies
    for (const category of response.technologyCategories) {
      if (category.technologies) {
        for (const tech of category.technologies) {
          allTechs.push(normalizeTech(tech as unknown as Record<string, unknown>, category.name));
        }
      }
    }
    
    return allTechs;
  }
  
  // Handle wrapped responses
  const techs = response.data || response.technologies || [];
  return techs.map(tech => normalizeTech(tech as unknown as Record<string, unknown>));
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
 * Fetch experience entries from D1CV
 */
export function useD1CVExperience() {
  return useQuery<ExperienceResponse, Error>({
    queryKey: ['d1cv', 'experience'],
    queryFn: async () => {
      return apiClient.get<ExperienceResponse>('/api/d1cv/experience');
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch education from D1CV
 */
export function useD1CVEducation() {
  return useQuery<EducationResponse, Error>({
    queryKey: ['d1cv', 'education'],
    queryFn: async () => {
      return apiClient.get<EducationResponse>('/api/d1cv/education');
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch contact info from D1CV
 */
export function useD1CVContact() {
  return useQuery<ContactInfo, Error>({
    queryKey: ['d1cv', 'contact'],
    queryFn: async () => {
      return apiClient.get<ContactInfo>('/api/d1cv/contact');
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch profile info from D1CV
 */
export function useD1CVProfile() {
  return useQuery<ProfileInfo, Error>({
    queryKey: ['d1cv', 'profile'],
    queryFn: async () => {
      return apiClient.get<ProfileInfo>('/api/d1cv/profile');
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch content section (home, achievements) from D1CV
 */
export function useD1CVSection(sectionType: 'home' | 'achievements') {
  return useQuery<ContentSection, Error>({
    queryKey: ['d1cv', 'section', sectionType],
    queryFn: async () => {
      return apiClient.get<ContentSection>(`/api/d1cv/sections/${sectionType}`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// =============================================================================
// EXPERIENCE MUTATIONS
// =============================================================================

export interface ExperienceInput {
  company: string;
  location?: string;
  role: string;
  period: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  reporting_to?: string;
  operating_level?: string;
  description?: string;
  technologies?: string;
  display_order?: number;
  categories?: Array<{
    title: string;
    display_order?: number;
    achievements?: Array<{
      title: string;
      description: string;
      display_order?: number;
    }>;
  }>;
}

export function useCreateExperience() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; id: number }, Error, ExperienceInput>({
    mutationFn: (data) => apiClient.post('/api/d1cv/experience', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d1cv', 'experience'] });
    },
  });
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, { id: number; data: ExperienceInput }>({
    mutationFn: ({ id, data }) => apiClient.put(`/api/d1cv/experience/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d1cv', 'experience'] });
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, number>({
    mutationFn: (id) => apiClient.delete(`/api/d1cv/experience/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d1cv', 'experience'] });
    },
  });
}

// =============================================================================
// EDUCATION MUTATIONS
// =============================================================================

export interface EducationInput {
  institution: string;
  degree?: string;
  location?: string;
  start_year?: string;
  end_year?: string;
  description?: string;
  display_order?: number;
  focus_areas?: string[];
}

export function useCreateEducation() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; id: number }, Error, EducationInput>({
    mutationFn: (data) => apiClient.post('/api/d1cv/education', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d1cv', 'education'] });
    },
  });
}

export function useUpdateEducation() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, { id: number; data: EducationInput }>({
    mutationFn: ({ id, data }) => apiClient.put(`/api/d1cv/education/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d1cv', 'education'] });
    },
  });
}

export function useDeleteEducation() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, number>({
    mutationFn: (id) => apiClient.delete(`/api/d1cv/education/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d1cv', 'education'] });
    },
  });
}

// =============================================================================
// CONTACT MUTATIONS
// =============================================================================

export interface ContactInput {
  name: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  location?: string;
  work_authorization?: string;
  availability?: string;
  work_preference?: string;
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, ContactInput>({
    mutationFn: (data) => apiClient.put('/api/d1cv/contact', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d1cv', 'contact'] });
    },
  });
}

// =============================================================================
// PROFILE MUTATIONS
// =============================================================================

export interface ProfileInput {
  title?: string;
  summary?: string;
  key_achievements?: string[];
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, ProfileInput>({
    mutationFn: (data) => apiClient.put('/api/d1cv/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d1cv', 'profile'] });
    },
  });
}

// =============================================================================
// CONTENT SECTION MUTATIONS (home, achievements)
// =============================================================================

export interface ContentSectionInput {
  section_name?: string;
  json_content: Record<string, unknown>;
  display_order?: number;
}

export function useUpdateContentSection(sectionType: 'home' | 'achievements') {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, ContentSectionInput>({
    mutationFn: (data) => apiClient.put(`/api/d1cv/sections/${sectionType}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['d1cv', 'section', sectionType] });
    },
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
