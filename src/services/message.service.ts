import axios from 'axios';

// Support either VITE_API_URL or VITE_API_BASE_URL; fallback to localhost
const API_BASE_URL = (import.meta.env.VITE_API_URL 
  || (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/v1` : undefined)
  || 'http://localhost:3000/api/v1');

export interface MessageData {
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

export interface ConversationData {
  _id: string;
  contactRequestId: string;
  studentId: {
    _id: string;
    full_name: string;
    avatar_url?: string;
  };
  tutorId: {
    _id: string;
    full_name: string;
    avatar_url?: string;
  };
  tutorPostId: {
    _id: string;
    title: string;
  };
  subject: {
    _id: string;
    name: string;
  };
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

export interface SendMessageRequest {
  content: string;
  messageType?: 'text' | 'image' | 'file';
  fileMetadata?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  };
  replyTo?: string;
}

export interface CreateConversationRequest {
  contactRequestId: string;
}

export interface GetMessagesResponse {
  messages: MessageData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// === Normalization helpers to align BE -> FE types ===
const mapMessageStatus = (status: string): MessageData['status'] => {
  switch (status) {
    case 'SENT':
      return 'sent';
    case 'DELIVERED':
      return 'delivered';
    case 'READ':
      return 'read';
    default:
      return 'sent';
  }
};

const mapMessageType = (type: string): NonNullable<MessageData['messageType']> => {
  switch (type) {
    case 'TEXT':
      return 'text';
    case 'IMAGE':
      return 'image';
    case 'FILE':
      return 'file';
    default:
      return 'text';
  }
};

// Tạo 1 hàm helper để lấy ID nhất quán
const getNormalizedId = (field: any): string => {
  if (typeof field === 'string') {
    return field;
  }
  // Luôn kiểm tra cả _id và id
  return field?._id ?? field?.id ?? '';
};

export const normalizeMessage = (m: any): MessageData => {
  return {
    _id: m._id,
    conversationId: m.conversationId,
    senderId: getNormalizedId(m.senderId),
    receiverId: getNormalizedId(m.receiverId),
    content: m.content,
    messageType: mapMessageType(m.messageType),
    fileMetadata: m.fileMetadata
      ? {
          fileName: m.fileMetadata.fileName || m.fileMetadata.originalName || '',
          fileSize: m.fileMetadata.fileSize || 0,
          fileType: m.fileMetadata.mimeType || '',
          fileUrl: m.fileMetadata.fileUrl || ''
        }
      : undefined,
    status: mapMessageStatus(m.status),
    replyTo: m.replyTo ? { messageId: m.replyTo.messageId, content: m.replyTo.content } : undefined,
    createdAt: new Date(m.sentAt || m.createdAt || Date.now()),
    updatedAt: new Date(m.updatedAt || m.sentAt || Date.now())
  };
};

const mapConversationStatus = (status: string): ConversationData['status'] => {
  switch (status) {
    case 'ACTIVE':
      return 'active';
    case 'CLOSED':
      return 'closed';
    default:
      return 'active';
  }
};

export const normalizeConversation = (c: any): ConversationData => {
  // Ensure user objects always have full_name and avatar_url
  const normalizeUser = (u: any) => {
    if (typeof u === 'string') {
      return { _id: u, full_name: '', avatar_url: undefined };
    }
    return {
      _id: getNormalizedId(u),
      full_name: (u?.full_name ?? u?.fullName ?? u?.name ?? '') as string,
      avatar_url: (u?.avatar_url ?? u?.avatarUrl ?? u?.avatar ?? undefined) as string | undefined
    };
  };

  // Ensure subject object always has name
  const normalizeSubject = (s: any) => {
    if (typeof s === 'string') {
      return { _id: s, name: '' };
    }
    return {
      _id: s?._id ?? s?.id ?? '',
      name: (s?.name ?? s?.subjectName ?? s?.title ?? '') as string
    };
  };

  // Ensure tutor post has title
  const normalizeTutorPost = (tp: any) => {
    if (typeof tp === 'string') {
      return { _id: tp, title: '' };
    }
    return {
      _id: tp?._id ?? tp?.id ?? '',
      title: (tp?.title ?? tp?.name ?? '') as string
    };
  };

  const student = normalizeUser(c.studentId);
  const tutor = normalizeUser(c.tutorId);
  const subject = normalizeSubject(c.subject);
  const tutorPost = normalizeTutorPost(c.tutorPostId);

  return {
    _id: c._id,
    contactRequestId: c.contactRequestId ?? c.contactRequest?._id ?? '',
    studentId: student,
    tutorId: tutor,
    tutorPostId: tutorPost,
    subject: subject,
    status: mapConversationStatus(c.status),
    lastMessage: c.lastMessage
      ? {
          content: c.lastMessage.content,
          senderId: getNormalizedId(c.lastMessage.senderId),
          timestamp: new Date(
            c.lastMessage.sentAt || c.lastMessage.timestamp || c.lastMessage.createdAt || Date.now()
          )
        }
      : undefined,
    unreadCount: c.unreadCount || { student: 0, tutor: 0 },
    createdAt: new Date(c.createdAt || Date.now()),
    updatedAt: new Date(c.updatedAt || Date.now())
  };
};

const normalizeMessagesResponse = (data: any): GetMessagesResponse => {
  return {
    messages: Array.isArray(data?.messages) ? data.messages.map(normalizeMessage) : [],
    pagination: {
      currentPage: data?.pagination?.page ?? data?.pagination?.currentPage ?? 1,
      totalPages: data?.pagination?.totalPages ?? 1,
      totalMessages: data?.pagination?.totalMessages ?? 0,
      hasNext: data?.pagination?.hasNext ?? false,
      hasPrev: data?.pagination?.hasPrev ?? false
    }
  };
};

class MessageService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Upload file/image attachment to backend (Cloudinary)
   */
  async uploadAttachment(
    conversationId: string,
    file: File,
    subdir: 'images' | 'files' = 'images',
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; fileName: string; fileType: string; fileSize: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('access_token');
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.data) {
              resolve(response.data);
            } else {
              reject(new Error(response.message || 'Upload failed'));
            }
          } catch (err) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', `${API_BASE_URL}/messages/conversations/${conversationId}/attachments?subdir=${subdir}`);
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }

  // Create conversation
  async createConversation(data: CreateConversationRequest): Promise<ConversationData> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages/conversations`,
        data,
        { headers: this.getAuthHeaders() }
      );
      return normalizeConversation(response.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo cuộc trò chuyện');
    }
  }

  // Send message
  async sendMessage(conversationId: string, data: SendMessageRequest): Promise<MessageData> {
    try {
      // Convert messageType to uppercase for backend
      const backendData = {
        ...data,
        messageType: data.messageType?.toUpperCase() as 'TEXT' | 'IMAGE' | 'FILE' | undefined
      };
      
      const response = await axios.post(
        `${API_BASE_URL}/messages/conversations/${conversationId}/messages`,
        backendData,
        { headers: this.getAuthHeaders() }
      );
      return normalizeMessage(response.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi gửi tin nhắn');
    }
  }

  // Get messages in conversation
  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<GetMessagesResponse> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );
      return normalizeMessagesResponse(response.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy tin nhắn');
    }
  }

  // Get user's conversations
  async getUserConversations(): Promise<ConversationData[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/messages/conversations`,
        { headers: this.getAuthHeaders() }
      );
      const raw = response.data.data || [];
      return raw.map(normalizeConversation);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách cuộc trò chuyện');
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string): Promise<void> {
    try {
      await axios.patch(
        `${API_BASE_URL}/messages/conversations/${conversationId}/read`,
        {},
        { headers: this.getAuthHeaders() }
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi đánh dấu tin nhắn đã đọc');
    }
  }

  // Close conversation
  async closeConversation(conversationId: string): Promise<void> {
    try {
      await axios.patch(
        `${API_BASE_URL}/messages/conversations/${conversationId}/close`,
        {},
        { headers: this.getAuthHeaders() }
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi đóng cuộc trò chuyện');
    }
  }

  // Get or create conversation by class ID
  async getOrCreateConversationByClass(classId: string): Promise<ConversationData> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/messages/conversations/class/${classId}`,
        { headers: this.getAuthHeaders() }
      );
      return normalizeConversation(response.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy cuộc trò chuyện');
    }
  }

  // Get conversation by contact request ID
  async getConversationByContactRequest(contactRequestId: string): Promise<ConversationData> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/messages/conversations/contact-request/${contactRequestId}`,
        { headers: this.getAuthHeaders() }
      );
      return normalizeConversation(response.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy cuộc trò chuyện');
    }
  }
}

export const messageService = new MessageService();
export default messageService;