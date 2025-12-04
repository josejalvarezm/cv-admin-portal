/**
 * API Client Unit Tests
 * 
 * Tests for the ApiClient class which handles all HTTP communication.
 * Uses mocked fetch to test various scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient, ApiError } from '@services/api';

describe('ApiClient', () => {
    let client: ApiClient;
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        client = new ApiClient('http://localhost:8787/api');
        mockFetch = vi.fn();
        global.fetch = mockFetch;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('GET requests', () => {
        it('should make successful GET request', async () => {
            const mockData = { id: 1, name: 'Test' };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockData,
            });

            const result = await client.get('/technologies');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8787/api/technologies',
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            );
            expect(result).toEqual(mockData);
        });

        it('should include credentials for cross-origin requests', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({}),
            });

            await client.get('/test');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    credentials: 'include',
                })
            );
        });
    });

    describe('POST requests', () => {
        it('should make successful POST request with JSON body', async () => {
            const requestData = { name: 'TypeScript', level: 'Advanced' };
            const responseData = { id: 1, ...requestData };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => responseData,
            });

            const result = await client.post('/technologies', requestData);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8787/api/technologies',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(requestData),
                })
            );
            expect(result).toEqual(responseData);
        });

        it('should sanitize object data before sending', async () => {
            const requestData = { name: '  Trimmed  ', value: 'test\0null' };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({}),
            });

            await client.post('/test', requestData);

            // The sanitizeObject function trims strings and removes null bytes
            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({ name: 'Trimmed', value: 'testnull' }),
                })
            );
        });
    });

    describe('PUT requests', () => {
        it('should make successful PUT request', async () => {
            const updateData = { name: 'Updated', level: 'Expert' };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ id: 1, ...updateData }),
            });

            const result = await client.put('/technologies/1', updateData);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8787/api/technologies/1',
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(updateData),
                })
            );
            expect(result).toEqual({ id: 1, ...updateData });
        });
    });

    describe('DELETE requests', () => {
        it('should make successful DELETE request', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ success: true }),
            });

            const result = await client.delete('/technologies/1');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8787/api/technologies/1',
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
            expect(result).toEqual({ success: true });
        });
    });

    describe('Error handling', () => {
        it('should throw ApiError on HTTP error response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ message: 'Not found', code: 'NOT_FOUND' }),
            });

            try {
                await client.get('/missing');
                expect.fail('Should have thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect((error as ApiError).status).toBe(404);
                expect((error as ApiError).code).toBe('NOT_FOUND');
            }
        });

        it('should detect session expiry when HTML is returned', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'text/html' }),
                text: async () => '<html>Login page</html>',
            });

            try {
                await client.get('/protected');
                expect.fail('Should have thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect((error as ApiError).status).toBe(401);
                expect((error as ApiError).code).toBe('AUTH_REQUIRED');
            }
        });

        it('should throw on network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network failure'));

            try {
                await client.get('/test');
                expect.fail('Should have thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect((error as ApiError).code).toBe('NETWORK_ERROR');
            }
        });

        it('should throw on invalid JSON response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'text/plain' }),
                json: async () => ({}),
            });

            try {
                await client.get('/test');
                expect.fail('Should have thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect((error as ApiError).code).toBe('INVALID_RESPONSE');
            }
        });
    });

    describe('URL handling', () => {
        it('should handle endpoints with leading slash', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({}),
            });

            await client.get('/test');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8787/api/test',
                expect.any(Object)
            );
        });

        it('should handle endpoints without leading slash', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({}),
            });

            await client.get('test');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8787/api/test',
                expect.any(Object)
            );
        });
    });
});

describe('ApiError', () => {
    it('should create error with correct properties', () => {
        const error = new ApiError('Test error', 500, 'SERVER_ERROR');

        expect(error.message).toBe('Test error');
        expect(error.status).toBe(500);
        expect(error.code).toBe('SERVER_ERROR');
        expect(error.name).toBe('ApiError');
    });

    it('should be instanceof Error', () => {
        const error = new ApiError('Test', 400);

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ApiError);
    });

    it('should work without code', () => {
        const error = new ApiError('Test error', 500);

        expect(error.code).toBeUndefined();
    });
});
