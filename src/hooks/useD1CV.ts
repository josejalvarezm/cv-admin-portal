/**
 * Portfolio Data Hooks - Fetch and manage portfolio data
 * 
 * These hooks interact with the admin API which proxies to backend services.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@services/api';
import type { D1CVTechnology, StageRequest, StageResponse, D1CVTechnologyWithAIMatch, TechnologiesWithAIMatchResponse, AIAgentTechnology, ExperienceResponse, EducationResponse, ContactInfo, ProfileInfo, ContentSection, TechnologyCategory } from '@/types';

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
 * Fetch technology categories from D1CV database
 * Used by forms to populate category dropdowns with real DB data
 */
export function useD1CVCategories() {
  return useQuery<TechnologyCategory[], Error>({
    queryKey: ['d1cv', 'categories'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<TechnologyCategory[]>('/api/d1cv/categories');
        return response;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error('Failed to load categories');
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - categories rarely change
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
 * Staged AI data response from the API
 */
interface StagedAIResponse {
  found: boolean;
  hasAIData: boolean;
  d1cv_staged_id?: number;
  ai_staged_id?: number;
  stable_id?: string;
  operation?: string;
  aiData?: {
    summary?: string;
    action?: string;
    effect?: string;
    outcome?: string;
    related_project?: string;
    employer?: string;
    recency?: string;
  };
  message?: string;
}

/**
 * Fetch a single D1CV technology with its AI Agent match data
 * Returns the D1CV tech plus AI enrichment data if available
 * 
 * Priority for AI data:
 * 1. Check staged AI data (for pending changes not yet applied)
 * 2. Check production AI Agent database
 */
export function useD1CVTechnologyWithAIMatch(name: string | undefined) {
  const encodedName = name ? encodeURIComponent(name) : null;

  return useQuery<D1CVTechnologyWithAIMatch, Error>({
    queryKey: ['d1cv', 'technology', name, 'with-ai-match'],
    queryFn: async () => {
      // Fetch D1CV technology
      const d1cvTech = await apiClient.get<D1CVTechnology>(`/api/d1cv/technologies/${encodedName}`);

      // First, check for staged AI data (pending changes not yet applied)
      let aiMatch: AIAgentTechnology | null = null;
      let fromStaging = false;

      try {
        const stagedAI = await apiClient.get<StagedAIResponse>(`/api/staged/ai-by-name/${encodedName}`);
        if (stagedAI.found && stagedAI.hasAIData && stagedAI.aiData) {
          // Convert staged AI data to AIAgentTechnology format
          // Include base tech fields from the D1CV record
          const recencyValue = stagedAI.aiData.recency as 'current' | 'recent' | 'legacy' | undefined;
          aiMatch = {
            id: 0, // Staged, not yet in DB
            name: d1cvTech.name,
            stable_id: stagedAI.stable_id || '',
            // Base technology fields from D1CV
            experience: d1cvTech.experience,
            experience_years: d1cvTech.experience_years,
            proficiency_percent: d1cvTech.proficiency_percent,
            level: d1cvTech.level,
            // AI enrichment fields from staging
            summary: stagedAI.aiData.summary || '',
            action: stagedAI.aiData.action || '',
            effect: stagedAI.aiData.effect || '',
            outcome: stagedAI.aiData.outcome || '',
            related_project: stagedAI.aiData.related_project || '',
            employer: stagedAI.aiData.employer || '',
            recency: recencyValue || 'current',
          };
          fromStaging = true;
        }
      } catch {
        // Staged AI fetch failed, continue to check production
      }

      // If no staged data, try to fetch from production AI Agent database
      if (!aiMatch) {
        try {
          const aiResponse = await apiClient.get<AIAgentTechnology[]>('/api/ai-agent/technologies');
          const normalizedAi = Array.isArray(aiResponse) ? aiResponse :
            ((aiResponse as { data?: AIAgentTechnology[] }).data || (aiResponse as { technologies?: AIAgentTechnology[] }).technologies || []);
          aiMatch = normalizedAi.find(t => t.name.toLowerCase() === d1cvTech.name.toLowerCase()) || null;
        } catch {
          // AI Agent fetch failed, continue without AI match
        }
      }

      return {
        ...d1cvTech,
        hasAiMatch: Boolean(aiMatch),
        aiMatch,
        aiFromStaging: fromStaging, // New field to indicate source
      };
    },
    enabled: encodedName !== null,
  });
}

/**
 * Response from staged technology endpoint
 */
interface StagedTechnologyResponse {
  found: boolean;
  staged_id?: number;
  ai_staged_id?: number | null;
  operation?: string;
  status?: string;
  created_at?: string;
  d1cvData?: {
    name?: string;
    category_id?: number;
    experience?: string;
    experience_years?: number;
    proficiency_percent?: number;
    level?: string;
    is_active?: boolean;
  };
  aiData?: {
    summary?: string;
    action?: string;
    effect?: string;
    outcome?: string;
    related_project?: string;
    employer?: string;
    recency?: string;
  };
  hasAIData?: boolean;
  message?: string;
}

/**
 * Response from unified technology lookup endpoint
 * Combines D1CV, AI Agent, and Staging data in a single request
 */
interface UnifiedTechnologyResponse {
  found: boolean;
  source: 'production' | 'staged' | 'none';
  message?: string;
  d1cv: {
    found: boolean;
    data: {
      id?: number;
      name?: string;
      category_id?: number;
      category?: string;
      experience?: string;
      experience_years?: number;
      proficiency_percent?: number;
      level?: string;
      is_active?: boolean;
    } | null;
  };
  aiAgent: {
    found: boolean;
    source: 'production' | 'staged' | 'none';
    data: {
      summary?: string;
      action?: string;
      effect?: string;
      outcome?: string;
      related_project?: string;
      employer?: string;
      recency?: string;
      stable_id?: string;
    } | null;
  };
  staged: {
    found: boolean;
    operation: string | null;
    staged_id: number | null;
    ai_staged_id: number | null;
    d1cvData: Record<string, unknown> | null;
    aiData: Record<string, unknown> | null;
  };
}

/**
 * Unified technology lookup - single request to get all data
 * 
 * This replaces the need for multiple separate calls to:
 * - /api/d1cv/technologies/:name
 * - /api/ai-agent/technologies/:name  
 * - /api/staged/technology/:name
 * 
 * Returns combined data from production and staging in one response.
 */
export function useUnifiedTechnology(name: string | undefined, aiId?: string | null) {
  const encodedName = name ? encodeURIComponent(name) : null;

  return useQuery<{
    technology: D1CVTechnologyWithAIMatch | null;
    source: 'production' | 'staged' | 'none';
    staged: {
      found: boolean;
      operation: string | null;
      staged_id: number | null;
      ai_staged_id: number | null;
    };
  }, Error>({
    queryKey: ['unified', 'technology', name, aiId],
    queryFn: async () => {
      try {
        // Build query string - use aiId for direct lookup if provided
        let queryPath = `/api/technology/unified/${encodedName}`;
        if (aiId) {
          queryPath += `?aiId=${encodeURIComponent(aiId)}`;
        }

        const response = await apiClient.get<UnifiedTechnologyResponse>(
          queryPath
        );

        if (!response.found) {
          return {
            technology: null,
            source: 'none' as const,
            staged: { found: false, operation: null, staged_id: null, ai_staged_id: null },
          };
        }

        // Build the combined technology object
        const isFromStaging = response.source === 'staged';
        const d1cvData = isFromStaging
          ? response.staged.d1cvData
          : response.d1cv.data;
        const aiData = response.aiAgent.data;

        if (!d1cvData) {
          return {
            technology: null,
            source: response.source,
            staged: {
              found: response.staged.found,
              operation: response.staged.operation,
              staged_id: response.staged.staged_id,
              ai_staged_id: response.staged.ai_staged_id,
            },
          };
        }

        // Build AI match if available
        let aiMatch: AIAgentTechnology | null = null;
        if (aiData && response.aiAgent.found) {
          const recencyValue = aiData.recency as 'current' | 'recent' | 'legacy' | undefined;
          aiMatch = {
            id: 0, // Will be 0 if from staging
            name: (d1cvData.name as string) || '',
            stable_id: (aiData.stable_id as string) || '',
            experience: (d1cvData.experience as string) || '',
            experience_years: (d1cvData.experience_years as number) || 0,
            proficiency_percent: (d1cvData.proficiency_percent as number) || 0,
            level: (d1cvData.level as string) || 'Beginner',
            summary: aiData.summary || '',
            action: aiData.action || '',
            effect: aiData.effect || '',
            outcome: aiData.outcome || '',
            related_project: aiData.related_project || '',
            employer: aiData.employer || '',
            recency: recencyValue || 'current',
          };
        }

        const technology: D1CVTechnologyWithAIMatch = {
          id: (d1cvData.id as number) || -1, // Negative if from staging
          name: (d1cvData.name as string) || '',
          category_id: (d1cvData.category_id as number) || 0,
          category: (d1cvData.category as string) || '',
          experience: (d1cvData.experience as string) || '',
          experience_years: (d1cvData.experience_years as number) || 0,
          proficiency_percent: (d1cvData.proficiency_percent as number) || 0,
          level: (d1cvData.level as string) || 'Beginner',
          is_active: (d1cvData.is_active as boolean) ?? true,
          hasAiMatch: Boolean(aiMatch),
          aiMatch,
          aiFromStaging: response.aiAgent.source === 'staged',
        };

        return {
          technology,
          source: response.source,
          staged: {
            found: response.staged.found,
            operation: response.staged.operation,
            staged_id: response.staged.staged_id,
            ai_staged_id: response.staged.ai_staged_id,
          },
        };
      } catch (error) {
        // If 404, return empty result
        if (error instanceof Error && error.message.includes('404')) {
          return {
            technology: null,
            source: 'none' as const,
            staged: { found: false, operation: null, staged_id: null, ai_staged_id: null },
          };
        }
        throw error;
      }
    },
    enabled: encodedName !== null,
    retry: false,
  });
}

/**
 * Fetch a staged technology by name (for editing pending changes)
 * Use this when the technology doesn't exist in production yet
 */
export function useStagedTechnology(name: string | undefined) {
  const encodedName = name ? encodeURIComponent(name) : null;

  return useQuery<StagedTechnologyResponse, Error>({
    queryKey: ['staged', 'technology', name],
    queryFn: async () => {
      return apiClient.get<StagedTechnologyResponse>(`/api/staged/technology/${encodedName}`);
    },
    enabled: encodedName !== null,
    retry: false, // Don't retry if not found
  });
}

/**
 * Update a staged technology (both D1CV and AI payloads)
 */
export function useUpdateStagedTechnology() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; staged_id: number }, Error, {
    stagedId: number;
    d1cvPayload?: Record<string, unknown>;
    aiPayload?: Record<string, unknown>;
  }>({
    mutationFn: async ({ stagedId, d1cvPayload, aiPayload }) => {
      return apiClient.put(`/api/staged/technology/${stagedId}`, {
        d1cv_payload: d1cvPayload,
        ai_payload: aiPayload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staged'] });
      queryClient.invalidateQueries({ queryKey: ['staged', 'd1cv'] });
    },
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
      queryClient.invalidateQueries({ queryKey: ['staged'] }); // Original staging tables
      queryClient.invalidateQueries({ queryKey: ['staged', 'd1cv'] }); // usePendingStagedD1CV
      queryClient.invalidateQueries({ queryKey: ['v2', 'staged'] }); // v2 git-like workflow
    },
  });
}
