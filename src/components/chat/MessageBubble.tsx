// src/components/chat/MessageBubble.tsx

import React from 'react';
import { CheckCheck } from 'lucide-react';
import type { MessageData } from '../../services/message.service';

interface MessageBubbleProps {
  message: MessageData;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  // --- PHẦN GIẢI THÍCH ---
  // 1. CĂN LỀ: Dùng flexbox để căn lề.
  //    - 'justify-end': Đẩy tin nhắn sang phải (của mình).
  //    - 'justify-start': Giữ tin nhắn ở bên trái (của người khác).
  const bubbleAlignment = isOwn ? 'justify-end' : 'justify-start';

  // 2. MÀU SẮC: Thay đổi màu nền và màu chữ.
  //    - 'bg-blue-500 text-white': Nền xanh chữ trắng cho tin nhắn của mình.
  //    - 'bg-gray-200 text-gray-900': Nền xám chữ đen cho tin nhắn nhận được.
  const bubbleClasses = isOwn
    ? 'bg-blue-500 text-white'
    : 'bg-gray-200 text-gray-900';
  
  // 3. BO GÓC: Thay đổi một chút bo góc để tạo hiệu ứng "đuôi" tin nhắn.
  const bubbleRadius = isOwn ? 'rounded-br-lg' : 'rounded-bl-lg';

  // Định dạng lại thời gian cho ngắn gọn
  const time = new Date(message.createdAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex w-full ${bubbleAlignment}`}>
      <div className="max-w-xs md:max-w-md">
        <div className={`px-4 py-2 rounded-2xl ${bubbleRadius} ${bubbleClasses}`}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div className={`flex items-center mt-1 space-x-1 ${bubbleAlignment}`}>
          <span className="text-xs text-gray-500">{time}</span>
          {isOwn && message.status === 'read' && (
            <CheckCheck size={14} className="text-blue-200" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;