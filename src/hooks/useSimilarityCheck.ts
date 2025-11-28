/**
 * Similarity Check Hook - Single Responsibility Principle (SRP)
 * 
 * This hook has one job: check for similar technologies in the AI agent
 * using semantic search to prevent duplicate entries.
 * 
 * OWASP: 
 * - Input is URL-encoded to prevent injection
 * - Response is validated before use
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@services/api';
import type { SimilarTechnology } from '@/types';

interface SimilarityResponse {
  query: string;
  matches: SimilarTechnology[];
}

interface UseSimilarityCheckOptions {
  /** Whether the query should be enabled */
  enabled?: boolean;
  /** Minimum score to include in results (0-1) */
  minScore?: number;
}

/**
 * Check for similar technologies using semantic search
 * 
 * @param name - Technology name to search for
 * @param options - Configuration options
 * @returns Query result with similar technologies
 */
export function useSimilarityCheck(
  name: string,
  options: UseSimilarityCheckOptions = {}
) {
  const { enabled = true, minScore = 0.5 } = options;

  return useQuery<SimilarTechnology[]>({
    queryKey: ['similarity', name],
    queryFn: async () => {
      // OWASP: URL-encode the input to prevent injection
      const encodedName = encodeURIComponent(name.trim());
      const response = await apiClient.get<SimilarityResponse>(
        `/api/similarity/${encodedName}`
      );
      
      // Filter by minimum score and validate response shape
      const matches = response?.matches ?? [];
      return matches
        .filter((match): match is SimilarTechnology => 
          typeof match?.stable_id === 'string' &&
          typeof match?.name === 'string' &&
          typeof match?.score === 'number' &&
          match.score >= minScore
        )
        .sort((a, b) => b.score - a.score); // Sort by score descending
    },
    enabled: enabled && name.trim().length >= 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1, // Only retry once for this query
  });
}

