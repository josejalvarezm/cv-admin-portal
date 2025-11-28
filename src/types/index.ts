/**
 * CV Admin Portal - Type Definitions
 * 
 * Architecture: Types are split by domain following Interface Segregation Principle (ISP)
 * - technology.ts: Technology domain types
 * - staging.ts: Staging/sync domain types  
 * - api.ts: API client abstractions
 * 
 * This index file re-exports all types for convenience
 */

// Re-export all domain types
export * from './technology';
export * from './staging';
export * from './api';

