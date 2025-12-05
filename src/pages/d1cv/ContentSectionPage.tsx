/**
 * D1CV Content Section Page
 * 
 * Edit JSON-based content sections (home, achievements).
 * Provides both a form view (user-friendly) and JSON view (advanced).
 */

import { useState, useEffect, useCallback } from 'react';
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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  ViewList as FormIcon,
} from '@mui/icons-material';
import { useD1CVSection, useUpdateContentSection, type ContentSectionInput } from '@hooks/useD1CV';
import { JsonFormRenderer, type JsonObject } from '@components/json-form';

type ViewMode = 'form' | 'json';

export function ContentSectionPage() {
  const { sectionType } = useParams<{ sectionType: 'home' | 'achievements' }>();
  
  const validSection = sectionType === 'home' || sectionType === 'achievements' ? sectionType : 'home';
  
  const [jsonContent, setJsonContent] = useState('{\n  \n}');
  const [formData, setFormData] = useState<JsonObject>({});
  const [sectionName, setSectionName] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('form');

  const { data, isLoading, refetch } = useD1CVSection(validSection);
  const updateMutation = useUpdateContentSection(validSection);

  const isSaving = updateMutation.isPending;

  // Load existing section
  useEffect(() => {
    if (data) {
      try {
        const content = data.json_content || {};
        setJsonContent(JSON.stringify(content, null, 2));
        setFormData(content as JsonObject);
        setSectionName(data.section_name || '');
        setDisplayOrder(data.display_order || 0);
        setJsonError(null);
      } catch {
        setJsonContent('{}');
        setFormData({});
      }
    }
  }, [data]);

  // Sync form data to JSON when switching to JSON view
  const handleViewModeChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
      if (newMode === null) return;
      
      if (newMode === 'json' && viewMode === 'form') {
        // Switching from form to JSON - update JSON string
        setJsonContent(JSON.stringify(formData, null, 2));
        setJsonError(null);
      } else if (newMode === 'form' && viewMode === 'json') {
        // Switching from JSON to form - parse and update form data
        try {
          const parsed = JSON.parse(jsonContent);
          setFormData(parsed);
          setJsonError(null);
        } catch {
          setError('Cannot switch to Form view: JSON has syntax errors. Please fix them first.');
          return; // Don't switch mode
        }
      }
      setViewMode(newMode);
    },
    [viewMode, formData, jsonContent]
  );

  // Handle form data changes
  const handleFormDataChange = useCallback((newData: unknown) => {
    setFormData(newData as JsonObject);
    setSuccess(null);
  }, []);

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

    let contentToSave: JsonObject;

    if (viewMode === 'json') {
      // Validate and parse JSON
      if (!validateJson(jsonContent)) {
        setError('Please fix JSON syntax errors before saving.');
        return;
      }
      contentToSave = JSON.parse(jsonContent);
    } else {
      // Use form data directly
      contentToSave = formData;
    }

    try {
      const payload: ContentSectionInput = {
        section_name: sectionName.trim() || undefined,
        json_content: contentToSave,
        display_order: displayOrder,
      };

      await updateMutation.mutateAsync(payload);
      setSuccess(`${validSection} section saved successfully.`);
      
      // Keep form data in sync after save
      setFormData(contentToSave);
      setJsonContent(JSON.stringify(contentToSave, null, 2));
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
        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="form">
              <Tooltip title="Form View (Recommended)">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <FormIcon fontSize="small" />
                  <Typography variant="body2">Form</Typography>
                </Stack>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="json">
              <Tooltip title="JSON View (Advanced)">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CodeIcon fontSize="small" />
                  <Typography variant="body2">JSON</Typography>
                </Stack>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          <Button startIcon={<RefreshIcon />} onClick={() => refetch()}>
            Refresh
          </Button>
        </Stack>
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
            {viewMode === 'form' ? (
              <>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <FormIcon color="primary" />
                  <Typography variant="h6">Content Editor</Typography>
                  <Typography variant="caption" color="text.secondary">
                    — Edit fields directly below
                  </Typography>
                </Stack>

                <JsonFormRenderer
                  data={formData}
                  onChange={handleFormDataChange}
                />

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Tip: Use the JSON view for bulk editing or advanced changes.
                </Typography>
              </>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={isSaving || (viewMode === 'json' && !!jsonError)}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
