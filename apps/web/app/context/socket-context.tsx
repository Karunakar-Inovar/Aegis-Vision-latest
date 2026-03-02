import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import socketService from '../../../../packages/app/utils/socket';
import config from 'app/config';

// Notification type definition
interface Notification {
    NotificationId: string;
    Title?: string;
    Message?: string;
    Status: 'Unread' | 'Read';
    ReadAt?: string;
    CreatedAt?: string;
    Type?: string;
    Data?: any;
}

// Socket context type definition
interface SocketContextType {
    // Connection
    isConnected: boolean;
    connectSocket: (token: string, socketUrl?: string) => void;
    disconnectSocket: () => void;

    // Notifications
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    removeNotification: (notificationId: string) => void;
    clearAllNotifications: () => void;

    // Permissions
    requestNotificationPermission: () => Promise<NotificationPermission>;

    // Direct socket access if needed
    socket: typeof socketService;
}

// Props for the provider
interface SocketProviderProps {
    children: ReactNode;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocketContext = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocketContext must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    // Always listen for real-time notifications
    useEffect(() => {
        const socket = socketService.getSocket?.();
        if (!socket) return;
        const onNotification = (notification: Notification) => {
            console.log('[SocketContext] Received notification:', notification);
            setNotifications((prev) => {
                // Avoid duplicates
                const exists = prev.some(n => n.NotificationId === notification.NotificationId);
                if (exists) return prev;
                return [notification, ...prev];
            });
            setUnreadCount((prev) => prev + 1);
            // Optional: Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.Title || 'New Notification', {
                    body: notification.Message || 'You have a new notification',
                    icon: '/notification-icon.png',
                    tag: notification.NotificationId
                });
            }
        };
        socket.on('notification', onNotification);
        console.log('[SocketContext] Listening for real-time notifications...');
        return () => {
            socket.off('notification', onNotification);
            console.log('[SocketContext] Stopped listening for notifications.');
        };
    }, [isConnected]);

    /**
     * Connect socket on user login/session active
     * @param token - Supabase auth token
     * @param socketUrl - Socket server URL
     */
    const connectSocket = useCallback((token: string, socketUrl: string = config.apiUrl): void => {
        if (!token) {
            console.error('Cannot connect socket: No token provided');
            return;
        }

        try {
            const socket = socketService.connect(token, socketUrl);

            // Update connection status
            socket.on('connect', () => {
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                setIsConnected(false);
            });

            console.log('Socket connection initiated');
        } catch (error) {
            console.error('Failed to connect socket:', error);
        }
    }, []);

    /**
     * Disconnect socket on user logout
     */
    const disconnectSocket = useCallback((): void => {
        socketService.disconnect();
        setIsConnected(false);
        setNotifications([]);
        setUnreadCount(0);
        console.log('Socket disconnected and state cleared');
    }, []);

    /**
     * Mark notification as read
     * @param notificationId - Notification ID
     */
    const markAsRead = useCallback((notificationId: string): void => {
        socketService.markNotificationAsRead(notificationId);

        setNotifications((prev) =>
            prev.map((n) =>
                n.NotificationId === notificationId
                    ? { ...n, Status: 'Read' as const, ReadAt: new Date().toISOString() }
                    : n
            )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
    }, []);

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = useCallback((): void => {
        notifications.forEach((notification) => {
            if (notification.Status !== 'Read') {
                socketService.markNotificationAsRead(notification.NotificationId);
            }
        });

        setNotifications((prev) =>
            prev.map((n) => ({
                ...n,
                Status: 'Read' as const,
                ReadAt: new Date().toISOString()
            }))
        );

        setUnreadCount(0);
    }, [notifications]);

    /**
     * Clear a single notification from UI
     * @param notificationId - Notification ID
     */
    const removeNotification = useCallback((notificationId: string): void => {
        setNotifications((prev) => {
            const notification = prev.find(n => n.NotificationId === notificationId);
            const wasUnread = notification && notification.Status !== 'Read';

            if (wasUnread) {
                setUnreadCount((count) => Math.max(0, count - 1));
            }

            return prev.filter((n) => n.NotificationId !== notificationId);
        });
    }, []);

    /**
     * Clear all notifications from UI
     */
    const clearAllNotifications = useCallback((): void => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    /**
     * Request browser notification permission
     */
    const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
            return permission;
        }
        return Notification.permission;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            socketService.disconnect();
        };
    }, []);

    const value: SocketContextType = {
        // Connection
        isConnected,
        connectSocket,
        disconnectSocket,

        // Notifications
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,

        // Permissions
        requestNotificationPermission,

        // Direct socket access if needed
        socket: socketService,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

// Export types for use in other components
export type { Notification, SocketContextType, SocketProviderProps };