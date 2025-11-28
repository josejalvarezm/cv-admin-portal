// Staging domain types - Single Responsibility Principle

/**
 * Operation types for staged changes
 */
export type StagedOperation = 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * Status of a staged change
 */
export type StagedStatus = 'pending' | 'applied' | 'failed' | 'skipped';

/**
 * Individual staged change record
 */
export interface StagedChange {
  id: number;
  operation: StagedOperation;
  entity_type: string;
  entity_id?: number;
  stable_id?: string;
  payload: Record<string, unknown>;
  status: StagedStatus;
  requires_reindex?: boolean;
  created_at: string;
  applied_at?: string;
  error_message?: string;
}

/**
 * Response from staged changes endpoint
 */
export interface StagedChangesResponse {
  d1cv: StagedChange[];
  ai: StagedChange[];
}

/**
 * Staged changes count summary
 */
export interface StagedChangesCount {
  pending: number;
  d1cvPending: number;
  aiPending: number;
  appliedToday: number;
}

/**
 * Request to stage a new change
 */
export interface StageRequest {
  operation: StagedOperation;
  entityId?: number;
  d1cvPayload: Record<string, unknown>;
  aiPayload?: Record<string, unknown>;
}

/**
 * Response from staging a change
 */
export interface StageResponse {
  success: boolean;
  staged: {
    d1cv_id: number;
    ai_id?: number;
    stable_id?: string;
  };
  message: string;
}

/**
 * Response from applying staged changes
 */
export interface ApplyResponse {
  success: boolean;
  applied: number;
  failed: number;
  reindexed?: boolean;
  duration_ms?: number;
  details: ApplyDetail[];
}

/**
 * Individual apply operation result
 */
export interface ApplyDetail {
  stable_id?: string;
  entity_id?: number;
  operation: string;
  status: string;
  error?: string;
}
