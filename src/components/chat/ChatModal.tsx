import React, { useState, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";
import useMessageStore from "../../store/message.store";
import type { ConversationData } from "../../services/message.service";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { socketService } from "../../services/socket.service";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  initialContactRequestId?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  initialContactRequestId,
}) => {
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationData | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);

  const {
    createConversation,
    fetchConversations,
    setSelectedConversation: setStoreSelectedConversation,
  } = useMessageStore();

  // Ensure socket connected when modal opens
  useEffect(() => {
    if (isOpen) {
      socketService.connect(localStorage.getItem("access_token") || undefined);
      socketService.joinChat(currentUserId);
    } else {
      socketService.disconnect();
    }
  }, [isOpen, currentUserId]);

  // Handle initial contact request
  useEffect(() => {
    if (isOpen && initialContactRequestId) {
      handleInitialContactRequest();
    }
  }, [isOpen, initialContactRequestId]);

  const handleInitialContactRequest = async () => {
    if (!initialContactRequestId) return;

    try {
      // Always use idempotent create; returns existing conversation if already created
      const conversation = await createConversation(initialContactRequestId);

      // Refresh list and select the conversation
      if (conversation) {
        await fetchConversations();
        setSelectedConversation(conversation);
        setStoreSelectedConversation(conversation);
        setShowConversationList(false);
      }
    } catch (error) {
      console.error("Error handling initial contact request:", error);
    }
  };

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

  const handleCloseModal = () => {
    setSelectedConversation(null);
    setStoreSelectedConversation(null);
    setShowConversationList(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleCloseModal}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <MessageCircle className="text-blue-500" size={24} />
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedConversation ? "Trò chuyện" : "Tin nhắn"}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 cursor-pointer hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="h-96 sm:h-[500px]">
              {showConversationList || !selectedConversation ? (
                <div className="h-full overflow-y-auto p-4">
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
                      className="text-blue-600 cursor-pointer hover:text-blue-800 text-sm font-medium"
                    >
                      ← Quay lại danh sách
                    </button>
                  </div>

                  <div className="flex-1">
                    <ChatWindow
                      conversation={selectedConversation}
                      currentUserId={currentUserId}
                      onClose={handleBackToList}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
