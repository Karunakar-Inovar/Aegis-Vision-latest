import { useEffect, useCallback, useRef, DependencyList } from 'react';
import { useSocketContext, SocketContextType, Notification } from './socket-context';

/**
 * Custom hook for Socket.IO functionality
 * Provides easy access to socket methods and notification management
 */
export const useSocket = (): SocketContextType => {
    const context = useSocketContext();
    return context;
};

/**
 * Hook to listen to custom socket events
 * Automatically cleans up listeners on unmount
 * 
 * @param event - Event name to listen to
 * @param callback - Callback function
 * @param dependencies - Dependencies array for the callback
 */
export const useSocketEvent = (
    event: string,
    callback: (...args: any[]) => void,
    dependencies: DependencyList = []
): void => {
    const { socket } = useSocketContext();
    const savedCallback = useRef<(...args: any[]) => void>();

    // Update callback ref when it changes
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!socket || !event) return;

        const eventHandler = (...args: any[]) => {
            savedCallback.current?.(...args);
        };

        socket.on(event, eventHandler);

        return () => {
            socket.off(event, eventHandler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, event, ...dependencies]);
};

/**
 * Hook to emit socket events
 * Returns a memoized emit function
 */
export const useSocketEmit = (): ((event: string, data?: any) => void) => {
    const { socket } = useSocketContext();

    const emit = useCallback((event: string, data?: any): void => {
        if (!socket) {
            console.warn('Socket not available');
            return;
        }

        socket.emit(event, data);
    }, [socket]);

    return emit;
};

/**
 * Return type for useNotifications hook
 */
interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    removeNotification: (notificationId: string) => void;
    clearAllNotifications: () => void;
    getUnreadNotifications: () => Notification[];
    getReadNotifications: () => Notification[];
}

/**
 * Hook for notification management
 * Provides notification-specific functionality
 */
export const useNotifications = (): UseNotificationsReturn => {
    const {
        notifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications
    } = useSocketContext();

    // Calculate unreadCount based on Status !== 'Read'
    const unreadCount = notifications.filter(n => n.Status !== 'Read').length;

    const getUnreadNotifications = useCallback((): Notification[] => {
        return notifications.filter(n => n.Status !== 'Read');
    }, [notifications]);

    const getReadNotifications = useCallback((): Notification[] => {
        return notifications.filter(n => n.Status === 'Read');
    }, [notifications]);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        getUnreadNotifications,
        getReadNotifications
    };
};

export default useSocket;