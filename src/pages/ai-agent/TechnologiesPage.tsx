/**
 * AI Agent Technologies Page
 * 
 * Lists all technologies from cv-ai-agent D1 database.
 * This shows the AI-enriched data used by the chatbot.
 */

import { useState } from 'react';
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
  Chip,
  Stack,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAIAgentTechnologies } from '@hooks/useAIAgent';
import type { AIAgentTechnology } from '@/types';

const RECENCY_COLORS: Record<string, 'success' | 'primary' | 'warning' | 'default'> = {
  current: 'success',
  recent: 'primary',
  legacy: 'warning',
};

export function AIAgentTechnologiesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const { data: technologies = [], isLoading, error, refetch } = useAIAgentTechnologies();

  const filteredTechnologies = technologies.filter((tech: AIAgentTechnology) =>
    tech.name.toLowerCase().includes(search.toLowerCase()) ||
    tech.category?.toLowerCase().includes(search.toLowerCase()) ||
    tech.stable_id?.toLowerCase().includes(search.toLowerCase())
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
          <Tooltip title="New technologies are added via the D1CV form with AI enrichment">
            <span>
              <Button variant="contained" disabled startIcon={<InfoIcon />}>
                Add via D1CV
              </Button>
            </span>
          </Tooltip>
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
                  <TableCell>Stable ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Recency</TableCell>
                  <TableCell>Summary</TableCell>
                  <TableCell>Has Outcomes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTechnologies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        {search ? 'No technologies match your search' : 'No technologies found in AI Agent database'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTechnologies.map((tech: AIAgentTechnology) => (
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
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ai-agent/technologies/${tech.stable_id}`);
                          }}
                        >
                          <OpenInNewIcon />
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
        />
      </Card>
    </Box>
  );
}
