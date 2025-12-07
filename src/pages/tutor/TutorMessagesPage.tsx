import React, { useEffect, useState, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import useMessageStore from "../../store/message.store";
import type { ConversationData } from "../../services/message.service";
import { socketService } from "../../services/socket.service";
import ConversationList from "../../components/chat/ConversationList";
import ChatWindow from "../../components/chat/ChatWindow";
import { useSearchParams } from "react-router-dom";

const TutorMessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const currentUserId = (user?._id || user?.id || "") as string;

  const [selectedConversation, setSelectedConversation] =
    useState<ConversationData | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);

  const [searchParams] = useSearchParams();
  const contactRequestId = searchParams.get("contactRequestId");
  const classId = searchParams.get("classId");
  const userId = searchParams.get("userId");
  
  const classIdProcessedRef = useRef<string | null>(null);

  const {
    conversations,
    fetchConversations,
    setSelectedConversation: setStoreSelectedConversation,
    createConversation,
    getConversationByContactRequest,
    getOrCreateConversationByClass,
  } = useMessageStore();

  // Connect socket and join global chat room for this user
  useEffect(() => {
    if (!currentUserId) return;

    socketService.connect(localStorage.getItem("access_token") || undefined);
    socketService.joinChat(currentUserId);

    // Only fetch conversations once on mount
    fetchConversations();

    return () => {
      socketService.disconnect();
    };
  }, [currentUserId]); // Remove fetchConversations from dependencies

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
          conversation = await getConversationByContactRequest(
            contactRequestId
          );

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
        // ignore errors handled in store
      }
    };
    init();
  }, [classId, contactRequestId]);

  // Handle userId parameter - find existing conversation with that user
  useEffect(() => {
    if (!userId || !conversations.length) return;

    // Find conversation with the specified user by comparing studentId/tutorId
    const conversation = conversations.find((conv) => {
      const studentId =
        (conv as any).studentId?._id || (conv as any).studentId?.id;
      const tutorId = (conv as any).tutorId?._id || (conv as any).tutorId?.id;
      if (!studentId || !tutorId) return false;

      // Determine the other participant relative to current user
      const otherId = studentId === currentUserId ? tutorId : studentId;
      return otherId === userId;
    });

    if (conversation) {
      setSelectedConversation(conversation);
      setStoreSelectedConversation(conversation);
      setShowConversationList(false);
    }
  }, [userId, conversations, currentUserId]);

  // Handle classId parameter - create or find conversation from class
  useEffect(() => {
    const init = async () => {
      if (!classId || classIdProcessedRef.current === classId) return;
      classIdProcessedRef.current = classId;

      try {
        const conversation = await getOrCreateConversationByClass(classId);
        if (conversation) {
          setSelectedConversation(conversation);
          setStoreSelectedConversation(conversation);
          setShowConversationList(false);
        }
      } catch (err) {
        // Error handled in store
      }
    };

    init();
  }, [classId]);

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
    <div className="space-y-6">
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

export default TutorMessagesPage;
