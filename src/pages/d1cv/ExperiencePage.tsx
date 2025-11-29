/**
 * D1CV Experience Page
 * 
 * Lists work experience from D1CV database using normalized tables.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Work as WorkIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useD1CVExperience, useDeleteExperience } from '@hooks/useD1CV';
import type { Experience } from '@/types';

type SortField = 'company' | 'role' | 'period' | 'categories';
type SortOrder = 'asc' | 'desc';

export function D1CVExperiencePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('period');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { data, isLoading, error, refetch } = useD1CVExperience();
  const deleteMutation = useDeleteExperience();

  const experiences = data?.experiences || [];

  const filteredAndSortedExperiences = useMemo(() => {
    let result = experiences.filter((exp: Experience) =>
      exp.company.toLowerCase().includes(search.toLowerCase()) ||
      exp.role.toLowerCase().includes(search.toLowerCase()) ||
      exp.technologies?.toLowerCase().includes(search.toLowerCase())
    );

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortField) {
        case 'company':
          aVal = a.company.toLowerCase();
          bVal = b.company.toLowerCase();
          break;
        case 'role':
          aVal = a.role.toLowerCase();
          bVal = b.role.toLowerCase();
          break;
        case 'period':
          // Sort by period text (natural order works for date formats)
          aVal = a.period.toLowerCase();
          bVal = b.period.toLowerCase();
          break;
        case 'categories':
          aVal = a.categories?.length || 0;
          bVal = b.categories?.length || 0;
          break;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [experiences, search, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load experience: {error.message}
        </Alert>
        <Button startIcon={<RefreshIcon />} onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Portfolio Experience</Typography>
          <Typography variant="body2" color="text.secondary">
            Work experience from D1CV database • {experiences.length} entries
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/d1cv/experience/new')}
          >
            Add Experience
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by company, role, or technologies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Experience Table */}
      <Card>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sortDirection={sortField === 'company' ? sortOrder : false}>
                    <TableSortLabel
                      active={sortField === 'company'}
                      direction={sortField === 'company' ? sortOrder : 'asc'}
                      onClick={() => handleSort('company')}
                    >
                      Company
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortField === 'role' ? sortOrder : false}>
                    <TableSortLabel
                      active={sortField === 'role'}
                      direction={sortField === 'role' ? sortOrder : 'asc'}
                      onClick={() => handleSort('role')}
                    >
                      Role
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortField === 'period' ? sortOrder : false}>
                    <TableSortLabel
                      active={sortField === 'period'}
                      direction={sortField === 'period' ? sortOrder : 'asc'}
                      onClick={() => handleSort('period')}
                    >
                      Period
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell sortDirection={sortField === 'categories' ? sortOrder : false}>
                    <TableSortLabel
                      active={sortField === 'categories'}
                      direction={sortField === 'categories' ? sortOrder : 'asc'}
                      onClick={() => handleSort('categories')}
                    >
                      Achievement Categories
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedExperiences.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        {search ? 'No experience matches your search' : 'No experience found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedExperiences.map((exp, index) => (
                    <TableRow key={`${exp.company}-${index}`} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <WorkIcon color="action" fontSize="small" />
                          <Typography fontWeight={600}>{exp.company}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography>{exp.role}</Typography>
                        {exp.operatingLevel && (
                          <Typography variant="caption" color="text.secondary">
                            {exp.operatingLevel}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{exp.period}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {exp.location || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {exp.categories?.map((cat, catIndex) => (
                            <Chip
                              key={catIndex}
                              label={cat.title}
                              size="small"
                              variant="outlined"
                              sx={{ mb: 0.5 }}
                            />
                          )) || <Typography color="text.secondary">—</Typography>}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/d1cv/experience/${exp.id}`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (window.confirm(`Delete experience at ${exp.company}?`)) {
                                deleteMutation.mutate(exp.id!);
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Detailed View with Accordions */}
      {!isLoading && filteredAndSortedExperiences.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Detailed Achievements
          </Typography>
          {filteredAndSortedExperiences.map((exp, index) => (
            <Accordion key={`${exp.company}-detail-${index}`} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                  <WorkIcon color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight={600}>
                      {exp.role} at {exp.company}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {exp.period} • {exp.location}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${exp.categories?.reduce((sum, cat) => sum + cat.achievements.length, 0) || 0} achievements`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                {exp.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {exp.description}
                  </Typography>
                )}
                {exp.technologies && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Technologies:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {exp.technologies}
                    </Typography>
                  </Box>
                )}
                {exp.categories?.map((cat, catIndex) => (
                  <Box key={catIndex} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      {cat.title}
                    </Typography>
                    <List dense>
                      {cat.achievements.map((ach, achIndex) => (
                        <ListItem key={achIndex} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={ach.title}
                            secondary={ach.description}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
}
