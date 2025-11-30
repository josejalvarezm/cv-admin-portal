/**
 * Commit Management Hooks
 * 
 * Hooks for the git-like staging workflow:
 * - Stage changes
 * - Create commits with messages
 * - Push commits to D1CV and AI Agent
 * 
 * Integrates with WebSocket for real-time push status updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@services/api';

// Types matching the backend v2 API
export type Action = 'CREATE' | 'UPDATE' | 'DELETE';
export type Target = 'd1cv' | 'ai-agent' | 'both';
export type EntityType = 'technology' | 'project' | 'experience' | 'education';
export type CommitStatus = 'pending' | 'applied_d1cv' | 'applied_ai' | 'applied_all' | 'failed';

export interface StagedChange {
    id: string;
    entity_type: EntityType;
    entity_id: string | null;
    stable_id: string | null;
    action: Action;
    target: Target;
    payload: string | null;
    commit_id: string | null;
    created_at: string;
}

export interface Commit {
    id: string;
    message: string;
    status: CommitStatus;
    target: Target;
    error_message: string | null;
    error_target: string | null;
    created_by: string | null;
    created_at: string;
    applied_at: string | null;
    applied_by: string | null;
}

export interface CommitWithChanges extends Commit {
    changes: StagedChange[];
}

export interface StageChangeRequest {
    entity_type: EntityType;
    entity_id?: string;
    stable_id?: string;
    action: Action;
    target: Target;
    payload?: Record<string, unknown>;
}

export interface CreateCommitRequest {
    message: string;
    target?: Target;
    change_ids?: string[];
}

export interface PushRequest {
    commit_id: string;
}

export interface PushResponse {
    success: boolean;
    job_id: string;
    async?: boolean;
    result?: {
        inserted: number;
        updated: number;
        deleted: number;
    };
    message: string;
}

export interface StagingStats {
    uncommitted: number;
    pending_commits: number;
    applied_d1cv: number;
    applied_all: number;
    failed: number;
}

/**
 * Response from the original /staged endpoint
 */
export interface StagedD1CVItem {
    id: number;
    operation: string;
    entity_type: string;
    entity_id: number | null;
    payload: string;
    status: string;
    created_at: string;
    applied_at: string | null;
    error_message: string | null;
}

export interface OriginalStagedResponse {
    d1cv: StagedD1CVItem[];
    ai: unknown[];
    counts: {
        d1cv: { pending: number; applied: number; failed: number; skipped: number };
        ai: { pending: number; applied: number; failed: number; skipped: number };
    };
}

/**
 * Fetch pending staged D1CV changes (original staging system)
 * This is what useStageTechnology writes to
 */
export function usePendingStagedD1CV() {
    return useQuery<StagedD1CVItem[]>({
        queryKey: ['staged', 'd1cv'],
        queryFn: async () => {
            const response = await apiClient.get<OriginalStagedResponse>('/staged');
            // Only return pending items
            return (response.d1cv || []).filter(item => item.status === 'pending');
        },
        staleTime: 1000 * 10, // 10 seconds
    });
}

/**
 * Fetch all uncommitted staged changes (v2 git-like workflow)
 */
export function useUncommittedChanges() {
    return useQuery<StagedChange[]>({
        queryKey: ['v2', 'staged'],
        queryFn: async () => {
            const response = await apiClient.get<{ changes: StagedChange[]; count: number }>('/v2/staged');
            return response.changes || [];
        },
        staleTime: 1000 * 10, // 10 seconds
    });
}

/**
 * Fetch all commits with optional status filter
 */
export function useCommits(status?: CommitStatus) {
    return useQuery<Commit[]>({
        queryKey: ['v2', 'commits', status],
        queryFn: () => apiClient.get(`/v2/commits${status ? `?status=${status}` : ''}`),
        staleTime: 1000 * 30,
    });
}

/**
 * Fetch a single commit with its changes
 */
export function useCommitDetails(commitId: string | null) {
    return useQuery<CommitWithChanges>({
        queryKey: ['v2', 'commits', commitId],
        queryFn: () => apiClient.get(`/v2/commits/${commitId}`),
        enabled: !!commitId,
        staleTime: 1000 * 30,
    });
}

/**
 * Fetch staging statistics
 */
export function useStagingStats() {
    return useQuery<StagingStats>({
        queryKey: ['v2', 'stats'],
        queryFn: () => apiClient.get('/v2/stats'),
        staleTime: 1000 * 10,
    });
}

/**
 * Stage a new change
 */
export function useStageChange() {
    const queryClient = useQueryClient();

    return useMutation<StagedChange, Error, StageChangeRequest>({
        mutationFn: (data) => apiClient.post('/v2/stage', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['v2', 'staged'] });
            queryClient.invalidateQueries({ queryKey: ['v2', 'stats'] });
        },
    });
}

/**
 * Delete a staged change
 */
export function useDeleteStagedChange() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: (id) => apiClient.delete(`/v2/staged/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['v2', 'staged'] });
            queryClient.invalidateQueries({ queryKey: ['v2', 'stats'] });
        },
    });
}

/**
 * Create a commit from staged changes
 */
export function useCreateCommit() {
    const queryClient = useQueryClient();

    return useMutation<Commit, Error, CreateCommitRequest>({
        mutationFn: (data) => apiClient.post('/v2/commit', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['v2', 'staged'] });
            queryClient.invalidateQueries({ queryKey: ['v2', 'commits'] });
            queryClient.invalidateQueries({ queryKey: ['v2', 'stats'] });
        },
    });
}

/**
 * Push commit to D1CV
 */
export function usePushToD1CV() {
    const queryClient = useQueryClient();

    return useMutation<PushResponse, Error, PushRequest>({
        mutationFn: (data) => apiClient.post('/v2/push/d1cv', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['v2', 'commits'] });
            queryClient.invalidateQueries({ queryKey: ['v2', 'stats'] });
            queryClient.invalidateQueries({ queryKey: ['technologies'] });
        },
    });
}

/**
 * Push commit to AI Agent
 */
export function usePushToAI() {
    const queryClient = useQueryClient();

    return useMutation<PushResponse, Error, PushRequest>({
        mutationFn: (data) => apiClient.post('/v2/push/ai', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['v2', 'commits'] });
            queryClient.invalidateQueries({ queryKey: ['v2', 'stats'] });
        },
    });
}
