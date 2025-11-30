/**
 * useAICategories Hook
 * 
 * Fetches AI Agent categories with localStorage caching to minimize API calls.
 * Categories are cached for 24 hours and loaded instantly from cache on subsequent visits.
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@services/api';

const CACHE_KEY = 'ai_categories_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedCategories {
    categories: string[];
    timestamp: number;
}

interface CategoriesResponse {
    categories: string[];
    count: number;
}

/**
 * Get cached categories from localStorage if still valid
 */
function getCachedCategories(): string[] | null {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const parsed: CachedCategories = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is still valid (within TTL)
        if (now - parsed.timestamp < CACHE_TTL_MS) {
            return parsed.categories;
        }

        // Cache expired, remove it
        localStorage.removeItem(CACHE_KEY);
        return null;
    } catch {
        // Invalid cache, remove it
        localStorage.removeItem(CACHE_KEY);
        return null;
    }
}

/**
 * Save categories to localStorage cache
 */
function setCachedCategories(categories: string[]): void {
    try {
        const cache: CachedCategories = {
            categories,
            timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
        // localStorage might be full or disabled, ignore
    }
}

/**
 * Clear the categories cache (for manual refresh)
 */
export function clearAICategoriesCache(): void {
    localStorage.removeItem(CACHE_KEY);
}

/**
 * Hook to fetch AI Agent categories with localStorage caching
 * 
 * - First checks localStorage for cached categories
 * - If cache is valid (< 24h), uses cached data without API call
 * - If cache is expired/missing, fetches from API and caches result
 */
export function useAICategories() {
    // Check cache on initial render
    const cachedData = getCachedCategories();

    return useQuery<string[], Error>({
        queryKey: ['ai-categories'],
        queryFn: async () => {
            // Double-check cache (in case another tab updated it)
            const cached = getCachedCategories();
            if (cached) {
                return cached;
            }

            // Fetch from API
            const response = await apiClient.get<CategoriesResponse>('/api/ai-agent/categories');
            const categories = response.categories || [];

            // Cache the result
            setCachedCategories(categories);

            return categories;
        },
        // Use cached data as initial data (instant load)
        initialData: cachedData || undefined,
        // Only refetch if we don't have cached data
        staleTime: cachedData ? CACHE_TTL_MS : 0,
        // Don't refetch on window focus if we have cached data
        refetchOnWindowFocus: !cachedData,
        // Cache for the session
        gcTime: CACHE_TTL_MS,
    });
}
