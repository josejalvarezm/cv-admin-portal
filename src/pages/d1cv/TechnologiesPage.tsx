/**
 * Portfolio Technologies Page
 * 
 * Lists all technologies from the D1CV (Portfolio) database.
 * This is the source of truth for what appears on {YOUR_DOMAIN}
 * Shows AI Agent match status for each technology.
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
  TablePagination,
  IconButton,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  CircularProgress,
  Menu,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useD1CVTechnologiesWithAIMatch } from '@hooks/useD1CV';
import type { D1CVTechnologyWithAIMatch, AIAgentTechnology } from '@/types';

const LEVEL_COLORS: Record<string, 'success' | 'primary' | 'warning' | 'default'> = {
  Expert: 'success',
  Advanced: 'primary',
  Intermediate: 'warning',
  Beginner: 'default',
};

export function D1CVTechnologiesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTech, setSelectedTech] = useState<D1CVTechnologyWithAIMatch | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiDialogData, setAiDialogData] = useState<AIAgentTechnology | null>(null);
  const { data: technologies = [], isLoading, error, refetch } = useD1CVTechnologiesWithAIMatch();

  const filteredTechnologies = technologies.filter((tech: D1CVTechnologyWithAIMatch) =>
    tech.name.toLowerCase().includes(search.toLowerCase()) ||
    tech.category?.toLowerCase().includes(search.toLowerCase())
  );

  // Reset to first page when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  // Paginated data
  const paginatedTechnologies = filteredTechnologies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, tech: D1CVTechnologyWithAIMatch) => {
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
      // Use URL-encoded name since D1CV doesn't have IDs in v2 API
      navigate(`/d1cv/technologies/${encodeURIComponent(selectedTech.name)}`);
    }
    handleMenuClose();
  };

  const handleAIMatchClick = (event: React.MouseEvent, tech: D1CVTechnologyWithAIMatch) => {
    event.stopPropagation();
    if (tech.hasAiMatch && tech.aiMatch) {
      setAiDialogData(tech.aiMatch);
      setAiDialogOpen(true);
    }
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
              onChange={handleSearchChange}
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
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Proficiency</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>AI Agent</TableCell>
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
                  paginatedTechnologies.map((tech: D1CVTechnologyWithAIMatch) => (
                    <TableRow
                      key={tech.name}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/d1cv/technologies/${encodeURIComponent(tech.name)}`)}
                    >
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
                      <TableCell>
                        <Chip
                          icon={tech.hasAiMatch ? <LinkIcon fontSize="small" /> : <LinkOffIcon fontSize="small" />}
                          label={tech.hasAiMatch ? 'Match' : 'No match'}
                          size="small"
                          color={tech.hasAiMatch ? 'info' : 'default'}
                          variant={tech.hasAiMatch ? 'filled' : 'outlined'}
                          onClick={(e) => handleAIMatchClick(e, tech)}
                          sx={{ cursor: tech.hasAiMatch ? 'pointer' : 'default' }}
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
        <TablePagination
          component="div"
          count={filteredTechnologies.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[15, 25, 50, 100]}
          showFirstButton
          showLastButton
        />
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

      {/* AI Agent Data Dialog */}
      <Dialog
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          🤖 AI Agent Data
        </DialogTitle>
        <DialogContent>
          {aiDialogData && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Name</Typography>
                <Typography variant="body1" fontWeight={600}>{aiDialogData.name}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">Stable ID</Typography>
                <Typography variant="body2" fontFamily="monospace">{aiDialogData.stable_id}</Typography>
              </Box>
              {aiDialogData.summary && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Summary</Typography>
                  <Typography variant="body2">{aiDialogData.summary}</Typography>
                </Box>
              )}
              {aiDialogData.action && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Action</Typography>
                  <Typography variant="body2">{aiDialogData.action}</Typography>
                </Box>
              )}
              {aiDialogData.effect && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Effect</Typography>
                  <Typography variant="body2">{aiDialogData.effect}</Typography>
                </Box>
              )}
              {aiDialogData.outcome && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Outcome</Typography>
                  <Typography variant="body2">{aiDialogData.outcome}</Typography>
                </Box>
              )}
              {aiDialogData.employer && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Employer</Typography>
                  <Typography variant="body2">{aiDialogData.employer}</Typography>
                </Box>
              )}
              {aiDialogData.recency && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Recency</Typography>
                  <Chip label={aiDialogData.recency} size="small" variant="outlined" />
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
