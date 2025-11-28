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
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

export function SettingsPage() {
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
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Clear All Staged Changes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Remove all pending staged changes. This cannot be undone.
                </Typography>
                <Button variant="outlined" color="error" size="small">
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
                <Button variant="outlined" color="error" size="small">
                  Force Re-index
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
