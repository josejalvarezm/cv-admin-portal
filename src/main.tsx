/**
 * Application Entry Point
 * 
 * SOLID Principles Applied:
 * - DIP: ApiProvider wraps the app for dependency injection
 * 
 * OWASP Security:
 * - React.StrictMode helps catch common security issues
 * - CssBaseline provides consistent security-conscious base styles
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { theme } from './theme';
import { ApiProvider } from '@services/ApiContext';

// Configure React Query with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 1, // Only retry once to fail fast
      refetchOnWindowFocus: false, // Don't refetch on focus (security consideration)
    },
    mutations: {
      retry: 0, // Don't retry mutations (prevent duplicate submissions)
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApiProvider>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </ApiProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

