/**
 * Hooks barrel export
 * 
 * Architecture: Hooks follow Single Responsibility Principle
 * Each hook has one specific purpose.
 */

// Legacy technology CRUD operations (for backwards compatibility)
export { 
  useTechnologies, 
  useTechnology, 
  useTechnologiesCount, 
} from './useTechnologies';

// Staged changes operations
export { 
  useStagedChanges, 
  useStagedChangesCount, 
  useApplyD1CV, 
  useApplyAI, 
  useDeleteStagedChange 
} from './useStagedChanges';

// Similarity check for duplicate prevention
export { useSimilarityCheck } from './useSimilarityCheck';

// D1CV (Portfolio) data operations
export {
  useD1CVTechnologies,
  useD1CVTechnology,
  useD1CVCategories,
  useStageTechnology,
} from './useD1CV';

// AI Agent data operations
export {
  useAIAgentTechnologies,
  useAIAgentTechnology,
  useVectorizeStatus,
  useVectorizeReindex,
} from './useAIAgent';
