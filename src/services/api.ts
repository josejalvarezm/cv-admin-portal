/**
 * API Client - Single Responsibility Principle (SRP)
 * 
 * This class has one responsibility: HTTP communication with the backend.
 * It implements IApiClient interface for Dependency Inversion.
 * 
 * OWASP Security:
 * - A2:2017 - Broken Authentication: credentials: 'include' for Cloudflare Access
 * - A3:2017 - Sensitive Data Exposure: HTTPS only via Content-Security-Policy
 * - A7:2017 - XSS: Content-Type enforcement
 */

import type { IApiClient } from '@/types';
import { sanitizeObject } from '@utils/sanitize';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Request timeout in milliseconds (OWASP: DoS prevention)
const REQUEST_TIMEOUT = 30000;

export class ApiClient implements IApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Always use the base URL for API calls
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // OWASP: Implement timeout to prevent hanging requests (DoS)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        // Include credentials for cross-origin requests
        credentials: 'include',
      });

      clearTimeout(timeoutId);

      // Check if we got redirected to login page (HTML instead of JSON)
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        // User session expired or not authenticated
        throw new ApiError(
          'Session expired. Please refresh the page to log in again.',
          401,
          'AUTH_REQUIRED'
        );
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new ApiError(
          error.message || `HTTP ${response.status}`,
          response.status,
          error.code
        );
      }

      // Verify response is JSON before parsing
      if (!contentType.includes('application/json')) {
        throw new ApiError(
          'Invalid response format',
          500,
          'INVALID_RESPONSE'
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    // OWASP: Sanitize input before sending
    const sanitizedData = typeof data === 'object' && data !== null
      ? sanitizeObject(data as Record<string, unknown>)
      : data;

    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    // OWASP: Sanitize input before sending
    const sanitizedData = typeof data === 'object' && data !== null
      ? sanitizeObject(data as Record<string, unknown>)
      : data;

    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(sanitizedData),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * Custom API Error class for better error handling
 * Includes status code and error code for programmatic handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Default instance for backward compatibility
// Prefer using ApiContext for new code (Dependency Inversion)
export const apiClient = new ApiClient(API_BASE_URL);

