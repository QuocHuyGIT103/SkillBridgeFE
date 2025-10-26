import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Paperclip, MoreVertical } from 'lucide-react';
import useMessageStore from '../../store/message.store';
import type { ConversationData, MessageData } from '../../services/message.service';
import { socketService } from '../../services/socket.service';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import './chat-window.css';

interface ChatWindowProps {
  conversation: ConversationData;
  currentUserId: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  conversation, 
  currentUserId, 
  onClose 
}) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number>(0);
  const scrollStartRef = useRef<number>(0);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!messagesContainerRef.current) return;
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    scrollStartRef.current = messagesContainerRef.current.scrollTop;
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !messagesContainerRef.current) return;
    const delta = e.clientY - dragStartYRef.current;
    messagesContainerRef.current.scrollTop = scrollStartRef.current - delta;
  };
  
  const endDrag = () => setIsDragging(false);
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
    handleUserTyping
  } = useMessageStore();

  // Get other user info
  const isStudentUser = String(conversation.studentId._id) === String(currentUserId);
  const otherUser = isStudentUser 
    ? conversation.tutorId 
    : conversation.studentId;

  const otherName = otherUser.full_name || 'Người dùng';
  const subjectName = conversation.subject?.name || 'Không xác định';
  const avatarInitial = (otherName || '?').charAt(0).toUpperCase();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    if (latest.conversationId === conversation._id && String(latest.receiverId) === String(currentUserId)) {
      markMessagesAsRead(conversation._id);
    }
  }, [messages, conversation._id, currentUserId]);

  // Handle typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);

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
    setMessageText('');
    
    // Stop typing
    if (isTyping) {
      setIsTyping(false);
      stopTyping(conversation._id, currentUserId);
    }

    await sendMessage(conversation._id, {
      content: messageContent,
      messageType: 'text'
    });
  };

  // Load more messages
  const handleLoadMore = () => {
    if (messagesPagination?.hasNext) {
      fetchMessages(conversation._id, messagesPagination.currentPage + 1);
    }
  };

  // Check if other user is typing
  const isOtherUserTyping = Object.keys(typingUsers).some(
    userId => userId !== currentUserId && typingUsers[userId]
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {avatarInitial}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{otherName}</h3>
            <p className="text-sm text-gray-500">
              Môn: {subjectName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <MoreVertical size={20} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-4 chat-scroll ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        {/* Load more button */}
        {messagesPagination?.hasNext && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={messagesLoading}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {messagesLoading ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
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
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <Paperclip size={20} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageText}
              onChange={handleInputChange}
              placeholder="Nhập tin nhắn..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={conversation.status === 'closed'}
            />
          </div>
          
          <button
            type="submit"
            disabled={!messageText.trim() || conversation.status === 'closed'}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
        
        {conversation.status === 'closed' && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Cuộc trò chuyện này đã được đóng
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;