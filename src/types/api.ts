// API types - Interface definitions for Dependency Inversion Principle

/**
 * HTTP methods supported by the API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * API error response structure
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

/**
 * API client interface - Dependency Inversion Principle
 * Depend on abstractions, not concretions
 */
export interface IApiClient {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data: unknown): Promise<T>;
  put<T>(endpoint: string, data: unknown): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

/**
 * API configuration options
 */
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
}
