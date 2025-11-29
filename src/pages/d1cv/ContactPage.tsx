/**
 * D1CV Contact Page
 * 
 * Edit contact information (single record per CV).
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
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useD1CVContact, useUpdateContact, type ContactInput } from '@hooks/useD1CV';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  location: string;
  work_authorization: string;
  availability: string;
  work_preference: string;
}

const emptyForm: ContactForm = {
  name: '',
  email: '',
  phone: '',
  linkedin_url: '',
  github_url: '',
  portfolio_url: '',
  location: '',
  work_authorization: '',
  availability: '',
  work_preference: '',
};

export function ContactPage() {
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data, isLoading, refetch } = useD1CVContact();
  const updateMutation = useUpdateContact();

  const isSaving = updateMutation.isPending;

  // Load existing contact
  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        linkedin_url: data.linkedin_url || '',
        github_url: data.github_url || '',
        portfolio_url: data.portfolio_url || '',
        location: data.location || '',
        work_authorization: data.work_authorization || '',
        availability: data.availability || '',
        work_preference: data.work_preference || '',
      });
    }
  }, [data]);

  const handleChange = (field: keyof ContactForm) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
    setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    const payload: ContactInput = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      linkedin_url: form.linkedin_url.trim() || undefined,
      github_url: form.github_url.trim() || undefined,
      portfolio_url: form.portfolio_url.trim() || undefined,
      location: form.location.trim() || undefined,
      work_authorization: form.work_authorization.trim() || undefined,
      availability: form.availability.trim() || undefined,
      work_preference: form.work_preference.trim() || undefined,
    };

    try {
      await updateMutation.mutateAsync(payload);
      setSuccess('Contact information saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
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
        <Typography variant="h4">Contact Information</Typography>
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
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <PersonIcon color="primary" />
              <Typography variant="h6">Personal Details</Typography>
            </Stack>
            
            <Stack spacing={2}>
              <TextField
                label="Full Name"
                value={form.name}
                onChange={handleChange('name')}
                required
                fullWidth
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  fullWidth
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
                <TextField
                  label="Phone"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  fullWidth
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Stack>

              <TextField
                label="Location"
                value={form.location}
                onChange={handleChange('location')}
                fullWidth
                InputProps={{
                  startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <LinkIcon color="primary" />
              <Typography variant="h6">Social Links</Typography>
            </Stack>
            
            <Stack spacing={2}>
              <TextField
                label="LinkedIn URL"
                value={form.linkedin_url}
                onChange={handleChange('linkedin_url')}
                fullWidth
                placeholder="https://linkedin.com/in/..."
              />
              <TextField
                label="GitHub URL"
                value={form.github_url}
                onChange={handleChange('github_url')}
                fullWidth
                placeholder="https://github.com/..."
              />
              <TextField
                label="Portfolio URL"
                value={form.portfolio_url}
                onChange={handleChange('portfolio_url')}
                fullWidth
                placeholder="https://..."
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Work Status</Typography>
            
            <Stack spacing={2}>
              <TextField
                label="Work Authorization"
                value={form.work_authorization}
                onChange={handleChange('work_authorization')}
                fullWidth
                placeholder="e.g., UK Citizen, Requires Sponsorship"
              />
              <TextField
                label="Availability"
                value={form.availability}
                onChange={handleChange('availability')}
                fullWidth
                placeholder="e.g., Immediately, 1 month notice"
              />
              <TextField
                label="Work Preference"
                value={form.work_preference}
                onChange={handleChange('work_preference')}
                fullWidth
                placeholder="e.g., Remote, Hybrid, On-site"
              />
            </Stack>
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
