/**
 * Form Constants - Single Responsibility Principle (SRP)
 * 
 * Centralized constants for forms to ensure consistency
 * and make changes in one place.
 */

export const TECHNOLOGY_LEVELS = ['Expert', 'Advanced', 'Intermediate', 'Beginner'] as const;
export type TechnologyLevel = typeof TECHNOLOGY_LEVELS[number];

export const RECENCY_OPTIONS = ['current', 'recent', 'legacy'] as const;
export type RecencyOption = typeof RECENCY_OPTIONS[number];

/**
 * AI Agent categories for semantic search
 * These are independent from D1CV categories (no coupling)
 */
export const AI_CATEGORIES = [
  'Architecture & Design',
  'Backend Development',
  'Cloud & DevOps',
  'Database & Performance',
  'Edge Architectures (Production)',
  'Frontend Development',
  'Legacy Development',
  'Modern Development Practices',
  'Technical Research & Prototyping',
  'Testing',
  'Languages',
] as const;
export type AICategory = typeof AI_CATEGORIES[number];

export const CATEGORIES = [
  'Backend Development',
  'Frontend Development',
  'Cloud & DevOps',
  'Database',
  'Mobile Development',
  'Testing',
  'Architecture',
  'Other',
] as const;
export type Category = typeof CATEGORIES[number];

/**
 * Get category ID from category name
 * Used when converting form data to D1CV payload
 */
export function getCategoryId(categoryName: string): number {
  const index = CATEGORIES.indexOf(categoryName as Category);
  return index >= 0 ? index + 1 : 1;
}

/**
 * Get category name from category ID
 * Used when loading existing technology data
 */
export function getCategoryName(categoryId: number): Category {
  return CATEGORIES[categoryId - 1] || CATEGORIES[0];
}
