import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import useMessageStore from '../../store/message.store';
import type { ConversationData } from '../../services/message.service';
import { socketService } from '../../services/socket.service';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import { useSearchParams } from 'react-router-dom';
import DashboardStats from '../../components/dashboard/DashboardStats';
import { ChatBubbleLeftRightIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const StudentMessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const currentUserId = (user?._id || user?.id || '') as string;

  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);

  const [searchParams] = useSearchParams();
  const contactRequestId = searchParams.get('contactRequestId');
  const classId = searchParams.get('classId');

  const { fetchConversations, setSelectedConversation: setStoreSelectedConversation, createConversation, getConversationByContactRequest, getOrCreateConversationByClass } = useMessageStore();

  // Connect socket and preload conversations
  useEffect(() => {
    if (!currentUserId) return;
    socketService.connect(localStorage.getItem('access_token') || undefined);
    socketService.joinChat(currentUserId);

    fetchConversations();

    return () => {
      socketService.disconnect();
    };
  }, [currentUserId]);

  // Auto-create/select conversation when coming from class or contact request
  useEffect(() => {
    const init = async () => {
      if (!classId && !contactRequestId) return;
      
      try {
        let conversation = null;
        
        // Priority: classId > contactRequestId
        if (classId) {
          conversation = await getOrCreateConversationByClass(classId);
        } else if (contactRequestId) {
          conversation = await getConversationByContactRequest(contactRequestId);
          
          // If not found, create new one
          if (!conversation) {
            conversation = await createConversation(contactRequestId);
          }
        }
        
        await fetchConversations();
        if (conversation) {
          setSelectedConversation(conversation);
          setStoreSelectedConversation(conversation);
          setShowConversationList(false);
        }
      } catch (err) {
        // silently ignore; store handles errors
      }
    };
    init();
  }, [classId, contactRequestId]);

  const handleSelectConversation = (conversation: ConversationData) => {
    setSelectedConversation(conversation);
    setStoreSelectedConversation(conversation);
    setShowConversationList(false);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setStoreSelectedConversation(null);
    setShowConversationList(true);
  };

  const { conversations } = useMessageStore();
  const totalConversations = conversations.length;
  const unreadCount = conversations.filter(c => c.unreadCount && c.unreadCount > 0).length;
  const totalMessages = conversations.reduce((sum, c) => sum + (c.messageCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <DashboardStats
        title="Tin nhắn"
        description="Tổng quan về các cuộc trò chuyện và tin nhắn của bạn"
        stats={[
          {
            label: 'Tổng cuộc trò chuyện',
            value: totalConversations,
            icon: ChatBubbleLeftRightIcon,
            color: 'blue',
            description: 'Số cuộc trò chuyện',
          },
          {
            label: 'Tin nhắn chưa đọc',
            value: unreadCount,
            icon: EnvelopeIcon,
            color: 'yellow',
            description: 'Cần xem',
          },
          {
            label: 'Tổng tin nhắn',
            value: totalMessages.toLocaleString('vi-VN'),
            icon: MessageCircle,
            color: 'purple',
            description: 'Tất cả tin nhắn',
          },
          {
            label: 'Đã đọc',
            value: totalConversations - unreadCount,
            icon: CheckCircleIcon,
            color: 'green',
            description: 'Đã xem',
          },
        ]}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-blue-600" size={24} />
            <h1 className="text-lg font-semibold text-gray-900">Tin nhắn</h1>
          </div>
        </div>

      {/* Content */}
      <div className="h-[70vh] sm:h-[75vh]">
        {showConversationList || !selectedConversation ? (
          <div className="h-full overflow-y-auto p-2 sm:p-4">
            <ConversationList
              currentUserId={currentUserId}
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?._id}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Back button for mobile */}
            <div className="sm:hidden p-2 border-b border-gray-200">
              <button
                onClick={handleBackToList}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Quay lại danh sách
              </button>
            </div>

            <div className="flex-1">
              {selectedConversation && (
                <ChatWindow
                  conversation={selectedConversation}
                  currentUserId={currentUserId}
                  onClose={handleBackToList}
                />
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default StudentMessagesPage;
