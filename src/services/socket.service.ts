import { io, Socket } from "socket.io-client";

interface MessageData {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  fileMetadata?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  };
  status: 'sent' | 'delivered' | 'read';
  replyTo?: {
    messageId: string;
    content: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationData {
  _id: string;
  contactRequestId: string;
  studentId: any;
  tutorId: any;
  tutorPostId: any;
  subject: any;
  status: 'active' | 'closed';
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
  };
  unreadCount: {
    student: number;
    tutor: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface TypingData {
  userId: string;
  isTyping: boolean;
}

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl: string = import.meta.env.VITE_SOCKET_URL;

  connect(token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      auth: {
        token: token || localStorage.getItem("access_token"),
      },
      transports: ["websocket", "polling"],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to server:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("Reconnection failed:", error);
    });
  }

  // Chat-specific methods
  joinChat(userId: string): void {
    this.emit('join-chat', userId);
  }

  joinConversation(conversationId: string): void {
    this.emit('join-conversation', conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.emit('leave-conversation', conversationId);
  }

  startTyping(conversationId: string, userId: string): void {
    this.emit('typing-start', { conversationId, userId });
  }

  stopTyping(conversationId: string, userId: string): void {
    this.emit('typing-stop', { conversationId, userId });
  }

  // Event listeners for chat
  onNewMessage(callback: (message: MessageData) => void): void {
    this.on('new-message', callback);
  }

  // Conversation room message event from backend
  onMessageReceived(callback: (message: MessageData) => void): void {
    this.on('message-received', callback);
  }

  onMessageStatusUpdate(callback: (data: { messageId: string; status: string }) => void): void {
    this.on('message-status-update', callback);
  }

  onConversationUpdate(callback: (conversation: ConversationData) => void): void {
    this.on('conversation-update', callback);
  }

  onUserTyping(callback: (data: TypingData) => void): void {
    this.on('user-typing', callback);
  }

  onConversationClosed(callback: (conversationId: string) => void): void {
    this.on('conversation-closed', callback);
  }

  // Remove chat event listeners
  offNewMessage(callback?: (message: MessageData) => void): void {
    this.off('new-message', callback);
  }

  offMessageReceived(callback?: (message: MessageData) => void): void {
    this.off('message-received', callback);
  }

  offMessageStatusUpdate(callback?: (data: { messageId: string; status: string }) => void): void {
    this.off('message-status-update', callback);
  }

  offConversationUpdate(callback?: (conversation: ConversationData) => void): void {
    this.off('conversation-update', callback);
  }

  offUserTyping(callback?: (data: TypingData) => void): void {
    this.off('user-typing', callback);
  }

  offConversationClosed(callback?: (conversationId: string) => void): void {
    this.off('conversation-closed', callback);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
