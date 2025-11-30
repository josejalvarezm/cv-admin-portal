/**
 * PortfolioDataSection Component - Single Responsibility Principle (SRP)
 * 
 * This component handles the D1CV/Portfolio fields of the technology form.
 * It's focused solely on collecting portfolio display data.
 */

import { Control, Controller, UseFormWatch } from 'react-hook-form';
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Typography,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { TECHNOLOGY_LEVELS } from '@/constants';
import type { TechnologyFormData, TechnologyCategory } from '@/types';

interface PortfolioDataSectionProps {
  control: Control<TechnologyFormData>;
  watch: UseFormWatch<TechnologyFormData>;
  errors: Record<string, { message?: string }>;
  loadingSimilar?: boolean;
  categories?: TechnologyCategory[];
  loadingCategories?: boolean;
}

export function PortfolioDataSection({
  control,
  watch,
  errors,
  loadingSimilar = false,
  categories = [],
  loadingCategories = false,
}: PortfolioDataSectionProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title="📋 Portfolio Data"
        subheader="Required fields for portfolio display"
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Name Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="name"
              control={control}
              rules={{
                required: 'Name is required',
                maxLength: { value: 100, message: 'Name must be 100 characters or less' },
                pattern: {
                  value: /^[a-zA-Z0-9\s.\-+#/()]+$/,
                  message: 'Name contains invalid characters',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Technology Name"
                  required
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                  slotProps={{
                    input: {
                      endAdornment: loadingSimilar && (
                        <CircularProgress size={20} />
                      ),
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* Category Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Category"
                  required
                  error={Boolean(errors.category)}
                  helperText={errors.category?.message}
                  disabled={loadingCategories}
                  slotProps={{
                    input: {
                      endAdornment: loadingCategories && (
                        <CircularProgress size={20} />
                      ),
                    },
                  }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Experience Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="experience"
              control={control}
              rules={{
                maxLength: { value: 50, message: 'Experience must be 50 characters or less' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Experience Summary"
                  placeholder="e.g., Built production APIs"
                  error={Boolean(errors.experience)}
                  helperText={errors.experience?.message}
                />
              )}
            />
          </Grid>

          {/* Experience Years Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="experience_years"
              control={control}
              rules={{
                min: { value: 0, message: 'Must be 0 or greater' },
                max: { value: 50, message: 'Must be 50 or less' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Years of Experience"
                  slotProps={{ htmlInput: { min: 0, max: 50 } }}
                  error={Boolean(errors.experience_years)}
                  helperText={errors.experience_years?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </Grid>

          {/* Level Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth select label="Level">
                  {TECHNOLOGY_LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Proficiency Slider */}
          <Grid size={{ xs: 12 }}>
            <Typography gutterBottom>
              Proficiency: {watch('proficiency_percent')}%
            </Typography>
            <Controller
              name="proficiency_percent"
              control={control}
              render={({ field }) => (
                <Slider
                  {...field}
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
                />
              )}
            />
          </Grid>

          {/* Active Switch */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Active (visible on portfolio)"
                />
              )}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
