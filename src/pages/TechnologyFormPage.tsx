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
import { Save as SaveIcon, Science as ScienceIcon } from '@mui/icons-material';

import { useTechnology } from '@hooks/useTechnologies';
import { useStageTechnology } from '@hooks/useD1CV';
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
  ai_category: '',
  summary: '',
  action: '',
  effect: '',
  outcome: '',
  related_project: '',
  employer: '',
  recency: 'current',
};

/**
 * Fake test data for quick form filling
 */
const FAKE_TEST_DATA: TechnologyFormData = {
  name: `UnicornScript ${Math.floor(Math.random() * 9000) + 1000}`,
  category: 'Languages',
  experience: 'Built magical rainbow-powered APIs that sparkle in production',
  experience_years: 42,
  proficiency_percent: 99,
  level: 'Expert',
  is_active: true,
  ai_category: 'Languages',
  summary: 'A mythical programming language that only exists in dreams',
  action: 'Conjured enchanted microservices using pure imagination',
  effect: 'Reduced bug count to negative numbers through wishful thinking',
  outcome: 'Achieved 200% uptime by bending the laws of physics',
  related_project: 'Project Sparklepony',
  employer: 'Unicorn Labs Inc.',
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
   * Fill form with fake test data (for manual testing)
   */
  const fillTestData = useCallback(() => {
    // Generate fresh random name each time
    const testData = {
      ...FAKE_TEST_DATA,
      name: `UnicornScript ${Math.floor(Math.random() * 9000) + 1000}`,
    };
    Object.entries(testData).forEach(([key, value]) => {
      setValue(key as keyof TechnologyFormData, value);
    });
    setAiExpanded(true);
  }, [setValue]);

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
            // AI category is independent from D1CV category (no coupling)
            category: data.ai_category,
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
          {!isEdit && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ScienceIcon />}
              onClick={fillTestData}
            >
              Fill Test Data
            </Button>
          )}
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
