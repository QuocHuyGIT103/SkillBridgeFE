import { create } from "zustand";
import { messageService } from "../services/message.service";
import type {
  MessageData,
  ConversationData,
  SendMessageRequest,
} from "../services/message.service";
import { socketService } from "../services/socket.service";
import toast from "react-hot-toast";
import {
  normalizeMessage,
  normalizeConversation,
} from "../services/message.service";

interface MessageState {
  // Conversations
  conversations: ConversationData[];
  selectedConversation: ConversationData | null;
  conversationsLoading: boolean;
  lastFetchAt?: number;

  // Messages
  messages: MessageData[];
  messagesLoading: boolean;
  messagesPagination: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;

  // UI State
  isTyping: { [userId: string]: boolean };
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string, page?: number) => Promise<void>;
  sendMessage: (
    conversationId: string,
    data: SendMessageRequest
  ) => Promise<void>;
  createConversation: (
    contactRequestId: string
  ) => Promise<ConversationData | null>;
  createConversationFromClass: (
    classId: string
  ) => Promise<ConversationData | null>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  closeConversation: (conversationId: string) => Promise<void>;
  getConversationByContactRequest: (
    contactRequestId: string
  ) => Promise<ConversationData | null>;
  getOrCreateConversationByClass: (
    classId: string
  ) => Promise<ConversationData | null>;

  // Socket actions
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  startTyping: (conversationId: string, userId: string) => void;
  stopTyping: (conversationId: string, userId: string) => void;

  // UI actions
  setSelectedConversation: (conversation: ConversationData | null) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  clearError: () => void;

  // Socket event handlers
  handleNewMessage: (message: MessageData) => void;
  handleConversationUpdate: (conversation: ConversationData) => void;
  handleUserTyping: (data: { userId: string; isTyping: boolean }) => void;
}

const useMessageStore = create<MessageState>((set, get) => ({
  // Initial state
  conversations: [],
  selectedConversation: null,
  conversationsLoading: false,
  // Timestamp of last successful conversations fetch (ms since epoch)
  lastFetchAt: 0 as any, // added for debouncing duplicate fetches
  messages: [],
  messagesLoading: false,
  messagesPagination: null,
  isTyping: {},
  error: null,

  // Fetch user's conversations
  fetchConversations: async () => {
    const state = get();
    // Guard 1: If a fetch is already in progress, skip
    if (state.conversationsLoading) return;
    // Guard 2: If we fetched very recently (<1.5s) and have data, skip
    const now = Date.now();
    if (
      state.lastFetchAt &&
      now - state.lastFetchAt < 1500 &&
      state.conversations.length > 0
    ) {
      return;
    }

    set({ conversationsLoading: true, error: null });
    try {
      const conversations = await messageService.getUserConversations();
      set({
        conversations,
        conversationsLoading: false,
        lastFetchAt: Date.now(),
      });
    } catch (error: any) {
      set({
        error: error.message,
        conversationsLoading: false,
      });
      toast.error(error.message);
    }
  },

  // Fetch messages for a conversation
  fetchMessages: async (conversationId: string, page = 1) => {
    set({ messagesLoading: true, error: null });
    try {
      const response = await messageService.getMessages(conversationId, page);

      if (page === 1) {
        // First page - replace messages
        set({
          messages: response.messages,
          messagesPagination: response.pagination,
          messagesLoading: false,
        });
      } else {
        // Load more - append to existing messages
        const currentMessages = get().messages;
        set({
          messages: [...response.messages, ...currentMessages],
          messagesPagination: response.pagination,
          messagesLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message,
        messagesLoading: false,
      });
      toast.error(error.message);
    }
  },

  // Send a message
  sendMessage: async (conversationId: string, data: SendMessageRequest) => {
    try {
      //const message = await messageService.sendMessage(conversationId, data);
      await messageService.sendMessage(conversationId, data);
      // Add message to local state immediately for better UX
      // const currentMessages = get().messages;
      // set({
      //   messages: [...currentMessages, message]
      // });

      // // Update conversation's last message
      // const conversations = get().conversations;
      // const updatedConversations = conversations.map(conv =>
      //   conv._id === conversationId
      //     ? {
      //         ...conv,
      //         lastMessage: {
      //           content: message.content,
      //           senderId: message.senderId,
      //           timestamp: message.createdAt
      //         }
      //       }
      //     : conv
      // );
      // set({ conversations: updatedConversations });
    } catch (error: any) {
      set({ error: error.message });
      toast.error(error.message);
    }
  },

  // Create a new conversation
  createConversation: async (contactRequestId: string) => {
    try {
      const conversation = await messageService.createConversation({
        contactRequestId,
      });

      // Add to conversations list
      const currentConversations = get().conversations;
      set({
        conversations: [conversation, ...currentConversations],
      });

      toast.success("Cuộc trò chuyện đã được tạo");
      return conversation;
    } catch (error: any) {
      set({ error: error.message });
      toast.error(error.message);
      return null;
    }
  },

  // Create conversation from class
  createConversationFromClass: async (classId: string) => {
    try {
      const conversation = await messageService.createConversationFromClass(
        classId
      );

      // Add to conversations list
      const currentConversations = get().conversations;
      const exists = currentConversations.some(
        (c) => c._id === conversation._id
      );

      if (!exists) {
        set({
          conversations: [conversation, ...currentConversations],
        });
      }

      return conversation;
    } catch (error: any) {
      set({ error: error.message });
      toast.error(error.message);
      return null;
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (conversationId: string) => {
    try {
      await messageService.markMessagesAsRead(conversationId);

      // Update local state
      const conversations = get().conversations;
      const updatedConversations = conversations.map((conv) =>
        conv._id === conversationId
          ? {
              ...conv,
              unreadCount: {
                ...conv.unreadCount,
                student: 0,
                tutor: 0,
              },
            }
          : conv
      );
      set({ conversations: updatedConversations });
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
    }
  },

  // Close conversation
  closeConversation: async (conversationId: string) => {
    try {
      await messageService.closeConversation(conversationId);

      // Update local state
      const conversations = get().conversations;
      const updatedConversations = conversations.map((conv) =>
        conv._id === conversationId
          ? { ...conv, status: "closed" as const }
          : conv
      );
      set({ conversations: updatedConversations });

      toast.success("Cuộc trò chuyện đã được đóng");
    } catch (error: any) {
      set({ error: error.message });
      toast.error(error.message);
    }
  },

  // Get or create conversation by class ID
  getOrCreateConversationByClass: async (classId: string) => {
    try {
      const conversation = await messageService.getOrCreateConversationByClass(
        classId
      );
      return conversation;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },

  // Get conversation by contact request
  getConversationByContactRequest: async (contactRequestId: string) => {
    try {
      const conversation = await messageService.getConversationByContactRequest(
        contactRequestId
      );
      return conversation;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },

  // Socket actions
  joinConversation: (conversationId: string) => {
    socketService.joinConversation(conversationId);
  },

  leaveConversation: (conversationId: string) => {
    socketService.leaveConversation(conversationId);
  },

  startTyping: (conversationId: string, userId: string) => {
    socketService.startTyping(conversationId, userId);
  },

  stopTyping: (conversationId: string, userId: string) => {
    socketService.stopTyping(conversationId, userId);
  },

  // UI actions
  setSelectedConversation: (conversation: ConversationData | null) => {
    set({ selectedConversation: conversation });
  },

  setTyping: (userId: string, isTyping: boolean) => {
    const currentTyping = get().isTyping;
    set({
      isTyping: {
        ...currentTyping,
        [userId]: isTyping,
      },
    });
  },

  clearError: () => {
    set({ error: null });
  },

  // Socket event handlers
  handleNewMessage: (rawMessage: any) => {
    const message = normalizeMessage(rawMessage as any);
    const currentMessages = get().messages;
    const selectedConversation = get().selectedConversation;

    // Avoid adding duplicate messages (optimistic add + socket echo)
    const alreadyExists = currentMessages.some(
      (m) => String(m._id) === String(message._id)
    );

    // Add message if it belongs to the current conversation and not already in list
    if (
      selectedConversation &&
      message.conversationId === selectedConversation._id &&
      !alreadyExists
    ) {
      set({ messages: [...currentMessages, message] });
    }

    // Update conversation's last message and unread count
    const conversations = get().conversations;
    const updatedConversations = conversations.map((conv) => {
      if (conv._id === message.conversationId) {
        return {
          ...conv,
          lastMessage: {
            content: message.content,
            senderId: message.senderId,
            timestamp: message.createdAt,
          },
          unreadCount: {
            ...conv.unreadCount,
            // Increment unread count for the receiver
            student:
              message.receiverId === conv.studentId._id
                ? conv.unreadCount.student + 1
                : conv.unreadCount.student,
            tutor:
              message.receiverId === conv.tutorId._id
                ? conv.unreadCount.tutor + 1
                : conv.unreadCount.tutor,
          },
        };
      }
      return conv;
    });

    set({ conversations: updatedConversations });
  },

  handleConversationUpdate: (conversation: ConversationData) => {
    const conv = normalizeConversation(conversation as any);
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === conv._id
          ? {
              ...c,
              lastMessage: conv.lastMessage,
              unreadCount: {
                student: conv.unreadCount?.student ?? c.unreadCount.student,
                tutor: conv.unreadCount?.tutor ?? c.unreadCount.tutor,
              },
            }
          : c
      ),
    }));
  },

  handleUserTyping: (data: { userId: string; isTyping: boolean }) => {
    get().setTyping(data.userId, data.isTyping);
  },
}));

export default useMessageStore;
