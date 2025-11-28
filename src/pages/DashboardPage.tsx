import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Code as CodeIcon,
  SyncAlt as SyncIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useStagedChangesCount } from '@hooks/useStagedChanges';
import { useTechnologiesCount } from '@hooks/useTechnologies';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color, fontWeight: 700 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: bgColor,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: stagedCount, isLoading: stagedLoading } = useStagedChangesCount();
  const { data: techCount, isLoading: techLoading } = useTechnologiesCount();

  const isLoading = stagedLoading || techLoading;

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
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/technologies/new')}
        >
          Add Technology
        </Button>
      </Stack>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Technologies"
            value={techCount?.total ?? 0}
            icon={<CodeIcon />}
            color="#1976d2"
            bgColor="#e3f2fd"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending D1CV"
            value={stagedCount?.d1cvPending ?? 0}
            icon={<SyncIcon />}
            color="#ed6c02"
            bgColor="#fff3e0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending AI Sync"
            value={stagedCount?.aiPending ?? 0}
            icon={<WarningIcon />}
            color="#9c27b0"
            bgColor="#f3e5f5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Applied Today"
            value={stagedCount?.appliedToday ?? 0}
            icon={<CheckIcon />}
            color="#2e7d32"
            bgColor="#e8f5e9"
          />
        </Grid>
      </Grid>

      {/* Alerts */}
      {stagedCount && stagedCount.aiPending > 0 && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/staged')}>
              View Staged
            </Button>
          }
          sx={{ mb: 3 }}
        >
          You have {stagedCount.aiPending} pending AI sync changes. These require manual sync to update the chatbot.
        </Alert>
      )}

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
            onClick={() => navigate('/technologies/new')}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#e3f2fd' }}>
                  <AddIcon color="primary" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Add Technology
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add a new technology to your CV
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
            onClick={() => navigate('/staged')}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#f3e5f5' }}>
                  <SyncIcon sx={{ color: '#9c27b0' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Sync to AI Agent
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Push pending changes to chatbot
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
            onClick={() => navigate('/technologies')}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#e8f5e9' }}>
                  <CodeIcon sx={{ color: '#2e7d32' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    View Technologies
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Browse and edit existing technologies
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
