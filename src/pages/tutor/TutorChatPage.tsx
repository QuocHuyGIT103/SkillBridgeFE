import React from "react";
import { motion } from "framer-motion";
import {
  UserIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

const TutorChatPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        <div className="overflow-y-auto h-full">
          {[
            {
              name: "Sarah Johnson",
              message: "Thanks for the math lesson!",
              time: "2m",
              unread: 2,
              online: true,
            },
            {
              name: "Mike Chen",
              message: "Can we reschedule tomorrow?",
              time: "15m",
              unread: 0,
              online: false,
            },
            {
              name: "Emma Davis",
              message: "I have a question about physics...",
              time: "1h",
              unread: 1,
              online: true,
            },
            {
              name: "Alex Wilson",
              message: "Great session today!",
              time: "2h",
              unread: 0,
              online: false,
            },
          ].map((conversation, index) => (
            <motion.div
              key={conversation.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-primary" />
                  </div>
                  {conversation.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 truncate">
                      {conversation.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {conversation.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.message}
                    </p>
                    {conversation.unread > 0 && (
                      <span className="ml-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <p className="font-medium text-gray-900">Sarah Johnson</p>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-xs bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-900">
                Hi! I have a question about the algebra homework you gave me
                yesterday.
              </p>
              <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-end"
          >
            <div className="max-w-xs bg-primary text-white rounded-lg p-3">
              <p className="text-sm">
                Of course! What specifically are you having trouble with?
              </p>
              <p className="text-xs text-primary-200 mt-1">10:32 AM</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-start"
          >
            <div className="max-w-xs bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-900">
                I'm struggling with quadratic equations. Could we schedule an
                extra session this week?
              </p>
              <p className="text-xs text-gray-500 mt-1">10:35 AM</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <div className="max-w-xs bg-primary text-white rounded-lg p-3">
              <p className="text-sm">
                Absolutely! I have availability on Thursday evening. Let me send
                you some practice problems to work on until then.
              </p>
              <p className="text-xs text-primary-200 mt-1">10:38 AM</p>
            </div>
          </motion.div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorChatPage;
