/**
 * D1CV Experience Form Page
 * 
 * Create or edit work experience entries with nested categories and achievements.
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
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Paper,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useD1CVExperience, useCreateExperience, useUpdateExperience, type ExperienceInput } from '@hooks/useD1CV';

interface CategoryForm {
  title: string;
  achievements: { title: string; description: string }[];
}

interface ExperienceForm {
  company: string;
  location: string;
  role: string;
  period: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  reporting_to: string;
  operating_level: string;
  description: string;
  technologies: string;
  display_order: number;
  categories: CategoryForm[];
}

const emptyForm: ExperienceForm = {
  company: '',
  location: '',
  role: '',
  period: '',
  start_date: '',
  end_date: '',
  is_current: false,
  reporting_to: '',
  operating_level: '',
  description: '',
  technologies: '',
  display_order: 0,
  categories: [],
};

export function ExperienceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== undefined;

  const [form, setForm] = useState<ExperienceForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data } = useD1CVExperience();
  const createMutation = useCreateExperience();
  const updateMutation = useUpdateExperience();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Load existing experience for editing
  useEffect(() => {
    if (isEditing && data?.experiences) {
      const experience = data.experiences.find(exp => exp.id === parseInt(id, 10));
      if (experience) {
        setForm({
          company: experience.company || '',
          location: experience.location || '',
          role: experience.role || '',
          period: experience.period || '',
          start_date: '',
          end_date: '',
          is_current: experience.period?.toLowerCase().includes('present') || false,
          reporting_to: experience.reporting || '',
          operating_level: experience.operatingLevel || '',
          description: experience.description || '',
          technologies: experience.technologies || '',
          display_order: experience.display_order || 0,
          categories: experience.categories?.map(cat => ({
            title: cat.title,
            achievements: cat.achievements || [],
          })) || [],
        });
      }
    }
  }, [isEditing, id, data]);

  const handleChange = (field: keyof ExperienceForm) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCategory = () => {
    setForm(prev => ({
      ...prev,
      categories: [...prev.categories, { title: '', achievements: [] }],
    }));
  };

  const handleRemoveCategory = (index: number) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  const handleCategoryChange = (index: number, title: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, title } : cat
      ),
    }));
  };

  const handleAddAchievement = (categoryIndex: number) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === categoryIndex
          ? { ...cat, achievements: [...cat.achievements, { title: '', description: '' }] }
          : cat
      ),
    }));
  };

  const handleRemoveAchievement = (categoryIndex: number, achievementIndex: number) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === categoryIndex
          ? { ...cat, achievements: cat.achievements.filter((_, ai) => ai !== achievementIndex) }
          : cat
      ),
    }));
  };

  const handleAchievementChange = (
    categoryIndex: number,
    achievementIndex: number,
    field: 'title' | 'description',
    value: string
  ) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === categoryIndex
          ? {
              ...cat,
              achievements: cat.achievements.map((ach, ai) =>
                ai === achievementIndex ? { ...ach, [field]: value } : ach
              ),
            }
          : cat
      ),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Validation
    if (!form.company.trim() || !form.role.trim() || !form.period.trim()) {
      setError('Company, Role, and Period are required fields.');
      return;
    }

    const payload: ExperienceInput = {
      company: form.company.trim(),
      location: form.location.trim() || undefined,
      role: form.role.trim(),
      period: form.period.trim(),
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      is_current: form.is_current,
      reporting_to: form.reporting_to.trim() || undefined,
      operating_level: form.operating_level.trim() || undefined,
      description: form.description.trim() || undefined,
      technologies: form.technologies.trim() || undefined,
      display_order: form.display_order,
      categories: form.categories.map((cat, catIdx) => ({
        title: cat.title.trim(),
        display_order: catIdx,
        achievements: cat.achievements.map((ach, achIdx) => ({
          title: ach.title.trim(),
          description: ach.description.trim(),
          display_order: achIdx,
        })).filter(a => a.title || a.description),
      })).filter(c => c.title),
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: parseInt(id, 10), data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigate('/d1cv/experience');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save experience');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/d1cv/experience')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4">
          {isEditing ? 'Edit Experience' : 'Add Experience'}
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
              Basic Information
            </Typography>
            
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Company"
                  value={form.company}
                  onChange={handleChange('company')}
                  required
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
                  label="Role"
                  value={form.role}
                  onChange={handleChange('role')}
                  required
                  fullWidth
                />
                <TextField
                  label="Period"
                  value={form.period}
                  onChange={handleChange('period')}
                  required
                  fullWidth
                  placeholder="e.g., 2020-2023 or Jan 2020 - Present"
                />
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_current}
                    onChange={handleChange('is_current')}
                  />
                }
                label="Currently working here"
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Reporting To"
                  value={form.reporting_to}
                  onChange={handleChange('reporting_to')}
                  fullWidth
                />
                <TextField
                  label="Operating Level"
                  value={form.operating_level}
                  onChange={handleChange('operating_level')}
                  fullWidth
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
                label="Technologies"
                value={form.technologies}
                onChange={handleChange('technologies')}
                fullWidth
                placeholder="Comma-separated list of technologies used"
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Achievement Categories
              </Typography>
              <Button startIcon={<AddIcon />} onClick={handleAddCategory} size="small">
                Add Category
              </Button>
            </Stack>

            {form.categories.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No categories added yet. Click "Add Category" to add achievement categories.
              </Typography>
            ) : (
              <Stack spacing={3}>
                {form.categories.map((category, catIdx) => (
                  <Paper key={catIdx} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <TextField
                        label="Category Title"
                        value={category.title}
                        onChange={(e) => handleCategoryChange(catIdx, e.target.value)}
                        fullWidth
                        size="small"
                        placeholder="e.g., Project Management, Technical Achievements"
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveCategory(catIdx)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Achievements</Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddAchievement(catIdx)}
                      >
                        Add Achievement
                      </Button>
                    </Stack>

                    {category.achievements.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No achievements yet.
                      </Typography>
                    ) : (
                      <Stack spacing={2}>
                        {category.achievements.map((ach, achIdx) => (
                          <Box key={achIdx} sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                              <Box sx={{ flex: 1 }}>
                                <TextField
                                  label="Title"
                                  value={ach.title}
                                  onChange={(e) => handleAchievementChange(catIdx, achIdx, 'title', e.target.value)}
                                  fullWidth
                                  size="small"
                                  sx={{ mb: 1 }}
                                />
                                <TextField
                                  label="Description"
                                  value={ach.description}
                                  onChange={(e) => handleAchievementChange(catIdx, achIdx, 'description', e.target.value)}
                                  fullWidth
                                  size="small"
                                  multiline
                                  rows={2}
                                />
                              </Box>
                              <IconButton
                                color="error"
                                onClick={() => handleRemoveAchievement(catIdx, achIdx)}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => navigate('/d1cv/experience')}>
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
