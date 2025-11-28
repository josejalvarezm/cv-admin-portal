/**
 * AI Agent Technology Detail Page
 * 
 * View and manage a single technology's AI enrichment data.
 */

import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  Breadcrumbs,
  Link,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ArrowBack as BackIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAIAgentTechnology } from '@hooks/useAIAgent';

export function AIAgentTechnologyDetailPage() {
  const { stableId } = useParams<{ stableId: string }>();
  const navigate = useNavigate();
  const { data: technology, isLoading, error } = useAIAgentTechnology(stableId);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load technology: {error.message}
      </Alert>
    );
  }

  if (!technology) {
    return (
      <Alert severity="warning">
        Technology not found: {stableId}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/ai-agent/technologies')}
        >
          AI Agent Technologies
        </Link>
        <Typography color="text.primary">{technology.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">{technology.name}</Typography>
          <Typography variant="body2" fontFamily="monospace" color="text.secondary">
            stable_id: {technology.stable_id}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/ai-agent/technologies')}
          >
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              // Find the D1CV ID and navigate to edit there
              // For now, show an info message
              alert('To edit AI enrichment data, edit the technology in D1CV Technologies');
            }}
          >
            Edit via D1CV
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography>{technology.category || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Experience</Typography>
                  <Typography>{technology.experience || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Level</Typography>
                  <Chip label={technology.level} size="small" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Proficiency</Typography>
                  <Typography>{technology.proficiency_percent}%</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Recency</Typography>
                  <Chip
                    label={technology.recency || 'Not set'}
                    size="small"
                    color={
                      technology.recency === 'current' ? 'success' :
                      technology.recency === 'recent' ? 'primary' : 'default'
                    }
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Enrichment */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🤖 AI Enrichment
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Summary</Typography>
                  <Typography>{technology.summary || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Related Project</Typography>
                  <Typography>{technology.related_project || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Employer</Typography>
                  <Typography>{technology.employer || '—'}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Outcomes */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Outcome-Driven Fields
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These fields help the AI provide context-rich responses about your experience
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="primary">Action</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    What you did with this technology
                  </Typography>
                  <Typography>{technology.action || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="primary">Effect</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Technical or operational result
                  </Typography>
                  <Typography>{technology.effect || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="primary">Outcome</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Business impact
                  </Typography>
                  <Typography>{technology.outcome || '—'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
