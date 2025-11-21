import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { socketService } from "../services/socket.service";
import { useAuthStore } from "../store/auth.store";
import NotificationService, {
  type NotificationData,
} from "../services/notification.service";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  userId: string;
  data?: any;
  created_at?: string;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading?: boolean;
  connectSocket: (token?: string) => void;
  disconnectSocket: () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  refreshNotifications?: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  // Fetch notifications from API
  const fetchNotifications = async () => {
    const userId = user?._id || user?.id;
    if (!isAuthenticated || !userId) {
      console.log(
        "Cannot fetch notifications: not authenticated or no user ID"
      );
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching notifications for user:", userId);
      const response = await NotificationService.getNotifications({
        page: 1,
        limit: 50,
      });
      console.log("Notifications response:", response);
      if (response.success && response.data) {
        const formattedNotifications = response.data.notifications.map(
          (notif: NotificationData) => ({
            id: notif._id,
            title: notif.title,
            message: notif.message,
            type: mapNotificationType(notif.type),
            timestamp: new Date(notif.createdAt),
            read: notif.isRead,
            userId: notif.userId,
            data: notif.data,
            created_at: notif.createdAt,
            actionUrl: notif.actionUrl,
          })
        );
        setNotifications(formattedNotifications);
        setUnreadCount(response.data.unreadCount);
        console.log(
          `Loaded ${formattedNotifications.length} notifications, ${response.data.unreadCount} unread`
        );
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Map backend notification type to frontend type
  const mapNotificationType = (
    type: NotificationData["type"]
  ): "info" | "success" | "warning" | "error" => {
    switch (type) {
      case "HOMEWORK_GRADED":
      case "CLASS_CREATED":
      case "CONTACT_REQUEST":
      case "CONTRACT_APPROVED":
        return "success";
      case "CANCELLATION_REQUESTED":
      case "HOMEWORK_ASSIGNED":
      case "CONTRACT_CREATED":
      case "CONTRACT_EXPIRED":
        return "warning";
      case "SYSTEM":
      case "CONTRACT_REJECTED":
      case "CONTRACT_CANCELLED":
        return "error";
      default:
        return "info";
    }
  };

  const connectSocket = (token?: string) => {
    if (!isAuthenticated) {
      console.log("User not authenticated, skipping socket connection");
      return;
    }
    const userId = user?._id || user?.id;
    if (!userId) {
      console.log("No user ID available, skipping socket connection");
      return;
    }

    // Cleanup existing listeners before setting up new ones
    const existingSocket = socketService.getSocket();
    if (existingSocket) {
      existingSocket.off("connect");
      existingSocket.off("disconnect");
      existingSocket.off("notification");
      existingSocket.off("connect_error");
      existingSocket.off("reconnect");
      existingSocket.off("notifications:history");
    }

    console.log("Connecting socket for user:", userId);
    const socket = socketService.connect(token);

    const handleConnect = () => {
      console.log(
        "Socket connected, joining notifications room for user:",
        userId
      );
      setIsConnected(true);
      socket.emit("join-notifications", { userId: userId });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleNotification = (notificationData: NotificationData) => {
      console.log("Received notification via socket:", notificationData);
      // Convert backend notification format to frontend format
      const notification: Notification = {
        id: notificationData._id,
        title: notificationData.title,
        message: notificationData.message,
        type: mapNotificationType(notificationData.type),
        timestamp: new Date(notificationData.createdAt),
        read: notificationData.isRead,
        userId: notificationData.userId,
        data: notificationData.data,
        created_at: notificationData.createdAt,
        actionUrl: notificationData.actionUrl,
      };

      setNotifications((prev) => {
        // Check if notification already exists to avoid duplicates
        const exists = prev.some((n) => n.id === notification.id);
        if (exists) {
          console.log("Notification already exists, skipping duplicate");
          return prev;
        }
        return [notification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
      console.log("Notification added to list");
    };

    const handleConnectError = (error: Error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    };

    const handleReconnect = (attemptNumber: number) => {
      console.log("Reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
      // Rejoin notifications room after reconnect
      socket.emit("join-notifications", { userId: userId });
    };

    const handleHistory = (history: Notification[]) => {
      setNotifications(history);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("notification", handleNotification);
    socket.on("connect_error", handleConnectError);
    socket.on("reconnect", handleReconnect);
    socket.on("notifications:history", handleHistory);
  };

  const disconnectSocket = () => {
    socketService.disconnect();
    setIsConnected(false);
  };

  const markAsRead = async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await NotificationService.markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  const markAllAsRead = async () => {
    const currentUnread = unreadCount;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await NotificationService.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      // Revert on error
      setNotifications((prev) => prev.map((n) => ({ ...n, read: false })));
      setUnreadCount(currentUnread);
    }
  };

  const removeNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (isAuthenticated && userId) {
      console.log(
        "User authenticated, fetching notifications and connecting socket"
      );
      fetchNotifications();
      connectSocket();
    } else {
      console.log("User not authenticated, disconnecting socket");
      disconnectSocket();
      setNotifications([]);
      setUnreadCount(0);
    }

    // Cleanup on unmount only
    return () => {
      if (!isAuthenticated) {
        disconnectSocket();
      }
    };
  }, [isAuthenticated, user?._id, user?.id]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    connectSocket,
    disconnectSocket,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    isLoading,
    refreshNotifications: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
