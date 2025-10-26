import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import useMessageStore from '../../store/message.store';
import type { ConversationData } from '../../services/message.service';
import { socketService } from '../../services/socket.service';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';

const TutorMessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const currentUserId = (user?._id || '') as string;

  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);

  const {
    fetchConversations,
    setSelectedConversation: setStoreSelectedConversation,
  } = useMessageStore();

  // Connect socket and join global chat room for this user
  useEffect(() => {
    if (!currentUserId) return;
    socketService.connect(localStorage.getItem('access_token') || undefined);
    socketService.joinChat(currentUserId);

    fetchConversations();

    return () => {
      socketService.disconnect();
    };
  }, [currentUserId]);

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

  return (
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
  );
};

export default TutorMessagesPage;