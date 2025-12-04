/**
 * AI Agent Technologies Page
 * 
 * Lists all technologies from cv-ai-agent D1 database.
 * This shows the AI-enriched data used by the chatbot.
 */

import { useState, useMemo } from 'react';
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
  TablePagination,
  TableSortLabel,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  OpenInNew as OpenInNewIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAIAgentTechnologiesWithD1CVMatch } from '@hooks/useAIAgent';
import { useStageTechnology } from '@hooks/useD1CV';
import type { AIAgentTechnologyWithD1CVMatch } from '@/types';

const RECENCY_COLORS: Record<string, 'success' | 'primary' | 'warning' | 'default'> = {
  current: 'success',
  recent: 'primary',
  legacy: 'warning',
};

type SortField = 'stable_id' | 'name' | 'category' | 'recency' | 'hasOutcomes' | 'hasD1CVMatch';
type SortOrder = 'asc' | 'desc';

export function AIAgentTechnologiesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTech, setSelectedTech] = useState<AIAgentTechnologyWithD1CVMatch | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [techToDelete, setTechToDelete] = useState<AIAgentTechnologyWithD1CVMatch | null>(null);
  const { data: technologies = [], isLoading, error, refetch } = useAIAgentTechnologiesWithD1CVMatch();
  const { mutate: stageTechnology, isPending: staging } = useStageTechnology();

  const filteredAndSortedTechnologies = useMemo(() => {
    let result = technologies.filter((tech: AIAgentTechnologyWithD1CVMatch) =>
      tech.name.toLowerCase().includes(search.toLowerCase()) ||
      tech.category?.toLowerCase().includes(search.toLowerCase()) ||
      tech.stable_id?.toLowerCase().includes(search.toLowerCase())
    );

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: string | number | boolean = '';
      let bVal: string | number | boolean = '';

      switch (sortField) {
        case 'stable_id':
          aVal = (a.stable_id || '').toLowerCase();
          bVal = (b.stable_id || '').toLowerCase();
          break;
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'category':
          aVal = (a.category || '').toLowerCase();
          bVal = (b.category || '').toLowerCase();
          break;
        case 'recency': {
          const recencyOrder = { current: 3, recent: 2, legacy: 1 };
          aVal = recencyOrder[a.recency as keyof typeof recencyOrder] || 0;
          bVal = recencyOrder[b.recency as keyof typeof recencyOrder] || 0;
          break;
        }
        case 'hasOutcomes': {
          // Count how many outcome fields are filled
          const aOutcomes = (a.action ? 1 : 0) + (a.effect ? 1 : 0) + (a.outcome ? 1 : 0);
          const bOutcomes = (b.action ? 1 : 0) + (b.effect ? 1 : 0) + (b.outcome ? 1 : 0);
          aVal = aOutcomes;
          bVal = bOutcomes;
          break;
        }
        case 'hasD1CVMatch':
          aVal = a.hasD1CVMatch ? 1 : 0;
          bVal = b.hasD1CVMatch ? 1 : 0;
          break;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [technologies, search, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Reset to first page when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  // Paginated data
  const paginatedTechnologies = filteredAndSortedTechnologies.slice(
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, tech: AIAgentTechnologyWithD1CVMatch) => {
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
      navigate(`/ai-agent/technologies/${selectedTech.stable_id}`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTech) {
      setTechToDelete(selectedTech);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (!techToDelete || !techToDelete.d1cvMatchName) return;

    stageTechnology(
      {
        operation: 'DELETE',
        entityId: techToDelete.id,
        entityName: techToDelete.d1cvMatchName,
        d1cvPayload: { name: techToDelete.d1cvMatchName },
      },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setTechToDelete(null);
          refetch();
        },
      }
    );
  };

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load technologies from AI Agent: {error.message}
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
          <Typography variant="h4">AI Agent Technologies</Typography>
          <Typography variant="body2" color="text.secondary">
            AI-enriched data for chatbot responses • {technologies.length} technologies
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
            Add via D1CV
          </Button>
        </Stack>
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Note:</strong> AI Agent technologies are synced from D1CV with additional AI enrichment fields.
        To add new technologies, use the D1CV Technologies form and fill in the AI Enrichment section.
      </Alert>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, category, or stable_id..."
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
                  <TableCell sortDirection={sortField === 'stable_id' ? sortOrder : false}>
                    <TableSortLabel
                      active={sortField === 'stable_id'}
                      direction={sortField === 'stable_id' ? sortOrder : 'asc'}
                      onClick={() => handleSort('stable_id')}
                    >
                      Stable ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortField === 'name' ? sortOrder : false}>
                    <TableSortLabel
                      active={sortField === 'name'}
                      direction={sortField === 'name' ? sortOrder : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortField === 'category' ? sortOrder : false}>
                    <TableSortLabel
                      active={sortField === 'category'}
                      direction={sortField === 'category' ? sortOrder : 'asc'}
                      onClick={() => handleSort('category')}
                    >
                      Category
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortField === 'recency' ? sortOrder : false}>
                    <TableSortLabel
                      active={sortField === 'recency'}
                      direction={sortField === 'recency' ? sortOrder : 'asc'}
                      onClick={() => handleSort('recency')}
                    >
                      Recency
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Summary</TableCell>
                  <TableCell sortDirection={sortField === 'hasOutcomes' ? sortOrder : false}>
                    <TableSortLabel
                      active={sortField === 'hasOutcomes'}
                      direction={sortField === 'hasOutcomes' ? sortOrder : 'asc'}
                      onClick={() => handleSort('hasOutcomes')}
                    >
                      Has Outcomes
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortField === 'hasD1CVMatch' ? sortOrder : false}>
                    <TableSortLabel
                      active={sortField === 'hasD1CVMatch'}
                      direction={sortField === 'hasD1CVMatch' ? sortOrder : 'asc'}
                      onClick={() => handleSort('hasD1CVMatch')}
                    >
                      D1CV Match
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedTechnologies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        {search ? 'No technologies match your search' : 'No technologies found in AI Agent database'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTechnologies.map((tech: AIAgentTechnologyWithD1CVMatch) => (
                    <TableRow
                      key={tech.stable_id || tech.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/ai-agent/technologies/${tech.stable_id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                          {tech.stable_id || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>{tech.name}</Typography>
                      </TableCell>
                      <TableCell>{tech.category || '—'}</TableCell>
                      <TableCell>
                        {tech.recency ? (
                          <Chip
                            label={tech.recency}
                            size="small"
                            color={RECENCY_COLORS[tech.recency] || 'default'}
                            variant="outlined"
                          />
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {tech.summary || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {tech.action && <Chip label="A" size="small" variant="outlined" title="Has Action" />}
                          {tech.effect && <Chip label="E" size="small" variant="outlined" title="Has Effect" />}
                          {tech.outcome && <Chip label="O" size="small" variant="outlined" title="Has Outcome" />}
                          {!tech.action && !tech.effect && !tech.outcome && (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={tech.hasD1CVMatch ? `Matched with: ${tech.d1cvMatchName}` : 'No match in D1CV'}>
                          <Chip
                            icon={tech.hasD1CVMatch ? <LinkIcon fontSize="small" /> : <LinkOffIcon fontSize="small" />}
                            label={tech.hasD1CVMatch ? 'Match' : 'No match'}
                            size="small"
                            color={tech.hasD1CVMatch ? 'success' : 'default'}
                            variant={tech.hasD1CVMatch ? 'filled' : 'outlined'}
                          />
                        </Tooltip>
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
          count={filteredAndSortedTechnologies.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[15, 25, 50, 100]}
        />
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <OpenInNewIcon fontSize="small" sx={{ mr: 1 }} />
          View / Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }} disabled={!selectedTech?.d1cvMatchName}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Stage Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Technology</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to stage deletion of <strong>{techToDelete?.d1cvMatchName || techToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will remove both the D1CV record and the AI Agent enrichment data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={staging}
          >
            {staging ? 'Deleting...' : 'Stage Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
