// Technology domain types - Interface Segregation Principle (ISP)

/**
 * Base technology fields shared across all contexts
 */
export interface BaseTechnology {
  name: string;
  experience: string;
  experience_years: number;
  proficiency_percent: number;
  level: string;
}

/**
 * D1CV-specific technology data for portfolio display
 * Follows ISP - clients that only need D1CV data don't depend on AI fields
 */
export interface D1CVTechnologyData extends BaseTechnology {
  category_id: number;
  display_order?: number;
  is_active: boolean;
}

/**
 * AI enrichment data for chatbot context
 * Follows ISP - separate interface for AI-specific fields
 */
export interface AIEnrichmentData {
  summary: string;
  action: string;
  effect: string;
  outcome: string;
  related_project: string;
  employer: string;
  recency: 'current' | 'recent' | 'legacy';
}

/**
 * Full technology entity from database
 * Includes both D1CV and AI fields for unified handling
 */
export interface Technology extends BaseTechnology {
  id: number;
  category_id?: number;
  category?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // AI sync status
  ai_synced?: boolean;
  // AI enrichment fields (may be present from AI agent)
  summary?: string;
  action?: string;
  effect?: string;
  outcome?: string;
  related_project?: string;
  employer?: string;
  recency?: string;
}

/**
 * Form data combining D1CV and optional AI fields
 */
export interface TechnologyFormData extends BaseTechnology {
  category: string;
  is_active: boolean;
  // AI enrichment (optional)
  summary: string;
  action: string;
  effect: string;
  outcome: string;
  related_project: string;
  employer: string;
  recency: string;
}

/**
 * Similar technology from semantic search
 */
export interface SimilarTechnology {
  stable_id: string;
  name: string;
  score: number;
  category?: string;
  summary?: string;
}

/**
 * Technology count statistics
 */
export interface TechnologiesCount {
  total: number;
  active: number;
  byCategory: Record<string, number>;
}

/**
 * D1CV Technology entity from D1CV database
 */
export interface D1CVTechnology extends BaseTechnology {
  id: number;
  category_id?: number;
  category?: string;
  display_order?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * AI Agent Technology entity from cv-ai-agent database
 * Has additional AI enrichment fields
 */
export interface AIAgentTechnology extends BaseTechnology {
  id: number;
  stable_id: string;
  category_id?: number;
  category?: string;
  // AI enrichment fields
  summary?: string;
  action?: string;
  effect?: string;
  outcome?: string;
  related_project?: string;
  employer?: string;
  recency?: 'current' | 'recent' | 'legacy';
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

/**
 * Vectorize index status
 */
export interface VectorizeStatus {
  healthy: boolean;
  indexName: string;
  documentCount: number;
  lastUpdated?: string;
}

/**
 * D1CV Technology with AI match status
 * Used for the technologies grid to show match/no match
 */
export interface D1CVTechnologyWithAIMatch extends D1CVTechnology {
  hasAiMatch: boolean;
  aiMatch: AIAgentTechnology | null;
}

/**
 * AI Agent Technology with D1CV match status
 * Used for the AI Agent technologies grid to show D1CV match status
 */
export interface AIAgentTechnologyWithD1CVMatch extends AIAgentTechnology {
  hasD1CVMatch: boolean;
  d1cvMatchName: string | null;
}

/**
 * Response from /api/d1cv/technologies/with-ai-match
 */
export interface TechnologiesWithAIMatchResponse {
  technologies: D1CVTechnologyWithAIMatch[];
  stats: {
    total: number;
    withAiMatch: number;
    withoutAiMatch: number;
  };
}

