/**
 * D1CV Education Form Page
 * 
 * Create or edit education entries with focus areas.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useD1CVEducation, useCreateEducation, useUpdateEducation, type EducationInput } from '@hooks/useD1CV';

interface EducationForm {
  institution: string;
  degree: string;
  location: string;
  start_year: string;
  end_year: string;
  description: string;
  display_order: number;
  focus_areas: string[];
}

const emptyForm: EducationForm = {
  institution: '',
  degree: '',
  location: '',
  start_year: '',
  end_year: '',
  description: '',
  display_order: 0,
  focus_areas: [],
};

export function EducationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== undefined;

  const [form, setForm] = useState<EducationForm>(emptyForm);
  const [newFocusArea, setNewFocusArea] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data } = useD1CVEducation();
  const createMutation = useCreateEducation();
  const updateMutation = useUpdateEducation();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Load existing education for editing
  useEffect(() => {
    if (isEditing && data?.education) {
      const education = data.education;
      if (education.id === parseInt(id, 10)) {
        setForm({
          institution: education.institution || '',
          degree: education.degree || '',
          location: education.location || '',
          start_year: education.start_year || '',
          end_year: education.end_year || '',
          description: education.description || '',
          display_order: education.display_order || 0,
          focus_areas: education.focusAreas || [],
        });
      }
    }
  }, [isEditing, id, data]);

  const handleChange = (field: keyof EducationForm) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleAddFocusArea = () => {
    if (newFocusArea.trim() && !form.focus_areas.includes(newFocusArea.trim())) {
      setForm(prev => ({
        ...prev,
        focus_areas: [...prev.focus_areas, newFocusArea.trim()],
      }));
      setNewFocusArea('');
    }
  };

  const handleRemoveFocusArea = (area: string) => {
    setForm(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.filter(a => a !== area),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Validation
    if (!form.institution.trim()) {
      setError('Institution is required.');
      return;
    }

    const payload: EducationInput = {
      institution: form.institution.trim(),
      degree: form.degree.trim() || undefined,
      location: form.location.trim() || undefined,
      start_year: form.start_year.trim() || undefined,
      end_year: form.end_year.trim() || undefined,
      description: form.description.trim() || undefined,
      display_order: form.display_order,
      focus_areas: form.focus_areas,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: parseInt(id, 10), data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigate('/d1cv/education');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save education');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/d1cv/education')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4">
          {isEditing ? 'Edit Education' : 'Add Education'}
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Education Details
            </Typography>
            
            <Stack spacing={2}>
              <TextField
                label="Institution"
                value={form.institution}
                onChange={handleChange('institution')}
                required
                fullWidth
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Degree"
                  value={form.degree}
                  onChange={handleChange('degree')}
                  fullWidth
                />
                <TextField
                  label="Location"
                  value={form.location}
                  onChange={handleChange('location')}
                  fullWidth
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Start Year"
                  value={form.start_year}
                  onChange={handleChange('start_year')}
                  fullWidth
                  placeholder="e.g., 2018"
                />
                <TextField
                  label="End Year"
                  value={form.end_year}
                  onChange={handleChange('end_year')}
                  fullWidth
                  placeholder="e.g., 2022"
                />
              </Stack>

              <TextField
                label="Description"
                value={form.description}
                onChange={handleChange('description')}
                multiline
                rows={3}
                fullWidth
              />

              <TextField
                label="Display Order"
                type="number"
                value={form.display_order}
                onChange={handleChange('display_order')}
                sx={{ maxWidth: 200 }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Focus Areas
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                label="Add Focus Area"
                value={newFocusArea}
                onChange={(e) => setNewFocusArea(e.target.value)}
                size="small"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFocusArea())}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddFocusArea}
                disabled={!newFocusArea.trim()}
              >
                Add
              </Button>
            </Stack>

            {form.focus_areas.length === 0 ? (
              <Typography color="text.secondary">
                No focus areas added yet.
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {form.focus_areas.map((area, index) => (
                  <Chip
                    key={index}
                    label={area}
                    onDelete={() => handleRemoveFocusArea(area)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => navigate('/d1cv/education')}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
