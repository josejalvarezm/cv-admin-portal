/**
 * D1CV Technology Form Page
 * 
 * Add/Edit technology for the D1CV (Portfolio) database.
 * Changes are staged before being applied.
 * 
 * Supports editing:
 * 1. Technologies in production D1CV database
 * 2. Technologies that are only staged (not yet applied)
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
  Chip,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon, Science as ScienceIcon, Schedule as PendingIcon } from '@mui/icons-material';

import { useUnifiedTechnology, useStageTechnology, useD1CVCategories, useUpdateStagedTechnology } from '@hooks/useD1CV';
import { useSimilarityCheck } from '@hooks/useSimilarityCheck';
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
  ai_category: '',
  summary: '',
  action: '',
  effect: '',
  outcome: '',
  related_project: '',
  employer: '',
  recency: 'current',
};

/** Fake test data for quick form filling */
const FAKE_TEST_DATA: TechnologyFormData = {
  name: 'UnicornScript 3000',
  category: 'Backend Development',
  experience: 'Built magical rainbow APIs in prod',  // max 50 chars
  experience_years: 3,
  proficiency_percent: 99,
  level: 'Expert',
  is_active: true,
  ai_category: 'Languages',
  summary: 'A mythical programming language',
  action: 'Conjured enchanted microservices',
  effect: 'Reduced bugs via wishful thinking',
  outcome: 'Achieved 200% uptime somehow',
  related_project: 'Project Sparklepony',
  employer: 'Unicorn Labs Inc.',
  recency: 'current',
};

export function D1CVTechnologyFormPage() {
  const { name: techName } = useParams<{ name: string }>();
  const decodedName = techName ? decodeURIComponent(techName) : undefined;
  const navigate = useNavigate();
  const isEdit = Boolean(techName);

  // UI State
  const [aiExpanded, setAiExpanded] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [isEditingStaged, setIsEditingStaged] = useState(false);
  const [stagedId, setStagedId] = useState<number | null>(null);

  // Data hooks - unified endpoint fetches all data in one request
  const { data: unifiedData, isLoading: loadingTech, error: techError } = useUnifiedTechnology(decodedName);
  const { mutate: stageTechnology, isPending: staging } = useStageTechnology();
  const { mutate: updateStaged, isPending: updatingStaged } = useUpdateStagedTechnology();
  const { data: categories = [], isLoading: loadingCategories } = useD1CVCategories();

  /**
   * Get category ID from category name using fetched categories
   */
  const getCategoryId = (categoryName: string): number => {
    const category = categories.find(c => c.name === categoryName);
    return category?.id ?? 1;
  };

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

  // Populate form when data is loaded (from production or staging)
  useEffect(() => {
    if (!unifiedData?.technology) return;

    const technology = unifiedData.technology;
    const isFromStaging = unifiedData.source === 'staged';

    // Set editing mode based on source
    if (isFromStaging && unifiedData.staged.staged_id) {
      setIsEditingStaged(true);
      setStagedId(unifiedData.staged.staged_id);
    }

    // Populate D1CV fields
    Object.entries(technology).forEach(([key, value]) => {
      if (key in DEFAULT_FORM_VALUES) {
        setValue(key as keyof TechnologyFormData, value);
      }
    });

    // If there's AI match data, populate AI fields and auto-expand the section
    if (technology.hasAiMatch && technology.aiMatch) {
      const aiData = technology.aiMatch;
      if (aiData.summary) setValue('summary', aiData.summary);
      if (aiData.action) setValue('action', aiData.action);
      if (aiData.effect) setValue('effect', aiData.effect);
      if (aiData.outcome) setValue('outcome', aiData.outcome);
      if (aiData.related_project) setValue('related_project', aiData.related_project);
      if (aiData.employer) setValue('employer', aiData.employer);
      if (aiData.recency) setValue('recency', aiData.recency);

      // Auto-expand AI section if there's AI data
      const hasAnyAiField = aiData.summary || aiData.action || aiData.effect || aiData.outcome;
      if (hasAnyAiField) {
        setAiExpanded(true);
      }
    }
  }, [unifiedData, setValue]);

  // Show similar technologies alert
  useEffect(() => {
    if (similarTechs && similarTechs.length > 0 && !isEdit) {
      setShowSimilar(true);
    }
  }, [similarTechs, isEdit]);

  /** Fill form with fake test data (for manual testing) */
  const fillTestData = useCallback(() => {
    const testData = {
      ...FAKE_TEST_DATA,
      name: `UnicornScript ${Math.floor(Math.random() * 9000) + 1000}`,
    };
    Object.entries(testData).forEach(([key, value]) => {
      setValue(key as keyof TechnologyFormData, value);
    });
    setAiExpanded(true);
  }, [setValue]);

  const onSubmit = useCallback((data: TechnologyFormData) => {
    const hasAiData = data.summary || data.action || data.effect || data.outcome;

    const d1cvPayload = {
      category_id: getCategoryId(data.category),
      name: data.name,
      experience: data.experience,
      experience_years: data.experience_years,
      proficiency_percent: data.proficiency_percent,
      level: data.level,
      is_active: data.is_active,
    };

    const aiPayload = hasAiData
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
      : undefined;

    // If editing a staged record, update it directly
    if (isEditingStaged && stagedId) {
      updateStaged(
        {
          stagedId,
          d1cvPayload,
          aiPayload: aiPayload || {},
        },
        {
          onSuccess: () => {
            navigate('/staged');
          },
        }
      );
      return;
    }

    // Otherwise, create a new staged record
    stageTechnology(
      {
        operation: isEdit ? 'UPDATE' : 'INSERT',
        entityName: decodedName, // Use name instead of ID for updates
        d1cvPayload,
        aiPayload,
      },
      {
        onSuccess: () => {
          navigate('/staged');
        },
      }
    );
  }, [decodedName, isEdit, isEditingStaged, stagedId, stageTechnology, updateStaged, navigate, getCategoryId]);

  const handleUseSimilar = useCallback((similar: SimilarTechnology) => {
    setValue('name', similar.name);
    if (similar.category) setValue('category', similar.category);
    if (similar.summary) {
      setValue('summary', similar.summary);
      setAiExpanded(true);
    }
    setShowSimilar(false);
  }, [setValue]);

  // Show loading when fetching technology data
  if (loadingTech && isEdit) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error only if unified fetch failed completely
  if (techError && isEdit) {
    return (
      <Alert severity="error">
        Technology not found: {techError.message}
      </Alert>
    );
  }

  // For editing mode, ensure we have data
  if (isEdit && !unifiedData?.technology) {
    return (
      <Alert severity="warning">
        Technology not found in production or staging.
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

      {/* Staged indicator */}
      {isEditingStaged && (
        <Alert
          severity="info"
          icon={<PendingIcon />}
          sx={{ mb: 2 }}
        >
          You are editing a <strong>staged</strong> technology that hasn't been applied yet.
          Changes will update the existing staged record.
        </Alert>
      )}

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h4">
              {isEdit ? 'Edit Technology' : 'Add Technology'}
            </Typography>
            {isEditingStaged && (
              <Chip
                icon={<PendingIcon />}
                label="Staged"
                color="warning"
                size="small"
              />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {isEditingStaged
              ? 'Update the staged changes before applying to Portfolio'
              : 'Changes will be staged for review before applying to Portfolio'
            }
          </Typography>
        </Box>
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
            startIcon={(staging || updatingStaged) ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={staging || updatingStaged}
          >
            {isEditingStaged ? 'Update Staged Changes' : 'Stage Changes'}
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
            categories={categories}
            loadingCategories={loadingCategories}
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
