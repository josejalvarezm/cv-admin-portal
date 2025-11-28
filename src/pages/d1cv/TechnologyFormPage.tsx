/**
 * D1CV Technology Form Page
 * 
 * Add/Edit technology for the D1CV (Portfolio) database.
 * Changes are staged before being applied.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';

import { useD1CVTechnology, useStageTechnology } from '@hooks/useD1CV';
import { useSimilarityCheck } from '@hooks/useSimilarityCheck';
import { getCategoryId } from '@/constants';
import {
  SimilarTechAlert,
  PortfolioDataSection,
  AIEnrichmentSection,
} from '@components/technology';
import type { TechnologyFormData, SimilarTechnology } from '@/types';

const DEFAULT_FORM_VALUES: TechnologyFormData = {
  name: '',
  category: '',
  experience: '',
  experience_years: 0,
  proficiency_percent: 50,
  level: 'Intermediate',
  is_active: true,
  // AI fields
  summary: '',
  action: '',
  effect: '',
  outcome: '',
  related_project: '',
  employer: '',
  recency: 'current',
};

export function D1CVTechnologyFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // UI State
  const [aiExpanded, setAiExpanded] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);

  // Data hooks
  const { data: technology, isLoading: loadingTech, error } = useD1CVTechnology(id);
  const { mutate: stageTechnology, isPending: staging } = useStageTechnology();

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TechnologyFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  // Similarity check
  const watchName = watch('name');
  const { data: similarTechs, isLoading: loadingSimilar } = useSimilarityCheck(
    watchName,
    { enabled: watchName.length >= 2 && !isEdit }
  );

  // Populate form when editing
  useEffect(() => {
    if (technology) {
      Object.entries(technology).forEach(([key, value]) => {
        if (key in DEFAULT_FORM_VALUES) {
          setValue(key as keyof TechnologyFormData, value);
        }
      });
    }
  }, [technology, setValue]);

  // Show similar technologies alert
  useEffect(() => {
    if (similarTechs && similarTechs.length > 0 && !isEdit) {
      setShowSimilar(true);
    }
  }, [similarTechs, isEdit]);

  const onSubmit = useCallback((data: TechnologyFormData) => {
    const hasAiData = data.summary || data.action || data.effect || data.outcome;

    stageTechnology(
      {
        operation: isEdit ? 'UPDATE' : 'INSERT',
        entityId: id ? parseInt(id, 10) : undefined,
        d1cvPayload: {
          category_id: getCategoryId(data.category),
          name: data.name,
          experience: data.experience,
          experience_years: data.experience_years,
          proficiency_percent: data.proficiency_percent,
          level: data.level,
          is_active: data.is_active,
        },
        aiPayload: hasAiData
          ? {
              summary: data.summary,
              action: data.action,
              effect: data.effect,
              outcome: data.outcome,
              related_project: data.related_project,
              employer: data.employer,
              recency: data.recency,
            }
          : undefined,
      },
      {
        onSuccess: () => {
          navigate('/staged');
        },
      }
    );
  }, [id, isEdit, stageTechnology, navigate]);

  const handleUseSimilar = useCallback((similar: SimilarTechnology) => {
    setValue('name', similar.name);
    if (similar.category) setValue('category', similar.category);
    if (similar.summary) {
      setValue('summary', similar.summary);
      setAiExpanded(true);
    }
    setShowSimilar(false);
  }, [setValue]);

  if (loadingTech && isEdit) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error.message}
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/d1cv/technologies')}
        >
          Portfolio Technologies
        </Link>
        <Typography color="text.primary">
          {isEdit ? 'Edit' : 'Add New'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">
            {isEdit ? 'Edit Technology' : 'Add Technology'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Changes will be staged for review before applying to Portfolio
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/d1cv/technologies')}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            startIcon={staging ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={staging}
          >
            Stage Changes
          </Button>
        </Stack>
      </Stack>

      {/* Similar Technologies Alert */}
      <SimilarTechAlert
        show={showSimilar}
        loading={loadingSimilar}
        similarTechs={similarTechs}
        onUseSimilar={handleUseSimilar}
        onDismiss={() => setShowSimilar(false)}
      />

      {/* Portfolio Data Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📦 Portfolio Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This data appears on your portfolio website
          </Typography>
          <PortfolioDataSection
            control={control}
            watch={watch}
            errors={errors as Record<string, { message?: string }>}
            loadingSimilar={loadingSimilar}
          />
        </CardContent>
      </Card>

      {/* AI Enrichment Section */}
      <Card>
        <CardContent>
          <AIEnrichmentSection
            control={control}
            expanded={aiExpanded}
            onToggleExpand={() => setAiExpanded(!aiExpanded)}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
