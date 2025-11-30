/**
 * Commits Page
 * 
 * Git-like workflow for managing staged changes:
 * 1. View uncommitted changes
 * 2. Create commits with messages
 * 3. Push commits to D1CV and AI Agent
 * 4. Real-time status via WebSocket
 */

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    Chip,
    IconButton,
    Alert,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    CircularProgress,
    Stack,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Send as SendIcon,
    CloudUpload as PushIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
    useUncommittedChanges,
    useCommits,
    useCommitDetails,
    useStagingStats,
    useDeleteStagedChangeV2,
    useCreateCommit,
    usePushToD1CV,
    usePushToAI,
    useJobWebSocket,
    type StagedChange,
    type Commit,
    type DOJobStatus,
} from '@/hooks';

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning'> = {
    pending: 'warning',
    applied_d1cv: 'primary',
    applied_ai: 'secondary',
    applied_all: 'success',
    failed: 'error',
};

const actionColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning'> = {
    CREATE: 'success',
    UPDATE: 'primary',
    DELETE: 'error',
};

function StagedChangeItem({
    change,
    onDelete,
    isDeleting,
}: {
    change: StagedChange;
    onDelete: () => void;
    isDeleting: boolean;
}) {
    return (
        <ListItem>
            <ListItemText
                primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label={change.action} color={actionColors[change.action]} />
                        <Chip size="small" label={change.entity_type} variant="outlined" />
                        <Typography variant="body1">
                            {change.stable_id || change.entity_id || 'New'}
                        </Typography>
                    </Stack>
                }
                secondary={
                    <Typography variant="caption" color="textSecondary">
                        Target: {change.target} • Created: {new Date(change.created_at).toLocaleString()}
                    </Typography>
                }
            />
            <ListItemSecondaryAction>
                <IconButton edge="end" onClick={onDelete} disabled={isDeleting}>
                    {isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    );
}

function CommitItem({
    commit,
    onPushD1CV,
    onPushAI,
    onViewDetails,
    isPushingD1CV,
    isPushingAI,
    jobStatus,
}: {
    commit: Commit;
    onPushD1CV: () => void;
    onPushAI: () => void;
    onViewDetails: () => void;
    isPushingD1CV: boolean;
    isPushingAI: boolean;
    jobStatus?: DOJobStatus;
}) {
    const canPushD1CV = commit.status === 'pending' || commit.status === 'failed';
    const canPushAI = commit.status === 'applied_d1cv' || commit.status === 'pending';

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="h6">{commit.message}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip
                            size="small"
                            label={commit.status.replace('_', ' ')}
                            color={statusColors[commit.status]}
                        />
                        <Chip size="small" label={`Target: ${commit.target}`} variant="outlined" />
                    </Stack>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Created: {new Date(commit.created_at).toLocaleString()}
                        {commit.created_by && ` by ${commit.created_by}`}
                    </Typography>
                    {commit.error_message && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            {commit.error_message}
                        </Alert>
                    )}
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" onClick={onViewDetails}>
                        Details
                    </Button>
                    {canPushD1CV && (
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={onPushD1CV}
                            disabled={isPushingD1CV}
                            startIcon={isPushingD1CV ? <CircularProgress size={16} /> : <PushIcon />}
                        >
                            Push D1CV
                        </Button>
                    )}
                    {canPushAI && (
                        <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            onClick={onPushAI}
                            disabled={isPushingAI}
                            startIcon={isPushingAI ? <CircularProgress size={16} /> : <PushIcon />}
                        >
                            Push AI
                        </Button>
                    )}
                </Stack>
            </Stack>
            {jobStatus && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                        Job Status: {jobStatus.overallStatus}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={
                            jobStatus.overallStatus === 'completed' ? 100 :
                                jobStatus.overallStatus === 'in-progress' ? 50 :
                                    jobStatus.overallStatus === 'd1cv-done' ? 75 :
                                        jobStatus.overallStatus === 'ai-done' ? 75 : 0
                        }
                        color={jobStatus.overallStatus === 'failed' ? 'error' : 'primary'}
                        sx={{ mt: 1 }}
                    />
                </Box>
            )}
        </Paper>
    );
}

function CreateCommitDialog({
    open,
    onClose,
    onSubmit,
    isLoading,
    uncommittedCount,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (message: string) => void;
    isLoading: boolean;
    uncommittedCount: number;
}) {
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (message.trim()) {
            onSubmit(message.trim());
            setMessage('');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create Commit</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    This will commit {uncommittedCount} staged change(s).
                </Typography>
                <TextField
                    autoFocus
                    label="Commit Message"
                    fullWidth
                    multiline
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g., Add React expertise, update Angular years"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!message.trim() || isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} /> : <SendIcon />}
                >
                    Commit
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function CommitsPage() {
    const [commitDialogOpen, setCommitDialogOpen] = useState(false);
    const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null);

    // Queries
    const { data: uncommittedChanges, isLoading: loadingUncommitted, refetch: refetchUncommitted } = useUncommittedChanges();
    const { data: commits, isLoading: loadingCommits, refetch: refetchCommits } = useCommits();
    const { data: stats, refetch: refetchStats } = useStagingStats();
    const { data: commitDetails } = useCommitDetails(selectedCommitId);

    // Mutations
    const deleteStagedChange = useDeleteStagedChangeV2();
    const createCommit = useCreateCommit();
    const pushToD1CV = usePushToD1CV();
    const pushToAI = usePushToAI();

    // WebSocket for real-time updates
    const { isConnected, jobStatus, subscribe } = useJobWebSocket();

    const handleCreateCommit = async (message: string) => {
        try {
            await createCommit.mutateAsync({ message });
            setCommitDialogOpen(false);
        } catch (error) {
            console.error('Failed to create commit:', error);
        }
    };

    const handlePushD1CV = async (commitId: string) => {
        const result = await pushToD1CV.mutateAsync({ commit_id: commitId });
        if (result.job_id) {
            subscribe(result.job_id);
        }
    };

    const handlePushAI = async (commitId: string) => {
        const result = await pushToAI.mutateAsync({ commit_id: commitId });
        if (result.job_id) {
            subscribe(result.job_id);
        }
    };

    const handleRefresh = () => {
        refetchUncommitted();
        refetchCommits();
        refetchStats();
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Commits</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                        size="small"
                        label={isConnected ? 'Connected' : 'Disconnected'}
                        color={isConnected ? 'success' : 'error'}
                        icon={isConnected ? <SuccessIcon /> : <ErrorIcon />}
                    />
                    <IconButton onClick={handleRefresh}>
                        <RefreshIcon />
                    </IconButton>
                </Stack>
            </Box>

            {/* Stats */}
            {stats && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Stack direction="row" spacing={4}>
                        <Box>
                            <Typography variant="h5">{stats.uncommitted}</Typography>
                            <Typography variant="caption" color="textSecondary">Uncommitted</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h5">{stats.pending_commits}</Typography>
                            <Typography variant="caption" color="textSecondary">Pending</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h5">{stats.applied_d1cv}</Typography>
                            <Typography variant="caption" color="textSecondary">D1CV Applied</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h5">{stats.applied_all}</Typography>
                            <Typography variant="caption" color="textSecondary">Fully Synced</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h5" color="error">{stats.failed}</Typography>
                            <Typography variant="caption" color="textSecondary">Failed</Typography>
                        </Box>
                    </Stack>
                </Paper>
            )}

            {/* Uncommitted Changes */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Uncommitted Changes</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCommitDialogOpen(true)}
                        disabled={!uncommittedChanges?.length}
                    >
                        Create Commit
                    </Button>
                </Box>

                {loadingUncommitted && <LinearProgress />}

                {uncommittedChanges?.length === 0 && (
                    <Typography color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                        No uncommitted changes. Make edits to see them here.
                    </Typography>
                )}

                <List>
                    {uncommittedChanges?.map((change) => (
                        <React.Fragment key={change.id}>
                            <StagedChangeItem
                                change={change}
                                onDelete={() => deleteStagedChange.mutate(change.id)}
                                isDeleting={deleteStagedChange.isPending}
                            />
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            {/* Commits List */}
            <Typography variant="h6" sx={{ mb: 2 }}>Commits</Typography>

            {loadingCommits && <LinearProgress />}

            {commits?.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                        No commits yet. Stage changes and create a commit to get started.
                    </Typography>
                </Paper>
            )}

            {commits?.map((commit) => (
                <CommitItem
                    key={commit.id}
                    commit={commit}
                    onPushD1CV={() => handlePushD1CV(commit.id)}
                    onPushAI={() => handlePushAI(commit.id)}
                    onViewDetails={() => setSelectedCommitId(commit.id)}
                    isPushingD1CV={pushToD1CV.isPending}
                    isPushingAI={pushToAI.isPending}
                    jobStatus={jobStatus.get(commit.id)}
                />
            ))}

            {/* Create Commit Dialog */}
            <CreateCommitDialog
                open={commitDialogOpen}
                onClose={() => setCommitDialogOpen(false)}
                onSubmit={handleCreateCommit}
                isLoading={createCommit.isPending}
                uncommittedCount={uncommittedChanges?.length || 0}
            />

            {/* Commit Details Dialog */}
            <Dialog
                open={!!selectedCommitId}
                onClose={() => setSelectedCommitId(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Commit Details: {commitDetails?.message}
                </DialogTitle>
                <DialogContent>
                    {commitDetails && (
                        <>
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                <Chip
                                    label={commitDetails.status.replace('_', ' ')}
                                    color={statusColors[commitDetails.status]}
                                />
                                <Chip label={`Target: ${commitDetails.target}`} variant="outlined" />
                            </Stack>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Changes:</Typography>
                            <List>
                                {commitDetails.changes?.map((change) => (
                                    <ListItem key={change.id}>
                                        <ListItemText
                                            primary={
                                                <Stack direction="row" spacing={1}>
                                                    <Chip size="small" label={change.action} color={actionColors[change.action]} />
                                                    <Typography>{change.entity_type}: {change.stable_id || change.entity_id}</Typography>
                                                </Stack>
                                            }
                                            secondary={change.payload ? JSON.stringify(JSON.parse(change.payload), null, 2).substring(0, 100) + '...' : 'No payload'}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedCommitId(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default CommitsPage;
