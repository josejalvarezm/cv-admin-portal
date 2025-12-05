/**
 * JsonFormRenderer Component
 * 
 * Dynamically renders JSON content as form fields.
 * Supports: strings, numbers, booleans, arrays, and nested objects.
 * 
 * Uses smart field detection to render appropriate input types.
 */

import { useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
  Button,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

// Export types for external use
export type { JsonValue, JsonObject, JsonArray };

interface JsonFormRendererProps {
  data: JsonValue;
  onChange: (newData: JsonValue) => void;
  path?: string;
  level?: number;
}

/**
 * Converts a camelCase or snake_case key to a human-readable label
 */
function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1') // camelCase
    .replace(/_/g, ' ') // snake_case
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}

/**
 * Determines if a string should use multiline input
 */
function isLongText(value: string): boolean {
  return value.length > 80 || value.includes('\n');
}

/**
 * Determines if a key suggests a URL field
 */
function isUrlField(key: string): boolean {
  const urlKeys = ['url', 'href', 'link', 'route', 'linkRoute'];
  return urlKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()));
}

/**
 * Determines if a key suggests an icon field
 */
function isIconField(key: string): boolean {
  return key.toLowerCase() === 'icon';
}

/**
 * Get field type hint based on key name
 */
function getFieldType(key: string, value: JsonValue): 'text' | 'multiline' | 'url' | 'icon' | 'number' | 'boolean' {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    if (isUrlField(key)) return 'url';
    if (isIconField(key)) return 'icon';
    if (isLongText(value)) return 'multiline';
  }
  return 'text';
}

/**
 * Renders a primitive value (string, number, boolean)
 */
function PrimitiveField({
  label,
  value,
  fieldType,
  onChange,
}: {
  label: string;
  value: string | number | boolean;
  fieldType: 'text' | 'multiline' | 'url' | 'icon' | 'number' | 'boolean';
  onChange: (newValue: string | number | boolean) => void;
}) {
  if (fieldType === 'boolean') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={value as boolean}
            onChange={(e) => onChange(e.target.checked)}
            size="small"
          />
        }
        label={label}
        sx={{ ml: 0 }}
      />
    );
  }

  if (fieldType === 'number') {
    return (
      <TextField
        label={label}
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        size="small"
        fullWidth
      />
    );
  }

  return (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      multiline={fieldType === 'multiline'}
      rows={fieldType === 'multiline' ? 3 : 1}
      placeholder={
        fieldType === 'url'
          ? 'https://...'
          : fieldType === 'icon'
            ? 'e.g., shield-check, cloud-network'
            : undefined
      }
      InputProps={{
        startAdornment:
          fieldType === 'icon' ? (
            <Chip label="icon" size="small" sx={{ mr: 1 }} />
          ) : undefined,
      }}
    />
  );
}

/**
 * Renders an array of items with add/remove functionality
 */
function ArrayField({
  label,
  items,
  onChange,
  level,
}: {
  label: string;
  items: JsonArray;
  onChange: (newItems: JsonArray) => void;
  level: number;
}) {
  const handleItemChange = useCallback(
    (index: number, newValue: JsonValue) => {
      const newItems = [...items];
      newItems[index] = newValue;
      onChange(newItems);
    },
    [items, onChange]
  );

  const handleAddItem = useCallback(() => {
    // Smart add: copy structure from first item if exists, otherwise add empty string
    if (items.length > 0 && typeof items[0] === 'object' && items[0] !== null) {
      const template = JSON.parse(JSON.stringify(items[0]));
      // Clear values but keep structure
      const clearValues = (obj: JsonObject): JsonObject => {
        const cleared: JsonObject = {};
        for (const [key, val] of Object.entries(obj)) {
          if (typeof val === 'string') cleared[key] = '';
          else if (typeof val === 'number') cleared[key] = 0;
          else if (typeof val === 'boolean') cleared[key] = false;
          else if (Array.isArray(val)) cleared[key] = [];
          else if (typeof val === 'object' && val !== null) cleared[key] = clearValues(val as JsonObject);
          else cleared[key] = null;
        }
        return cleared;
      };
      onChange([...items, clearValues(template as JsonObject)]);
    } else {
      onChange([...items, '']);
    }
  }, [items, onChange]);

  const handleRemoveItem = useCallback(
    (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      onChange(newItems);
    },
    [items, onChange]
  );

  return (
    <Accordion defaultExpanded={level < 2} sx={{ bgcolor: 'background.default' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2">{label}</Typography>
          <Chip label={`${items.length} items`} size="small" color="primary" variant="outlined" />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {items.map((item, index) => (
            <Paper
              key={index}
              variant="outlined"
              sx={{ p: 2, position: 'relative' }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <Tooltip title="Drag to reorder (coming soon)">
                  <DragIcon sx={{ color: 'text.disabled', mt: 0.5, cursor: 'grab' }} />
                </Tooltip>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Item {index + 1}
                  </Typography>
                  <JsonFormRenderer
                    data={item}
                    onChange={(newValue) => handleItemChange(index, newValue)}
                    path={`${label}[${index}]`}
                    level={level + 1}
                  />
                </Box>
                <Tooltip title="Remove item">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                    sx={{ mt: 0.5 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            variant="outlined"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
            Add {label.replace(/s$/, '')}
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

/**
 * Renders an object with its key-value pairs
 */
function ObjectField({
  label,
  data,
  onChange,
  level,
  isRoot = false,
}: {
  label: string;
  data: JsonObject;
  onChange: (newData: JsonObject) => void;
  level: number;
  isRoot?: boolean;
}) {
  const handleFieldChange = useCallback(
    (key: string, newValue: JsonValue) => {
      onChange({ ...data, [key]: newValue });
    },
    [data, onChange]
  );

  const entries = Object.entries(data);

  // Group primitives vs complex types
  const primitives = entries.filter(
    ([, value]) => typeof value !== 'object' || value === null
  );
  const complex = entries.filter(
    ([, value]) => typeof value === 'object' && value !== null
  );

  const content = (
    <Stack spacing={2}>
      {/* Primitive fields in a grid */}
      {primitives.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          {primitives.map(([key, value]) => {
            const fieldType = getFieldType(key, value);
            return (
              <Box key={key} sx={{ gridColumn: fieldType === 'multiline' ? '1 / -1' : 'auto' }}>
                <PrimitiveField
                  label={formatLabel(key)}
                  value={value as string | number | boolean}
                  fieldType={fieldType}
                  onChange={(newValue) => handleFieldChange(key, newValue)}
                />
              </Box>
            );
          })}
        </Box>
      )}

      {/* Complex fields (objects/arrays) */}
      {complex.map(([key, value]) => (
        <Box key={key}>
          {Array.isArray(value) ? (
            <ArrayField
              label={formatLabel(key)}
              items={value}
              onChange={(newItems) => handleFieldChange(key, newItems)}
              level={level}
            />
          ) : (
            <ObjectField
              label={formatLabel(key)}
              data={value as JsonObject}
              onChange={(newData) => handleFieldChange(key, newData)}
              level={level + 1}
            />
          )}
        </Box>
      ))}
    </Stack>
  );

  // Root level doesn't need an accordion wrapper
  if (isRoot) {
    return content;
  }

  return (
    <Accordion defaultExpanded={level < 2} sx={{ bgcolor: level % 2 === 0 ? 'background.paper' : 'background.default' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1" fontWeight="medium">
          {label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{content}</AccordionDetails>
    </Accordion>
  );
}

/**
 * Main JsonFormRenderer component
 */
export function JsonFormRenderer({ data, onChange, path = 'root', level = 0 }: JsonFormRendererProps) {
  // Handle null
  if (data === null) {
    return (
      <TextField
        label={formatLabel(path)}
        value=""
        onChange={(e) => onChange(e.target.value || null)}
        size="small"
        fullWidth
        placeholder="(null)"
      />
    );
  }

  // Handle primitives
  if (typeof data !== 'object') {
    const fieldType = getFieldType(path, data);
    return (
      <PrimitiveField
        label={formatLabel(path)}
        value={data}
        fieldType={fieldType}
        onChange={onChange}
      />
    );
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return (
      <ArrayField
        label={formatLabel(path)}
        items={data}
        onChange={onChange}
        level={level}
      />
    );
  }

  // Handle objects
  return (
    <ObjectField
      label={formatLabel(path)}
      data={data}
      onChange={onChange}
      level={level}
      isRoot={level === 0}
    />
  );
}

export default JsonFormRenderer;
