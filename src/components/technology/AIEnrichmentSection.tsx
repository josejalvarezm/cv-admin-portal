/**
 * AIEnrichmentSection Component - Single Responsibility Principle (SRP)
 * 
 * This component handles the AI-enrichment fields of the technology form.
 * These fields improve chatbot responses and require manual sync.
 */

import { Control, Controller } from 'react-hook-form';
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  MenuItem,
  Alert,
  Collapse,
  IconButton,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import { RECENCY_OPTIONS } from '@/constants';
import { useAICategories } from '@/hooks/useAICategories';
import type { TechnologyFormData } from '@/types';

interface AIEnrichmentSectionProps {
  control: Control<TechnologyFormData>;
  expanded: boolean;
  onToggleExpand: () => void;
}

export function AIEnrichmentSection({
  control,
  expanded,
  onToggleExpand,
}: AIEnrichmentSectionProps) {
  // Fetch AI categories from API with localStorage caching
  const { data: aiCategories = [], isLoading: loadingCategories } = useAICategories();

  return (
    <Card>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <SmartToyIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" component="span">AI Enrichment</Typography>
          </Stack>
        }
        subheader="Strongly suggested fields to improve chatbot responses"
        action={
          <IconButton onClick={onToggleExpand} aria-label={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        sx={{ cursor: 'pointer' }}
        onClick={onToggleExpand}
      />
      <Collapse in={expanded}>
        <CardContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Fill these fields to improve how the AI chatbot responds about this technology.
            Changes require manual sync to the AI Agent.
          </Alert>

          <Grid container spacing={3}>
            {/* AI Category Field */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="ai_category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="AI Category (for semantic search)"
                    disabled={loadingCategories}
                  >
                    <MenuItem value="">
                      <em>{loadingCategories ? 'Loading...' : 'Select category...'}</em>
                    </MenuItem>
                    {aiCategories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Recency Field - moved up next to category */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="recency"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth select label="Recency">
                    {RECENCY_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Summary Field */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="summary"
                control={control}
                rules={{
                  maxLength: { value: 1000, message: 'Summary must be 1000 characters or less' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="Summary"
                    placeholder="Brief description of your experience with this technology..."
                  />
                )}
              />
            </Grid>

            {/* Action Field */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="action"
                control={control}
                rules={{
                  maxLength: { value: 500, message: 'Action must be 500 characters or less' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Action (What you did)"
                    placeholder="e.g., Led migration from AngularJS to Angular 14+"
                  />
                )}
              />
            </Grid>

            {/* Effect Field */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="effect"
                control={control}
                rules={{
                  maxLength: { value: 500, message: 'Effect must be 500 characters or less' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Effect (Technical result)"
                    placeholder="e.g., Improved code maintainability and test coverage"
                  />
                )}
              />
            </Grid>

            {/* Outcome Field */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="outcome"
                control={control}
                rules={{
                  maxLength: { value: 500, message: 'Outcome must be 500 characters or less' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Outcome (Business impact)"
                    placeholder="e.g., Reduced bug reports by 40%, faster feature delivery"
                  />
                )}
              />
            </Grid>

            <Divider sx={{ my: 2, width: '100%' }} />

            {/* Related Project Field */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="related_project"
                control={control}
                rules={{
                  maxLength: { value: 100, message: 'Related project must be 100 characters or less' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Related Project"
                    placeholder="e.g., Analytics Dashboard"
                  />
                )}
              />
            </Grid>

            {/* Employer Field */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="employer"
                control={control}
                rules={{
                  maxLength: { value: 100, message: 'Employer must be 100 characters or less' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Employer / Organization"
                    placeholder="e.g., Conservative Party HQ"
                  />
                )}
              />
            </Grid>

          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
}
