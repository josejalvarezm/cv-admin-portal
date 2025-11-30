/**
 * WebSocket Hook for Real-time Job Updates
 * 
 * Connects to the JobOrchestrator Durable Object via WebSocket
 * for real-time push job status updates.
 * 
 * Usage:
 * ```tsx
 * const { isConnected, jobStatus, subscribe, unsubscribe } = useJobWebSocket();
 * 
 * // Subscribe to a specific job
 * subscribe(jobId);
 * 
 * // Or subscribe to all job updates
 * subscribe('all');
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.admin.{YOUR_DOMAIN}';

export interface DOJobStatus {
    jobId: string;
    commitId: string;
    target: 'both' | 'd1cv' | 'ai-agent';
    overallStatus: 'pending' | 'in-progress' | 'd1cv-done' | 'ai-done' | 'completed' | 'failed';
    d1cvStatus: 'pending' | 'in-progress' | 'success' | 'failed' | 'skipped';
    aiAgentStatus: 'pending' | 'in-progress' | 'success' | 'failed' | 'skipped';
    d1cvResult?: { success: boolean; message?: string; error?: string };
    aiAgentResult?: { success: boolean; message?: string; error?: string };
    startedAt: string;
    updatedAt: string;
    completedAt?: string;
}

interface WebSocketMessage {
    type: 'connected' | 'status' | 'active-jobs' | 'pong' | 'error';
    jobId?: string;
    data?: DOJobStatus | DOJobStatus[] | string;
    timestamp: string;
    message?: string;
}

interface UseJobWebSocketReturn {
    isConnected: boolean;
    isConnecting: boolean;
    jobStatus: Map<string, DOJobStatus>;
    activeJobs: DOJobStatus[];
    error: string | null;
    subscribe: (jobId: string) => void;
    unsubscribe: (jobId: string) => void;
    requestActiveJobs: () => void;
    connect: () => void;
    disconnect: () => void;
}

export function useJobWebSocket(): UseJobWebSocketReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [jobStatus, setJobStatus] = useState<Map<string, DOJobStatus>>(new Map());
    const [activeJobs, setActiveJobs] = useState<DOJobStatus[]>([]);
    const [error, setError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const subscriptionsRef = useRef<Set<string>>(new Set());

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        setIsConnecting(true);
        setError(null);

        // Convert HTTPS URL to WSS
        const wsUrl = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');

        try {
            wsRef.current = new WebSocket(`${wsUrl}/v2/ws`);

            wsRef.current.onopen = () => {
                setIsConnected(true);
                setIsConnecting(false);
                setError(null);

                // Re-subscribe to any previously subscribed jobs
                subscriptionsRef.current.forEach(jobId => {
                    wsRef.current?.send(JSON.stringify({ type: 'subscribe', jobId }));
                });

                // Start ping interval to keep connection alive
                pingIntervalRef.current = setInterval(() => {
                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 30000); // 30 seconds
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);

                    switch (message.type) {
                        case 'connected':
                            console.log('WebSocket connected:', message.message);
                            break;

                        case 'status':
                            if (message.jobId && message.data && typeof message.data === 'object' && 'jobId' in message.data) {
                                setJobStatus(prev => {
                                    const next = new Map(prev);
                                    next.set(message.jobId!, message.data as DOJobStatus);
                                    return next;
                                });
                            }
                            break;

                        case 'active-jobs':
                            if (Array.isArray(message.data)) {
                                setActiveJobs(message.data);
                            }
                            break;

                        case 'pong':
                            // Connection is alive
                            break;

                        case 'error':
                            setError(typeof message.data === 'string' ? message.data : 'Unknown error');
                            break;
                    }
                } catch (err) {
                    console.error('WebSocket message parse error:', err);
                }
            };

            wsRef.current.onclose = (event) => {
                setIsConnected(false);
                setIsConnecting(false);

                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                }

                // Reconnect after 5 seconds if not a clean close
                if (event.code !== 1000) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, 5000);
                }
            };

            wsRef.current.onerror = () => {
                setError('WebSocket connection error');
                setIsConnecting(false);
            };

        } catch (err) {
            setError(`Failed to create WebSocket: ${err}`);
            setIsConnecting(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close(1000, 'User disconnect');
            wsRef.current = null;
        }
        setIsConnected(false);
        subscriptionsRef.current.clear();
    }, []);

    const subscribe = useCallback((jobId: string) => {
        subscriptionsRef.current.add(jobId);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'subscribe', jobId }));
        }
    }, []);

    const unsubscribe = useCallback((jobId: string) => {
        subscriptionsRef.current.delete(jobId);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'unsubscribe', jobId }));
        }

        // Remove from local state
        setJobStatus(prev => {
            const next = new Map(prev);
            next.delete(jobId);
            return next;
        });
    }, []);

    const requestActiveJobs = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'list-active' }));
        }
    }, []);

    // Auto-connect on mount
    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        isConnecting,
        jobStatus,
        activeJobs,
        error,
        subscribe,
        unsubscribe,
        requestActiveJobs,
        connect,
        disconnect,
    };
}

/**
 * Hook to track a specific job
 */
export function useJobStatus(jobId: string | null): DOJobStatus | null {
    const { jobStatus, subscribe, unsubscribe } = useJobWebSocket();

    useEffect(() => {
        if (jobId) {
            subscribe(jobId);
            return () => unsubscribe(jobId);
        }
    }, [jobId, subscribe, unsubscribe]);

    return jobId ? (jobStatus.get(jobId) ?? null) : null;
}
