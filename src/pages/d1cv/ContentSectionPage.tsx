/**
 * D1CV Content Section Page
 * 
 * Edit JSON-based content sections (home, achievements).
 * Uses a JSON editor for flexible content editing.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Code as CodeIcon,
} from '@mui/icons-material';
import { useD1CVSection, useUpdateContentSection, type ContentSectionInput } from '@hooks/useD1CV';

export function ContentSectionPage() {
  const { sectionType } = useParams<{ sectionType: 'home' | 'achievements' }>();
  
  const validSection = sectionType === 'home' || sectionType === 'achievements' ? sectionType : 'home';
  
  const [jsonContent, setJsonContent] = useState('{\n  \n}');
  const [sectionName, setSectionName] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const { data, isLoading, refetch } = useD1CVSection(validSection);
  const updateMutation = useUpdateContentSection(validSection);

  const isSaving = updateMutation.isPending;

  // Load existing section
  useEffect(() => {
    if (data) {
      try {
        setJsonContent(JSON.stringify(data.json_content, null, 2));
        setSectionName(data.section_name || '');
        setDisplayOrder(data.display_order || 0);
        setJsonError(null);
      } catch {
        setJsonContent('{}');
      }
    }
  }, [data]);

  const validateJson = (text: string): boolean => {
    try {
      JSON.parse(text);
      setJsonError(null);
      return true;
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON');
      return false;
    }
  };

  const handleJsonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setJsonContent(value);
    validateJson(value);
    setSuccess(null);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateJson(jsonContent)) {
      setError('Please fix JSON syntax errors before saving.');
      return;
    }

    try {
      const parsedContent = JSON.parse(jsonContent);
      
      const payload: ContentSectionInput = {
        section_name: sectionName.trim() || undefined,
        json_content: parsedContent,
        display_order: displayOrder,
      };

      await updateMutation.mutateAsync(payload);
      setSuccess(`${validSection} section saved successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save section');
    }
  };

  const getSectionTitle = () => {
    switch (validSection) {
      case 'home':
        return 'Home Section';
      case 'achievements':
        return 'Achievements Section';
      default:
        return 'Content Section';
    }
  };

  const getSectionDescription = () => {
    switch (validSection) {
      case 'home':
        return 'Edit the home page content including welcome message, featured projects, and highlights.';
      case 'achievements':
        return 'Edit career achievements, certifications, and notable accomplishments.';
      default:
        return 'Edit the content section.';
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
        <Box>
          <Typography variant="h4">{getSectionTitle()}</Typography>
          <Typography variant="body2" color="text.secondary">
            {getSectionDescription()}
          </Typography>
        </Box>
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
            <Typography variant="h6" sx={{ mb: 2 }}>Section Metadata</Typography>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Section Name"
                value={sectionName}
                onChange={(e) => { setSectionName(e.target.value); setSuccess(null); }}
                fullWidth
                placeholder={`e.g., ${validSection.charAt(0).toUpperCase() + validSection.slice(1)}`}
              />
              <TextField
                label="Display Order"
                type="number"
                value={displayOrder}
                onChange={(e) => { setDisplayOrder(parseInt(e.target.value) || 0); setSuccess(null); }}
                sx={{ minWidth: 150 }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CodeIcon color="primary" />
                <Typography variant="h6">JSON Content</Typography>
              </Stack>
              <Button size="small" onClick={handleFormatJson}>
                Format JSON
              </Button>
            </Stack>

            {jsonError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                JSON Error: {jsonError}
              </Alert>
            )}

            <TextField
              value={jsonContent}
              onChange={handleJsonChange}
              multiline
              rows={20}
              fullWidth
              error={!!jsonError}
              sx={{
                fontFamily: 'monospace',
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
              placeholder='{\n  "key": "value"\n}'
            />

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Edit the JSON content directly. Use "Format JSON" to auto-format.
            </Typography>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={isSaving || !!jsonError}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
