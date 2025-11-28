/**
 * Input Sanitization Utilities
 * 
 * OWASP Security Best Practices:
 * - A7:2017 - Cross-Site Scripting (XSS)
 * - A1:2017 - Injection
 * 
 * These utilities sanitize user input before sending to the API.
 * The backend should also validate/sanitize, but defense-in-depth is key.
 */

/**
 * Sanitize a string by removing potentially dangerous characters
 * Prevents XSS and injection attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Encode HTML entities to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Limit length to prevent DoS
    .slice(0, 10000);
}

/**
 * Sanitize a string for display (decode entities back)
 * Use only when displaying user-provided content
 */
export function sanitizeForDisplay(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

/**
 * Validate and sanitize an email address
 * OWASP: Input validation for email
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') {
    return null;
  }

  const trimmed = email.trim().toLowerCase();
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmed) || trimmed.length > 254) {
    return null;
  }

  return trimmed;
}

/**
 * Sanitize a URL
 * OWASP: Prevent open redirect and URL injection
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize an integer ID
 * OWASP: Prevent injection via numeric fields
 */
export function sanitizeId(id: unknown): number | null {
  if (id === null || id === undefined) {
    return null;
  }

  const parsed = typeof id === 'string' ? parseInt(id, 10) : Number(id);
  
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > Number.MAX_SAFE_INTEGER) {
    return null;
  }

  return parsed;
}

/**
 * Sanitize an object by sanitizing all string values
 * Deep sanitization for nested objects
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Don't over-sanitize for API payloads - just trim and remove null bytes
      result[key as keyof T] = value.replace(/\0/g, '').trim() as T[keyof T];
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key as keyof T] = sanitizeObject(value as Record<string, unknown>) as T[keyof T];
    } else {
      result[key as keyof T] = value as T[keyof T];
    }
  }

  return result;
}

/**
 * Validate technology name
 * OWASP: Whitelist validation
 */
export function validateTechnologyName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 1) {
    return { valid: false, error: 'Name is required' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Name must be 100 characters or less' };
  }

  // Allow alphanumeric, spaces, dots, hashes, plus, and common symbols
  const validPattern = /^[a-zA-Z0-9\s.\-+#/()]+$/;
  if (!validPattern.test(trimmed)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Rate limiting helper for client-side throttling
 * OWASP: DoS prevention
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests: number[] = [];

  return {
    canMakeRequest(): boolean {
      const now = Date.now();
      const windowStart = now - windowMs;

      // Remove old requests outside the window
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift();
      }

      return requests.length < maxRequests;
    },

    recordRequest(): void {
      requests.push(Date.now());
    },

    getRemainingRequests(): number {
      const now = Date.now();
      const windowStart = now - windowMs;

      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift();
      }

      return Math.max(0, maxRequests - requests.length);
    },
  };
}
