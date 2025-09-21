import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { socketService } from "../services/socket.service";
import { useAuthStore } from "../store/auth.store";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  userId: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  connectSocket: (token?: string) => void;
  disconnectSocket: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const connectSocket = (token?: string) => {
    if (!isAuthenticated) {
      console.log("User not authenticated, skipping socket connection");
      return;
    }
    const socket = socketService.connect(token);

    socket.on("connect", () => {
      setIsConnected(true);
      if (user?.id) {
        socket.emit("join-notifications", { userId: user.id });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    socket.on("notifications:history", (history: Notification[]) => {
      setNotifications(history);
    });
  };

  const disconnectSocket = () => {
    socketService.disconnect();
    setIsConnected(false);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );

    // Emit to server
    socketService.emit("notification:read", { notificationId });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Emit to server
    socketService.emit("notifications:markAllRead");
  };

  const removeNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, user?.id]);

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
