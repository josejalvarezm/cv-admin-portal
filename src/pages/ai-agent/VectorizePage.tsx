/**
 * AI Agent Vectorize Page
 * 
 * View and manage the Vectorize index status.
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Refresh as RefreshIcon,
  PlayArrow as ReindexIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useVectorizeStatus, useVectorizeReindex } from '@hooks/useAIAgent';

export function AIAgentVectorizePage() {
  const [reindexDialogOpen, setReindexDialogOpen] = useState(false);
  const { data: status, isLoading, error, refetch } = useVectorizeStatus();
  const { mutate: triggerReindex, isPending: reindexing } = useVectorizeReindex();

  const handleReindex = () => {
    triggerReindex(undefined, {
      onSuccess: () => {
        setReindexDialogOpen(false);
        refetch();
      },
    });
  };

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load Vectorize status: {error.message}
        </Alert>
        <Button startIcon={<RefreshIcon />} onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Vectorize Index</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage the semantic search index for AI Agent
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<ReindexIcon />}
            onClick={() => setReindexDialogOpen(true)}
            disabled={reindexing}
          >
            Trigger Reindex
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Status Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">Index Status</Typography>
                  {status?.healthy ? (
                    <Chip icon={<SuccessIcon />} label="Healthy" color="success" />
                  ) : (
                    <Chip icon={<ErrorIcon />} label="Issues Detected" color="error" />
                  )}
                </Stack>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Index Name</Typography>
                    <Typography fontFamily="monospace">{status?.indexName || 'cv-skills'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Indexed Documents</Typography>
                    <Typography variant="h4">{status?.documentCount ?? '—'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                    <Typography>{status?.lastUpdated || '—'}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Info Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>About Vectorize</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Vectorize is Cloudflare's vector database that powers semantic search in the AI Agent chatbot.
                  When users ask questions like "What experience do you have with React?", Vectorize finds
                  relevant technologies based on meaning, not just keywords.
                </Typography>
                <Alert severity="info">
                  <strong>When to reindex:</strong>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>After adding new technologies via AI sync</li>
                    <li>After modifying AI enrichment fields (summary, action, effect, outcome)</li>
                    <li>If search results seem incorrect or outdated</li>
                  </ul>
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* Reindex Progress (if running) */}
          {reindexing && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Reindexing in Progress...</Typography>
                  <LinearProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    This may take a few minutes. Do not close this page.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Reindex Confirmation Dialog */}
      <Dialog open={reindexDialogOpen} onClose={() => setReindexDialogOpen(false)}>
        <DialogTitle>Trigger Full Reindex?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will regenerate embeddings for all technologies in the AI Agent database
            and update the Vectorize index. This operation:
          </DialogContentText>
          <ul>
            <li>May take 2-5 minutes to complete</li>
            <li>Will temporarily affect search quality</li>
            <li>Uses AI quota for embedding generation</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReindexDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReindex} color="warning" variant="contained" disabled={reindexing}>
            {reindexing ? 'Reindexing...' : 'Start Reindex'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
