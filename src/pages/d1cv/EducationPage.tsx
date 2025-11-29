/**
 * D1CV Education Page
 * 
 * Displays education data from D1CV database using normalized tables.
 */

import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useD1CVEducation, useDeleteEducation } from '@hooks/useD1CV';

export function D1CVEducationPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useD1CVEducation();
  const deleteMutation = useDeleteEducation();

  const education = data?.education;

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load education: {error.message}
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
          <Typography variant="h4">D1CV Education</Typography>
          <Typography variant="body2" color="text.secondary">
            Education & certifications from the portfolio database
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/d1cv/education/new')}
          >
            Add Education
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : !education ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Education Data
            </Typography>
            <Typography color="text.secondary">
              No education entries found in the database.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <SchoolIcon color="primary" sx={{ fontSize: 40, mt: 0.5 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {education.institution}
                    </Typography>
                    {education.degree && (
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {education.degree}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/d1cv/education/${education.id}`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm(`Delete education at ${education.institution}?`)) {
                            deleteMutation.mutate(education.id!);
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
                {education.location && (
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {education.location}
                    </Typography>
                  </Stack>
                )}
                
                {education.focusAreas && education.focusAreas.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Focus Areas
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {education.focusAreas.map((area, index) => (
                        <Chip
                          key={index}
                          label={area}
                          color="primary"
                          variant="outlined"
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </>
                )}

                {education.description && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      {education.description}
                    </Typography>
                  </>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
