import React, { useEffect } from 'react';
import { MessageCircle, Clock } from 'lucide-react';
import useMessageStore from '../../store/message.store';
import type { ConversationData } from '../../services/message.service';
import { socketService } from '../../services/socket.service';

interface ConversationListProps {
  currentUserId: string;
  onSelectConversation: (conversation: ConversationData) => void;
  selectedConversationId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  currentUserId,
  onSelectConversation,
  selectedConversationId
}) => {
  const {
    conversations,
    conversationsLoading,
    fetchConversations,
    handleConversationUpdate
  } = useMessageStore();

  useEffect(() => {
    fetchConversations();
    // Listen for real-time conversation updates
    socketService.onConversationUpdate(handleConversationUpdate);
    return () => {
      socketService.offConversationUpdate(handleConversationUpdate);
    };
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const getUnreadCount = (conversation: ConversationData) => {
    return currentUserId === conversation.studentId._id 
      ? conversation.unreadCount.student 
      : conversation.unreadCount.tutor;
  };

  const getOtherUser = (conversation: ConversationData) => {
    return conversation.studentId._id === currentUserId 
      ? conversation.tutorId 
      : conversation.studentId;
  };

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <MessageCircle size={48} className="mb-4" />
        <p className="text-lg font-medium">Chưa có cuộc trò chuyện nào</p>
        <p className="text-sm">Cuộc trò chuyện sẽ được tạo khi yêu cầu liên hệ được chấp nhận</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherUser = getOtherUser(conversation);
        const unreadCount = getUnreadCount(conversation);
        const isSelected = conversation._id === selectedConversationId;
        const otherName = otherUser.full_name || 'Người dùng';
        const subjectName = conversation.subject?.name || 'Không xác định';
        const avatarInitial = (otherName || '?').charAt(0).toUpperCase();

        return (
          <div
            key={conversation._id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              isSelected 
                ? 'bg-blue-50 border-2 border-blue-200' 
                : 'bg-white hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {avatarInitial}
                </div>
                {conversation.status === 'active' && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Conversation info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium truncate ${
                    unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {otherName}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.lastMessage.timestamp.toISOString())}
                      </span>
                    )}
                    {unreadCount > 0 && (
                      <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-1">
                  Môn: {subjectName}
                </p>

                {conversation.lastMessage ? (
                  <p className={`text-sm truncate ${
                    unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                  }`}>
                    {conversation.lastMessage.senderId === currentUserId && 'Bạn: '}
                    {conversation.lastMessage.content}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Chưa có tin nhắn nào
                  </p>
                )}
              </div>
            </div>

            {/* Status indicator */}
            <div className="mt-2 flex items-center justify-between">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                conversation.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <Clock size={12} className="mr-1" />
                {conversation.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;