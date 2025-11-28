/**
 * TechnologyFormPage - Refactored following SOLID principles
 * 
 * SRP: This page now only orchestrates the form flow, delegating:
 *   - Similar tech alert → SimilarTechAlert component
 *   - Portfolio fields → PortfolioDataSection component
 *   - AI fields → AIEnrichmentSection component
 * 
 * OCP: New sections can be added without modifying this file
 * 
 * DIP: Uses hooks for data fetching (abstractions over API)
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
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

import { useTechnology, useStageTechnology } from '@hooks/useTechnologies';
import { useSimilarityCheck } from '@hooks/useSimilarityCheck';
import { getCategoryId } from '@/constants';
import {
  SimilarTechAlert,
  PortfolioDataSection,
  AIEnrichmentSection,
} from '@components/technology';
import type { TechnologyFormData, SimilarTechnology } from '@/types';

/**
 * Default form values - extracted for clarity and reuse
 */
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

export function TechnologyFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // UI State
  const [aiExpanded, setAiExpanded] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);

  // Data hooks (Dependency Inversion - depend on hook abstractions)
  const { data: technology, isLoading: loadingTech } = useTechnology(id);
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

  // Similarity check (only for new technologies)
  const watchName = watch('name');
  const { data: similarTechs, isLoading: loadingSimilar } = useSimilarityCheck(
    watchName,
    { enabled: watchName.length >= 2 && !isEdit }
  );

  // Populate form when editing existing technology
  useEffect(() => {
    if (technology) {
      Object.entries(technology).forEach(([key, value]) => {
        if (key in DEFAULT_FORM_VALUES) {
          setValue(key as keyof TechnologyFormData, value);
        }
      });
      // Expand AI section if has AI data
      if (technology.summary || technology.action) {
        setAiExpanded(true);
      }
    }
  }, [technology, setValue]);

  // Show similar technologies alert when matches found
  useEffect(() => {
    if (similarTechs && similarTechs.length > 0 && !isEdit) {
      setShowSimilar(true);
    }
  }, [similarTechs, isEdit]);

  /**
   * Handle form submission
   * Builds separate payloads for D1CV and AI targets
   */
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

  /**
   * Handle using a similar technology's data
   */
  const handleUseSimilar = useCallback((similar: SimilarTechnology) => {
    setValue('name', similar.name);
    if (similar.category) setValue('category', similar.category);
    if (similar.summary) {
      setValue('summary', similar.summary);
      setAiExpanded(true);
    }
    setShowSimilar(false);
  }, [setValue]);

  // Loading state for edit mode
  if (loadingTech && isEdit) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          {isEdit ? 'Edit Technology' : 'Add Technology'}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
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
      <PortfolioDataSection
        control={control}
        watch={watch}
        errors={errors as Record<string, { message?: string }>}
        loadingSimilar={loadingSimilar}
      />

      {/* AI Enrichment Section */}
      <AIEnrichmentSection
        control={control}
        expanded={aiExpanded}
        onToggleExpand={() => setAiExpanded(!aiExpanded)}
      />
    </Box>
  );
}
