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

// Legacy staged changes operations (for backwards compatibility)
export {
  useStagedChanges,
  useStagedChangesCount,
  useApplyD1CV,
  useApplyAI,
  useDeleteStagedChange,
  usePurgeD1CVCache,
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

// Git-like commit workflow (v2)
export {
  useUncommittedChanges,
  useCommits,
  useCommitDetails,
  useStagingStats,
  useStageChange,
  useDeleteStagedChange as useDeleteStagedChangeV2,
  useCreateCommit,
  usePushToD1CV,
  usePushToAI,
  type StagedChange,
  type Commit,
  type CommitWithChanges,
  type StagingStats,
  type Action,
  type Target,
  type EntityType,
  type CommitStatus,
} from './useCommits';

// Real-time job status via WebSocket
export {
  useJobWebSocket,
  useJobStatus,
  type DOJobStatus,
} from './useJobWebSocket';
