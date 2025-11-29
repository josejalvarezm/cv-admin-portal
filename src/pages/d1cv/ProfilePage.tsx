/**
 * D1CV Profile Page
 * 
 * Edit profile information including summary and key achievements.
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useD1CVProfile, useUpdateProfile, type ProfileInput } from '@hooks/useD1CV';

interface ProfileForm {
  title: string;
  summary: string;
  key_achievements: string[];
}

const emptyForm: ProfileForm = {
  title: '',
  summary: '',
  key_achievements: [],
};

export function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [newAchievement, setNewAchievement] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data, isLoading, refetch } = useD1CVProfile();
  const updateMutation = useUpdateProfile();

  const isSaving = updateMutation.isPending;

  // Load existing profile
  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || '',
        summary: data.summary || '',
        key_achievements: data.keyAchievements || [],
      });
    }
  }, [data]);

  const handleChange = (field: keyof ProfileForm) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
    setSuccess(null);
  };

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      setForm(prev => ({
        ...prev,
        key_achievements: [...prev.key_achievements, newAchievement.trim()],
      }));
      setNewAchievement('');
      setSuccess(null);
    }
  };

  const handleRemoveAchievement = (index: number) => {
    setForm(prev => ({
      ...prev,
      key_achievements: prev.key_achievements.filter((_, i) => i !== index),
    }));
    setSuccess(null);
  };

  const handleEditAchievement = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      key_achievements: prev.key_achievements.map((a, i) => i === index ? value : a),
    }));
    setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const payload: ProfileInput = {
      title: form.title.trim() || undefined,
      summary: form.summary.trim() || undefined,
      key_achievements: form.key_achievements.filter(a => a.trim()),
    };

    try {
      await updateMutation.mutateAsync(payload);
      setSuccess('Profile saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Profile</Typography>
        <Button startIcon={<RefreshIcon />} onClick={() => refetch()}>
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Profile Summary</Typography>
            
            <Stack spacing={2}>
              <TextField
                label="Professional Title"
                value={form.title}
                onChange={handleChange('title')}
                fullWidth
                placeholder="e.g., Senior Software Engineer"
              />

              <TextField
                label="Summary"
                value={form.summary}
                onChange={handleChange('summary')}
                multiline
                rows={6}
                fullWidth
                placeholder="Your professional summary..."
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Key Achievements</Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                label="Add Achievement"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                fullWidth
                size="small"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())}
                placeholder="e.g., Led team of 5 engineers to deliver project on time"
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddAchievement}
                disabled={!newAchievement.trim()}
              >
                Add
              </Button>
            </Stack>

            {form.key_achievements.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No achievements added yet. Add your key professional achievements above.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {form.key_achievements.map((achievement, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        label={index + 1}
                        size="small"
                        color="primary"
                        sx={{ minWidth: 32 }}
                      />
                      <TextField
                        value={achievement}
                        onChange={(e) => handleEditAchievement(index, e.target.value)}
                        fullWidth
                        size="small"
                        variant="standard"
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveAchievement(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
