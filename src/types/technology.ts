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
