import React, { useState, useEffect, useRef } from "react";
import { Send, X, Paperclip, MoreVertical, AlertCircle } from "lucide-react";
import useMessageStore from "../../store/message.store";
import type { ConversationData } from "../../services/message.service";
import { messageService } from "../../services/message.service";
import { socketService } from "../../services/socket.service";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import toast from "react-hot-toast";
import { filterSensitiveContent, getFilterErrorMessage } from "../../utils/contentFilter";

// Inline styles cho scrollbar
const scrollbarStyles = `
  .custom-chat-scroll {
    scrollbar-width: auto;
    scrollbar-color: #94a3b8 #f1f5f9;
  }
  
  .custom-chat-scroll::-webkit-scrollbar {
    width: 12px;
  }
  
  .custom-chat-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
  }
  
  .custom-chat-scroll::-webkit-scrollbar-thumb {
    background: #94a3b8;
    border-radius: 10px;
    border: 2px solid #f1f5f9;
  }
  
  .custom-chat-scroll::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
  
  .custom-chat-scroll::-webkit-scrollbar-thumb:active {
    background: #475569;
  }
`;

interface ChatWindowProps {
  conversation: ConversationData;
  currentUserId: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUserId,
  onClose,
}) => {
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [contentWarning, setContentWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    messages,
    messagesLoading,
    messagesPagination,
    isTyping: typingUsers,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    handleNewMessage,
    handleUserTyping,
  } = useMessageStore();

  // Get other user info
  const isStudentUser =
    String(conversation.studentId._id) === String(currentUserId);
  const otherUser = isStudentUser
    ? conversation.tutorId
    : conversation.studentId;

  const otherName = otherUser.full_name || "Người dùng";
  const subjectName = conversation.subject?.name || "Không xác định";
  const avatarInitial = (otherName || "?").charAt(0).toUpperCase();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join conversation and fetch messages on mount
  useEffect(() => {
    joinConversation(conversation._id);
    fetchMessages(conversation._id);
    markMessagesAsRead(conversation._id);

    // Setup socket listeners
    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(handleUserTyping);
    // Also listen to conversation room event from BE
    socketService.onMessageReceived(handleNewMessage);

    return () => {
      leaveConversation(conversation._id);
      socketService.offNewMessage(handleNewMessage);
      socketService.offUserTyping(handleUserTyping);
      socketService.offMessageReceived(handleNewMessage);
    };
  }, [conversation._id]);

  // Mark incoming messages as read when viewing this conversation
  useEffect(() => {
    if (!messages.length) return;
    const latest = messages[messages.length - 1];
    if (
      latest.conversationId === conversation._id &&
      String(latest.receiverId) === String(currentUserId)
    ) {
      markMessagesAsRead(conversation._id);
    }
  }, [messages, conversation._id, currentUserId]);

  // Handle typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);

    // Kiểm tra nội dung nhạy cảm khi người dùng nhập
    if (value.trim()) {
      const filterResult = filterSensitiveContent(value, true);
      if (!filterResult.isValid) {
        setContentWarning(getFilterErrorMessage(filterResult.violations));
      } else {
        setContentWarning(null);
      }
    } else {
      setContentWarning(null);
    }

    if (!isTyping && value.trim()) {
      setIsTyping(true);
      startTyping(conversation._id, currentUserId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(conversation._id, currentUserId);
    }, 1000);
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    const messageContent = messageText.trim();

    // Kiểm tra nội dung nhạy cảm trước khi gửi
    const filterResult = filterSensitiveContent(messageContent, true);
    if (!filterResult.isValid) {
      toast.error(getFilterErrorMessage(filterResult.violations), {
        duration: 5000,
        icon: '⚠️',
      });
      return;
    }

    setMessageText("");
    setContentWarning(null);

    // Stop typing
    if (isTyping) {
      setIsTyping(false);
      stopTyping(conversation._id, currentUserId);
    }

    await sendMessage(conversation._id, {
      content: messageContent,
      messageType: "text",
    });
  };

  // Upload and send attachment (image or file)
  const uploadAndSendAttachment = async (file: File) => {
    if (conversation.status === "closed") return;

    const isImage = file.type?.startsWith("image/");
    const subdir = isImage ? "images" : "files";

    console.debug("Upload start", {
      name: file.name,
      size: file.size,
      type: file.type,
      subdir,
    });
    const tid = toast.loading("Đang tải tệp lên... 0%");

    try {
      // Upload to backend (Cloudinary)
      const result = await messageService.uploadAttachment(
        conversation._id,
        file,
        subdir,
        (progress: number) => {
          console.log("Upload progress", progress);
          toast.loading(`Đang tải tệp lên... ${progress}%`, { id: tid });
        }
      );

      // Send message with file metadata
      await sendMessage(conversation._id, {
        content: isImage ? "Ảnh" : file.name,
        messageType: isImage ? "image" : "file",
        fileMetadata: {
          fileName: result.fileName,
          fileSize: result.fileSize,
          fileType: result.fileType,
          fileUrl: result.url,
        },
      });

      toast.success("Gửi tệp thành công", { id: tid });
      scrollToBottom();
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err?.message || "Lỗi tải tệp lên", { id: tid });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = "";
    uploadAndSendAttachment(f);
  };

  // Load more messages
  const handleLoadMore = () => {
    if (messagesPagination?.hasNext) {
      fetchMessages(conversation._id, messagesPagination.currentPage + 1);
    }
  };

  // Check if other user is typing
  const isOtherUserTyping = Object.keys(typingUsers).some(
    (userId) => userId !== currentUserId && typingUsers[userId]
  );

  return (
    <>
      {/* Inject scrollbar styles */}
      <style>{scrollbarStyles}</style>

      <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold ring-2 ring-white">
              {avatarInitial}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{otherName}</h3>
              <div className="mt-0.5">
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Môn: {subjectName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 text-gray-600 cursor-pointer hover:text-gray-900 rounded-full hover:bg-gray-100 transition">
              <MoreVertical size={20} />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 cursor-pointer hover:text-gray-900 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 p-4 space-y-4 bg-gradient-to-b from-white/80 to-blue-50/40 custom-chat-scroll"
          style={{
            scrollBehavior: "smooth",
            minHeight: 0,
            overflowY: "scroll",
            overflowX: "hidden",
            maxHeight: "calc(100vh - 280px)", // Force max height to trigger scrollbar
          }}
        >
          {/* Load more button */}
          {messagesPagination?.hasNext && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={messagesLoading}
                className="inline-block px-4 py-1.5 cursor-pointer text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 disabled:opacity-50"
              >
                {messagesLoading ? "Đang tải..." : "Tải tin nhắn cũ hơn"}
              </button>
            </div>
          )}

          {/* Messages list */}
          {messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={String(message.senderId) === String(currentUserId)}
            />
          ))}

          {/* Typing indicator */}
          {isOtherUserTyping && (
            <TypingIndicator userName={otherUser.full_name} />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="sticky bottom-0 z-10 px-4 py-3 border-t border-gray-200 bg-white/80 backdrop-blur-md">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              className="p-2.5 text-gray-500 cursor-pointer hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={20} />
            </button>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,*/*"
            />

            <div className="flex-1 relative">
              <input
                type="text"
                value={messageText}
                onChange={handleInputChange}
                placeholder="Nhập tin nhắn..."
                className={`w-full px-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:border-transparent shadow-sm placeholder-gray-400 bg-white ${contentWarning
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
                  }`}
                disabled={conversation.status === "closed"}
              />
              {contentWarning && (
                <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-red-50 border border-red-200 rounded-lg shadow-md z-20">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-700">{contentWarning}</p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!messageText.trim() || conversation.status === "closed"}
              className="px-3 sm:px-4 cursor-pointer py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm flex items-center gap-2"
            >
              <Send size={20} />
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </form>

          {conversation.status !== "closed" && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Nhấn Enter để gửi
            </p>
          )}

          {conversation.status === "closed" && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Cuộc trò chuyện này đã được đóng
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatWindow;
