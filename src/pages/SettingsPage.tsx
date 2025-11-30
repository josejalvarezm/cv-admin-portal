import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@services/api';

export function SettingsPage() {
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [reindexDialogOpen, setReindexDialogOpen] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const clearStagedMutation = useMutation({
    mutationFn: () => apiClient.delete<{ deleted?: { d1cv: number; ai: number } }>('/api/staged'),
    onSuccess: (data) => {
      setClearDialogOpen(false);
      const d1cv = data.deleted?.d1cv ?? 0;
      const ai = data.deleted?.ai ?? 0;
      setResultMessage({ type: 'success', text: `Cleared ${d1cv + ai} staged changes (${d1cv} D1CV, ${ai} AI)` });
    },
    onError: (error: Error) => {
      setClearDialogOpen(false);
      setResultMessage({ type: 'error', text: error.message });
    },
  });

  const reindexMutation = useMutation({
    mutationFn: () => apiClient.post<{ success: boolean; message: string }>('/api/ai-agent/vectorize/reindex', {}),
    onSuccess: () => {
      setReindexDialogOpen(false);
      setResultMessage({ type: 'success', text: 'Reindex triggered successfully. This will take ~5 minutes.' });
    },
    onError: (error: Error) => {
      setReindexDialogOpen(false);
      setResultMessage({ type: 'error', text: error.message });
    },
  });

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Settings
      </Typography>

      <Stack spacing={3}>
        {/* API Configuration */}
        <Card>
          <CardHeader title="API Configuration" />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="D1CV API URL"
                defaultValue="https://api.d1.worker.{YOUR_DOMAIN}"
                disabled
                helperText="Read-only. Configure via environment variables."
              />
              <TextField
                fullWidth
                label="cv-ai-agent API URL"
                defaultValue="https://cv-ai-agent.{YOUR_DOMAIN}"
                disabled
                helperText="Read-only. Configure via environment variables."
              />
              <TextField
                fullWidth
                label="Admin Worker API URL"
                defaultValue="https://api.admin.{YOUR_DOMAIN}"
                disabled
                helperText="Read-only. Configure via environment variables."
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Sync Settings */}
        <Card>
          <CardHeader title="Sync Settings" />
          <CardContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              These settings control how changes are synchronized between databases.
            </Alert>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Similarity Threshold (%)"
                type="number"
                defaultValue={70}
                helperText="Minimum similarity score to show as 'similar technology'"
              />
              <TextField
                fullWidth
                label="Auto-apply D1CV delay (seconds)"
                type="number"
                defaultValue={0}
                helperText="Delay before auto-applying D1CV changes. 0 = immediate."
              />
            </Stack>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />}>
                Save Settings
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card sx={{ borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
          <CardHeader
            title="Danger Zone"
            sx={{ color: 'error.main' }}
          />
          <CardContent>
            {resultMessage && (
              <Alert
                severity={resultMessage.type}
                sx={{ mb: 2 }}
                onClose={() => setResultMessage(null)}
              >
                {resultMessage.text}
              </Alert>
            )}
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Clear All Staged Changes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Remove all pending staged changes. This cannot be undone.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => setClearDialogOpen(true)}
                >
                  Clear Staged
                </Button>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Force Re-index AI Agent
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Trigger a full re-index of all technologies in the AI Agent. Takes ~5 minutes.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() => setReindexDialogOpen(true)}
                >
                  Force Re-index
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Clear Staged Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => !clearStagedMutation.isPending && setClearDialogOpen(false)}>
        <DialogTitle>Clear All Staged Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently remove all pending staged changes from both the D1CV and AI Agent queues.
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)} disabled={clearStagedMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => clearStagedMutation.mutate()}
            color="error"
            variant="contained"
            disabled={clearStagedMutation.isPending}
            startIcon={clearStagedMutation.isPending ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reindex Confirmation Dialog */}
      <Dialog open={reindexDialogOpen} onClose={() => !reindexMutation.isPending && setReindexDialogOpen(false)}>
        <DialogTitle>Force Re-index AI Agent?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will trigger a full re-index of all technologies in the AI Agent's vector database.
            This process takes approximately 5 minutes and will regenerate all embeddings.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReindexDialogOpen(false)} disabled={reindexMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => reindexMutation.mutate()}
            color="error"
            variant="contained"
            disabled={reindexMutation.isPending}
            startIcon={reindexMutation.isPending ? <CircularProgress size={20} /> : <RefreshIcon />}
          >
            Start Re-index
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
