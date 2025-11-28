import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Code as CodeIcon,
  SyncAlt as SyncIcon,
  Settings as SettingsIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  SmartToy as AIIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Hub as VectorizeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStagedChangesCount } from '@hooks/useStagedChanges';

const DRAWER_WIDTH = 280;

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  showBadge?: boolean;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  // D1CV Section
  { text: 'Technologies', icon: <CodeIcon />, path: '/d1cv/technologies', section: 'D1CV (Portfolio)' },
  { text: 'Experience', icon: <WorkIcon />, path: '/d1cv/experience', section: 'D1CV (Portfolio)' },
  { text: 'Education', icon: <SchoolIcon />, path: '/d1cv/education', section: 'D1CV (Portfolio)' },
  // AI Agent Section  
  { text: 'Technologies', icon: <CodeIcon />, path: '/ai-agent/technologies', section: 'AI Agent' },
  { text: 'Vectorize', icon: <VectorizeIcon />, path: '/ai-agent/vectorize', section: 'AI Agent' },
  // Staging & Settings
  { text: 'Staged Changes', icon: <SyncIcon />, path: '/staged', showBadge: true },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const SOCIAL_LINKS = [
  { icon: <GitHubIcon />, href: 'https://github.com/josejalvarezm', label: 'GitHub' },
  { icon: <LanguageIcon />, href: 'https://{YOUR_DOMAIN}', label: 'Portfolio' },
];

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { data: stagedCount } = useStagedChangesCount();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          🔧 CV Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {/* Dashboard - standalone */}
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/dashboard'}
            onClick={() => handleNavClick('/dashboard')}
            sx={{
              mx: 1,
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'white',
                '& .MuiListItemIcon-root': { color: 'white' },
                '&:hover': { backgroundColor: 'primary.main' },
              },
            }}
          >
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        {/* D1CV Section */}
        <ListItem sx={{ pt: 2, pb: 0 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon fontSize="small" /> D1CV (Portfolio)
          </Typography>
        </ListItem>
        {NAV_ITEMS.filter(item => item.section === 'D1CV (Portfolio)').map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavClick(item.path)}
              sx={{
                mx: 1,
                ml: 2,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                  '&:hover': { backgroundColor: 'primary.main' },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* AI Agent Section */}
        <ListItem sx={{ pt: 2, pb: 0 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon fontSize="small" /> AI Agent
          </Typography>
        </ListItem>
        {NAV_ITEMS.filter(item => item.section === 'AI Agent').map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavClick(item.path)}
              sx={{
                mx: 1,
                ml: 2,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'secondary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                  '&:hover': { backgroundColor: 'secondary.main' },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 2 }} />

        {/* Staged Changes */}
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/staged'}
            onClick={() => handleNavClick('/staged')}
            sx={{
              mx: 1,
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'warning.light',
                color: 'white',
                '& .MuiListItemIcon-root': { color: 'white' },
                '&:hover': { backgroundColor: 'warning.main' },
              },
            }}
          >
            <ListItemIcon><SyncIcon /></ListItemIcon>
            <ListItemText primary="Staged Changes" />
            {stagedCount && stagedCount.pending > 0 && (
              <Chip label={stagedCount.pending} size="small" color="warning" sx={{ ml: 1 }} />
            )}
          </ListItemButton>
        </ListItem>

        {/* Settings */}
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/settings'}
            onClick={() => handleNavClick('/settings')}
            sx={{
              mx: 1,
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'white',
                '& .MuiListItemIcon-root': { color: 'white' },
                '&:hover': { backgroundColor: 'primary.main' },
              },
            }}
          >
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider sx={{ mt: 'auto' }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Quick Links
        </Typography>
        <Stack direction="row" spacing={1}>
          {SOCIAL_LINKS.map(({ icon, href, label }) => (
            <IconButton
              key={label}
              component="a"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              title={label}
            >
              {icon}
            </IconButton>
          ))}
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))?.text || 'CV Admin Portal'}
          </Typography>
          <Chip
            label="Jose Alvarez"
            variant="outlined"
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
          />
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
