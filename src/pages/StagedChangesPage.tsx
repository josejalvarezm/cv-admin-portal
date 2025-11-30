import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PlayArrow as ApplyIcon,
  SyncAlt as SyncIcon,
  Visibility as ViewIcon,
  ClearAll as ClearCacheIcon,
} from '@mui/icons-material';
import { useStagedChanges, useApplyD1CV, useApplyAI, usePurgeD1CVCache } from '@hooks/useStagedChanges';
import type { StagedChange } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  applied: 'success',
  failed: 'error',
  skipped: 'default',
};

const OP_ICONS: Record<string, string> = {
  INSERT: '✚',
  UPDATE: '✏',
  DELETE: '🗑',
};

export function StagedChangesPage() {
  const [tab, setTab] = useState(0);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ step: number; message: string } | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedChange, setSelectedChange] = useState<StagedChange | null>(null);

  const { data: stagedChanges, isLoading, refetch } = useStagedChanges();
  const { mutate: applyD1CV, isPending: applyingD1CV } = useApplyD1CV();
  const { mutate: applyAI, isPending: applyingAI } = useApplyAI();
  const { mutate: purgeCache, isPending: purgingCache } = usePurgeD1CVCache();

  const d1cvChanges = stagedChanges?.d1cv || [];
  const aiChanges = stagedChanges?.ai || [];
  const pendingD1CV = d1cvChanges.filter((c) => c.status === 'pending');
  const pendingAI = aiChanges.filter((c) => c.status === 'pending');

  const handleApplyD1CV = () => {
    applyD1CV(undefined, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleViewDetails = (change: StagedChange) => {
    setSelectedChange(change);
    setDetailsDialogOpen(true);
  };

  const handleSyncAI = () => {
    setSyncDialogOpen(true);
  };

  const confirmSyncAI = () => {
    setSyncProgress({ step: 1, message: 'Applying changes to D1...' });

    applyAI(undefined, {
      onSuccess: () => {
        setSyncProgress(null);
        setSyncDialogOpen(false);
        refetch();
      },
      onError: () => {
        setSyncProgress(null);
      },
    });

    // Simulate progress updates (in real impl, use WebSocket or polling)
    setTimeout(() => setSyncProgress({ step: 2, message: 'Generating embeddings...' }), 2000);
    setTimeout(() => setSyncProgress({ step: 3, message: 'Updating vector index...' }), 5000);
    setTimeout(() => setSyncProgress({ step: 4, message: 'Verifying sync...' }), 8000);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Staged Changes</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="warning"
            startIcon={purgingCache ? <CircularProgress size={20} /> : <ClearCacheIcon />}
            onClick={() => purgeCache()}
            disabled={purgingCache}
          >
            Refresh Portfolio Cache
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* Summary Alert */}
      {(pendingD1CV.length > 0 || pendingAI.length > 0) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have {pendingD1CV.length} pending portfolio changes and {pendingAI.length} pending AI sync changes.
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <CardHeader
          title={
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>📦 Portfolio Queue</span>
                    {pendingD1CV.length > 0 && (
                      <Chip label={pendingD1CV.length} size="small" color="warning" />
                    )}
                  </Stack>
                }
              />
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>🤖 AI Agent Queue</span>
                    {pendingAI.length > 0 && (
                      <Chip label={pendingAI.length} size="small" color="warning" />
                    )}
                  </Stack>
                }
              />
            </Tabs>
          }
          action={
            tab === 0 ? (
              <Button
                variant="contained"
                startIcon={applyingD1CV ? <CircularProgress size={20} /> : <ApplyIcon />}
                disabled={pendingD1CV.length === 0 || applyingD1CV}
                onClick={handleApplyD1CV}
              >
                Apply to Portfolio
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SyncIcon />}
                disabled={pendingAI.length === 0 || applyingAI}
                onClick={handleSyncAI}
              >
                Sync to AI (~3 min)
              </Button>
            )
          }
        />
        <CardContent>
          {/* D1CV Tab */}
          <TabPanel value={tab} index={0}>
            <StagedTable changes={d1cvChanges} showReindex={false} onViewDetails={handleViewDetails} />
          </TabPanel>

          {/* AI Tab */}
          <TabPanel value={tab} index={1}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              AI sync is resource-intensive. It generates embeddings and updates the vector index.
              Only sync when you have accumulated changes.
            </Alert>
            <StagedTable changes={aiChanges} showReindex onViewDetails={handleViewDetails} />
          </TabPanel>
        </CardContent>
      </Card>

      {/* AI Sync Dialog */}
      <Dialog open={syncDialogOpen} onClose={() => !applyingAI && setSyncDialogOpen(false)}>
        <DialogTitle>Sync to AI Agent</DialogTitle>
        <DialogContent>
          {!syncProgress ? (
            <DialogContentText>
              This will apply {pendingAI.length} changes to the AI Agent database and trigger re-indexing.
              This process takes approximately 2-3 minutes.
              <br /><br />
              <strong>Do not close this window during sync.</strong>
            </DialogContentText>
          ) : (
            <Box sx={{ minWidth: 300 }}>
              <Stack spacing={2}>
                {[1, 2, 3, 4].map((step) => (
                  <Stack key={step} direction="row" spacing={2} alignItems="center">
                    {syncProgress.step > step ? (
                      <Chip label="✓" size="small" color="success" />
                    ) : syncProgress.step === step ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Chip label="○" size="small" variant="outlined" />
                    )}
                    <Typography
                      color={syncProgress.step >= step ? 'text.primary' : 'text.secondary'}
                    >
                      {step === 1 && 'Applying changes to D1'}
                      {step === 2 && 'Generating embeddings'}
                      {step === 3 && 'Updating vector index'}
                      {step === 4 && 'Verifying sync'}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(syncProgress.step / 4) * 100}
                sx={{ mt: 3 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialogOpen(false)} disabled={applyingAI}>
            Cancel
          </Button>
          {!syncProgress && (
            <Button onClick={confirmSyncAI} variant="contained" color="secondary">
              Start Sync
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedChange && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h6">
                {OP_ICONS[selectedChange.operation]} {selectedChange.operation} {selectedChange.entity_type}
              </Typography>
              <Chip
                label={selectedChange.status}
                size="small"
                color={STATUS_COLORS[selectedChange.status] || 'default'}
              />
            </Stack>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedChange && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Staged: {new Date(selectedChange.created_at).toLocaleString()}
              </Typography>
              {selectedChange.stable_id && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Stable ID:</strong> {selectedChange.stable_id}
                </Typography>
              )}
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Payload:
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  maxHeight: 400,
                }}
              >
                {JSON.stringify(selectedChange.payload, null, 2)}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

interface StagedTableProps {
  changes: StagedChange[];
  showReindex: boolean;
  onViewDetails: (change: StagedChange) => void;
}

function StagedTable({ changes, showReindex, onViewDetails }: StagedTableProps) {
  if (changes.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No staged changes</Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Op</TableCell>
            <TableCell>Entity</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
            {showReindex && <TableCell>Reindex</TableCell>}
            <TableCell>Staged</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {changes.map((change) => (
            <TableRow key={change.id}>
              <TableCell>
                <Typography>{OP_ICONS[change.operation] || '?'}</Typography>
              </TableCell>
              <TableCell>{change.entity_type}</TableCell>
              <TableCell>
                <Typography fontWeight={500}>
                  {(change.payload?.name as string) || change.stable_id || '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={change.status}
                  size="small"
                  color={STATUS_COLORS[change.status] || 'default'}
                />
              </TableCell>
              {showReindex && (
                <TableCell>
                  {change.requires_reindex ? (
                    <Chip label="Yes" size="small" variant="outlined" />
                  ) : (
                    '—'
                  )}
                </TableCell>
              )}
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {new Date(change.created_at).toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" title="View details" onClick={() => onViewDetails(change)}>
                  <ViewIcon fontSize="small" />
                </IconButton>
                {change.status === 'pending' && (
                  <IconButton size="small" title="Delete" color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
