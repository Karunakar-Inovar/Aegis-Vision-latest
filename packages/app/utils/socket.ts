import config from 'app/config';
import { io, Socket } from 'socket.io-client';

type EventCallback = (...args: any[]) => void;

interface SocketServiceConfig {
    url?: string;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    reconnectionDelayMax?: number;
    timeout?: number;
}

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, EventCallback[]> = new Map();

    /**
     * Connect to Socket.IO server
     * @param token - Authentication token from Supabase
     * @param url - Socket server URL (default: http://localhost:5500)
     * @returns Socket instance
     */
    connect(token: string, url: string = config.wsUrl): Socket {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return this.socket;
        }

        this.socket = io(url, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        // Setup default event listeners
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('Socket connection error:', error.message);
        });

        this.socket.on('disconnect', (reason: string) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('reconnect', (attemptNumber: number) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
        });

        this.socket.on('reconnect_attempt', (attemptNumber: number) => {
            console.log('Attempting to reconnect...', attemptNumber);
        });

        this.socket.on('reconnect_error', (error: Error) => {
            console.error('Reconnection error:', error.message);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('Reconnection failed after all attempts');
        });

        return this.socket;
    }

    /**
     * Disconnect from Socket.IO server
     */
    disconnect(): void {
        if (this.socket) {
            console.log('Disconnecting socket...');
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    /**
     * Check if socket is connected
     * @returns Connection status
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Listen to an event
     * @param event - Event name
     * @param callback - Callback function
     */
    on(event: string, callback: EventCallback): void {
        if (!this.socket) {
            console.warn('Socket not initialized. Call connect() first.');
            return;
        }

        // Store listener reference for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);

        this.socket.on(event, callback);
    }

    /**
     * Remove event listener
     * @param event - Event name
     * @param callback - Callback function
     */
    off(event: string, callback: EventCallback): void {
        if (!this.socket) return;

        this.socket.off(event, callback);

        // Remove from tracked listeners
        const listeners = this.listeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
            if (listeners.length === 0) {
                this.listeners.delete(event);
            }
        }
    }

    /**
     * Emit an event
     * @param event - Event name
     * @param data - Data to send
     */
    emit(event: string, data?: any): void {
        if (!this.socket) {
            console.warn('Socket not initialized. Call connect() first.');
            return;
        }

        if (!this.socket.connected) {
            console.warn('Socket not connected. Cannot emit event:', event);
            return;
        }

        this.socket.emit(event, data);
    }

    /**
     * Mark notification as read
     * @param notificationId - Notification ID
     */
    markNotificationAsRead(notificationId: string): void {
        this.emit('notification:read', notificationId);
    }

    /**
     * Get socket ID
     * @returns Socket ID or null if not connected
     */
    getSocketId(): string | null {
        return this.socket?.id || null;
    }

    /**
     * Get socket instance (for advanced usage)
     * @returns Socket instance or null
     */
    getSocket(): Socket | null {
        return this.socket;
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
export { SocketService };
export type { EventCallback, SocketServiceConfig };