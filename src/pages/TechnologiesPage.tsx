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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTechnologies } from '@hooks/useTechnologies';
import type { Technology } from '@/types';

const LEVEL_COLORS: Record<string, 'success' | 'primary' | 'warning' | 'default'> = {
  Expert: 'success',
  Advanced: 'primary',
  Intermediate: 'warning',
  Beginner: 'default',
};

export function TechnologiesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const { data: technologies = [], isLoading } = useTechnologies();

  const filteredTechnologies = technologies.filter((tech: Technology) =>
    tech.name.toLowerCase().includes(search.toLowerCase()) ||
    tech.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, tech: Technology) => {
    setAnchorEl(event.currentTarget);
    setSelectedTech(tech);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTech(null);
  };

  const handleEdit = () => {
    if (selectedTech) {
      navigate(`/technologies/${selectedTech.id}`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    // TODO: Implement delete with confirmation
    console.log('Delete', selectedTech?.id);
    handleMenuClose();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Technologies</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/technologies/new')}
        >
          Add Technology
        </Button>
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Proficiency</TableCell>
                <TableCell>AI Sync</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTechnologies.map((tech: Technology) => (
                <TableRow
                  key={tech.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/technologies/${tech.id}`)}
                >
                  <TableCell>
                    <Typography fontWeight={600}>{tech.name}</Typography>
                  </TableCell>
                  <TableCell>{tech.category || '—'}</TableCell>
                  <TableCell>{tech.experience || '—'}</TableCell>
                  <TableCell>
                    {tech.level && (
                      <Chip
                        label={tech.level}
                        size="small"
                        color={LEVEL_COLORS[tech.level] || 'default'}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {tech.proficiency_percent != null && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#e0e0e0',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${tech.proficiency_percent}%`,
                              height: '100%',
                              backgroundColor: 'primary.main',
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {tech.proficiency_percent}%
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tech.ai_synced ? 'Synced' : 'Pending'}
                      size="small"
                      color={tech.ai_synced ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, tech)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTechnologies?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {search ? 'No technologies match your search' : 'No technologies found'}
                    </Typography>
                    <Button
                      variant="text"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/technologies/new')}
                      sx={{ mt: 1 }}
                    >
                      Add your first technology
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Actions Menu */}
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
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
