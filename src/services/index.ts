/**
 * Services barrel export
 * 
 * Dependency Inversion Principle: Prefer using ApiProvider and useApiClient
 * for dependency injection. The apiClient export is for backward compatibility.
 */

// API client (concrete implementation - use for initialization only)
export { apiClient, ApiClient, ApiError } from './api';

// API Context (Dependency Inversion - prefer this in components)
export { ApiProvider, useApiClient } from './ApiContext';
