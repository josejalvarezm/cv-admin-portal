/**
 * SimilarTechAlert Component - Single Responsibility Principle (SRP)
 * 
 * This component has one job: display similar technologies found
 * and allow the user to choose to use one of them.
 */

import {
  Alert,
  Collapse,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import type { SimilarTechnology } from '@/types';

interface SimilarTechAlertProps {
  show: boolean;
  loading: boolean;
  similarTechs: SimilarTechnology[] | undefined;
  onUseSimilar: (tech: SimilarTechnology) => void;
  onDismiss: () => void;
}

export function SimilarTechAlert({
  show,
  loading,
  similarTechs,
  onUseSimilar,
  onDismiss,
}: SimilarTechAlertProps) {
  const shouldShow = show && !loading && similarTechs && similarTechs.length > 0;

  return (
    <Collapse in={shouldShow}>
      <Alert
        severity="warning"
        sx={{ mb: 3 }}
        onClose={onDismiss}
      >
        <Typography variant="subtitle2" gutterBottom>
          Similar technologies found in AI Agent:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
          {similarTechs?.map((similar) => (
            <Chip
              key={similar.stable_id}
              label={`${similar.name} (${Math.round(similar.score * 100)}%)`}
              variant="outlined"
              onClick={() => onUseSimilar(similar)}
              onDelete={() => onUseSimilar(similar)}
              deleteIcon={<Typography variant="caption">Use</Typography>}
              sx={{ mb: 1 }}
            />
          ))}
        </Stack>
      </Alert>
    </Collapse>
  );
}
