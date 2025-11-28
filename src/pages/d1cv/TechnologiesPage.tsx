/**
 * D1CV Technologies Page
 * 
 * Lists all technologies from the D1CV (Portfolio) database.
 * This is the source of truth for what appears on {YOUR_DOMAIN}
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  CircularProgress,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useD1CVTechnologies } from '@hooks/useD1CV';
import type { D1CVTechnology } from '@/types';

const LEVEL_COLORS: Record<string, 'success' | 'primary' | 'warning' | 'default'> = {
  Expert: 'success',
  Advanced: 'primary',
  Intermediate: 'warning',
  Beginner: 'default',
};

export function D1CVTechnologiesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTech, setSelectedTech] = useState<D1CVTechnology | null>(null);
  const { data: technologies = [], isLoading, error, refetch } = useD1CVTechnologies();

  const filteredTechnologies = technologies.filter((tech: D1CVTechnology) =>
    tech.name.toLowerCase().includes(search.toLowerCase()) ||
    tech.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, tech: D1CVTechnology) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTech(tech);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTech(null);
  };

  const handleEdit = () => {
    if (selectedTech) {
      navigate(`/d1cv/technologies/${selectedTech.id}`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    // TODO: Stage DELETE operation
    console.log('Stage delete for', selectedTech?.id);
    handleMenuClose();
  };

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
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
          <Typography variant="h4">Portfolio Technologies</Typography>
          <Typography variant="body2" color="text.secondary">
            Portfolio display data • {technologies.length} technologies
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/d1cv/technologies/new')}
          >
            Add Technology
          </Button>
        </Stack>
      </Stack>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search technologies..."
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
            <Button variant="outlined" startIcon={<FilterIcon />}>
              Filter
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Technologies Table */}
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
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Proficiency</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTechnologies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        {search ? 'No technologies match your search' : 'No technologies found in portfolio'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTechnologies.map((tech: D1CVTechnology) => (
                    <TableRow
                      key={tech.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/d1cv/technologies/${tech.id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          #{tech.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>{tech.name}</Typography>
                      </TableCell>
                      <TableCell>{tech.category || '—'}</TableCell>
                      <TableCell>{tech.experience || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={tech.level}
                          size="small"
                          color={LEVEL_COLORS[tech.level] || 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'grey.200',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${tech.proficiency_percent}%`,
                                height: '100%',
                                bgcolor: 'primary.main',
                              }}
                            />
                          </Box>
                          <Typography variant="body2">{tech.proficiency_percent}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tech.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={tech.is_active ? 'success' : 'default'}
                          variant={tech.is_active ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, tech)}
                        >
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Stage Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
