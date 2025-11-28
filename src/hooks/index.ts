/**
 * Hooks barrel export
 * 
 * Architecture: Hooks follow Single Responsibility Principle
 * Each hook has one specific purpose.
 */

// Technology CRUD operations
export { 
  useTechnologies, 
  useTechnology, 
  useTechnologiesCount, 
  useStageTechnology 
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
