import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  EllipsisVerticalIcon,
  VideoCameraIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

const StudentMessagesPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const conversations = [
    {
      id: 1,
      tutorName: "Thầy Nguyễn Văn A",
      avatar: "https://via.placeholder.com/50",
      lastMessage: "Bài tập hôm nay em làm rất tốt!",
      timestamp: "2 phút trước",
      unread: 2,
      online: true,
      subject: "Toán học",
    },
    {
      id: 2,
      tutorName: "Cô Sarah Johnson",
      avatar: "https://via.placeholder.com/50",
      lastMessage: "Hẹn gặp lại em vào buổi học tới",
      timestamp: "1 giờ trước",
      unread: 0,
      online: false,
      subject: "Tiếng Anh",
    },
    {
      id: 3,
      tutorName: "Cô Trần Thị B",
      avatar: "https://via.placeholder.com/50",
      lastMessage: "Em có thể giải thích lại bài này không?",
      timestamp: "3 giờ trước",
      unread: 1,
      online: true,
      subject: "Vật lý",
    },
  ];

  const messages = [
    {
      id: 1,
      senderId: "tutor",
      content: "Chào em! Hôm nay chúng ta sẽ học về phương trình bậc hai nhé.",
      timestamp: "10:00",
      type: "text",
    },
    {
      id: 2,
      senderId: "student",
      content: "Dạ em hiểu rồi ạ. Em có thể hỏi thầy về cách giải phương trình này được không?",
      timestamp: "10:02",
      type: "text",
    },
    {
      id: 3,
      senderId: "tutor",
      content: "Tất nhiên rồi! Em gửi đề bài lên đi.",
      timestamp: "10:03",
      type: "text",
    },
    {
      id: 4,
      senderId: "student",
      content: "bai-tap-toan.pdf",
      timestamp: "10:05",
      type: "file",
    },
    {
      id: 5,
      senderId: "tutor",
      content: "Bài tập này khá hay đấy. Đầu tiên em cần xác định các hệ số a, b, c.",
      timestamp: "10:10",
      type: "text",
    },
    {
      id: 6,
      senderId: "student",
      content: "Em hiểu rồi! Cảm ơn thầy ạ 😊",
      timestamp: "10:15",
      type: "text",
    },
  ];

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  const sendMessage = () => {
    if (message.trim()) {
      // Handle send message
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-blue-50 overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 border-r border-blue-100 flex flex-col bg-gradient-to-b from-blue-50/50 to-white">
        {/* Header */}
        <div className="p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2 text-blue-600" />
            Tin nhắn
          </h1>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              whileHover={{ backgroundColor: "#f9fafb" }}
              className={`p-4 cursor-pointer border-b border-blue-50 transition-all duration-200 ${
                selectedChat === conversation.id 
                  ? "bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-l-blue-500 shadow-sm" 
                  : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
              }`}
              onClick={() => setSelectedChat(conversation.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={conversation.avatar}
                    alt={conversation.tutorName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conversation.tutorName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-blue-600 font-medium">
                    {conversation.subject}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={selectedConversation.avatar}
                      alt={selectedConversation.tutorName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-200"
                    />
                    {selectedConversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedConversation.tutorName}
                    </h2>
                    <p className="text-sm text-blue-600">
                      {selectedConversation.online ? "🟢 Đang hoạt động" : "⚫ Offline"} • {selectedConversation.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <PhoneIcon className="w-5 h-5 text-blue-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <VideoCameraIcon className="w-5 h-5 text-blue-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5 text-blue-600" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.senderId === "student" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.senderId === "student"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}>
                    {msg.type === "file" ? (
                      <div className="flex items-center space-x-2">
                        <PaperClipIcon className="w-4 h-4" />
                        <span className="text-sm">{msg.content}</span>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    <p className={`text-xs mt-1 ${
                      msg.senderId === "student" ? "text-blue-200" : "text-gray-500"
                    }`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <PaperClipIcon className="w-5 h-5 text-blue-600" />
                </motion.button>
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chọn một cuộc trò chuyện
              </h3>
              <p className="text-gray-600">
                Chọn một gia sư từ danh sách để bắt đầu trò chuyện
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMessagesPage;
