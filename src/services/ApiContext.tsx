/**
 * API Context - Dependency Inversion Principle (DIP)
 * 
 * Provides API client via React Context instead of direct imports.
 * This allows:
 * - Easy testing with mock clients
 * - Swapping implementations without changing consumers
 * - Better separation of concerns
 */

import { createContext, useContext, ReactNode } from 'react';
import type { IApiClient } from '@/types';
import { ApiClient } from './api';

// Create context with undefined default (must be provided)
const ApiContext = createContext<IApiClient | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
  client?: IApiClient;
}

// Default client instance
const defaultClient = new ApiClient(
  import.meta.env.VITE_API_URL || '/api'
);

/**
 * Provider component for API client
 * Wrap your app with this to provide API access to all components
 */
export function ApiProvider({ children, client = defaultClient }: ApiProviderProps) {
  return (
    <ApiContext.Provider value={client}>
      {children}
    </ApiContext.Provider>
  );
}

/**
 * Hook to access the API client
 * Throws if used outside of ApiProvider
 */
export function useApiClient(): IApiClient {
  const context = useContext(ApiContext);
  
  if (context === undefined) {
    throw new Error('useApiClient must be used within an ApiProvider');
  }
  
  return context;
}

/**
 * Export the default client for edge cases where context isn't available
 * (e.g., during app initialization)
 */
export { defaultClient as apiClient };
