// src/components/chat/MessageBubble.tsx

import React, { useState } from 'react';
import { CheckCheck, Download, FileText, X } from 'lucide-react';
import type { MessageData } from '../../services/message.service';

interface MessageBubbleProps {
  message: MessageData;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const [showImageModal, setShowImageModal] = useState(false);
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

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file icon based on type
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="w-5 h-5" />;
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return <FileText className="w-5 h-5" />;
  };

  const renderContent = () => {
    // Render image message
    if (message.messageType === 'image' && message.fileMetadata?.fileUrl) {
      return (
        <div className="space-y-2">
          <div 
            className="relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => setShowImageModal(true)}
            title="Click để xem lớn hơn"
          >
            <img
              src={message.fileMetadata.fileUrl}
              alt={message.fileMetadata.fileName || 'image'}
              className="rounded-lg max-w-[240px] max-h-[320px] object-cover shadow-md transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
            {/* Overlay chỉ hiện khi hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg flex items-center justify-center pointer-events-none">
              <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-semibold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm transition-opacity duration-200">
                🔍 Click để phóng to
              </span>
            </div>
          </div>
          {message.content && message.content !== 'Ảnh' && (
            <p className="text-sm whitespace-pre-wrap break-words mt-2">{message.content}</p>
          )}
        </div>
      );
    }

    // Render file message
    if (message.messageType === 'file' && message.fileMetadata?.fileUrl) {
      const handleFileClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
          // Fetch file as blob
          const response = await fetch(message.fileMetadata!.fileUrl);
          const blob = await response.blob();
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          // Use original filename to preserve Vietnamese characters and extension
          const fileName = message.fileMetadata!.fileName || 'download';
          link.download = fileName;
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          
          // Cleanup
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Download error:', error);
          // Fallback: direct link
          window.open(message.fileMetadata!.fileUrl, '_blank');
        }
      };

      return (
        <div className="space-y-2">
          <div 
            className={`flex items-center gap-3 p-3 rounded-lg ${isOwn ? 'bg-blue-600' : 'bg-white'} shadow-sm border ${isOwn ? 'border-blue-400' : 'border-gray-200'} cursor-pointer hover:opacity-90 transition-opacity`}
            onClick={handleFileClick}
            title="Click để tải xuống"
          >
            <div className={`flex-shrink-0 text-2xl ${isOwn ? 'opacity-90' : ''}`}>
              {getFileIcon(message.fileMetadata.fileType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                {message.fileMetadata.fileName || 'Tệp đính kèm'}
              </p>
              {message.fileMetadata.fileSize && (
                <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatFileSize(message.fileMetadata.fileSize)}
                </p>
              )}
            </div>
            <div className={`flex-shrink-0 p-2 rounded-full ${isOwn ? 'bg-blue-500' : 'bg-gray-100'}`}>
              <Download className={`w-4 h-4 ${isOwn ? 'text-white' : 'text-gray-600'}`} />
            </div>
          </div>
          {message.content && message.content !== message.fileMetadata.fileName && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
      );
    }

    // Default: text message
    return (
      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
    );
  };

  return (
    <>
      <div className={`flex w-full ${bubbleAlignment}`}>
        <div className="max-w-xs md:max-w-md">
          <div className={`px-4 py-2 rounded-2xl ${bubbleRadius} ${bubbleClasses}`}>
            {renderContent()}
          </div>
          <div className={`flex items-center mt-1 space-x-1 ${bubbleAlignment}`}>
            <span className="text-xs text-gray-500">{time}</span>
            {isOwn && message.status === 'read' && (
              <CheckCheck size={14} className="text-blue-500" />
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && message.messageType === 'image' && message.fileMetadata?.fileUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <img
              src={message.fileMetadata.fileUrl}
              alt={message.fileMetadata.fileName || 'image'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
              <p className="text-sm font-medium truncate">
                {message.fileMetadata.fileName || 'Hình ảnh'}
              </p>
              <div className="flex gap-2 mt-2">
                <a
                  href={message.fileMetadata.fileUrl}
                  download={message.fileMetadata.fileName}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={16} />
                  Tải xuống
                </a>
                <a
                  href={message.fileMetadata.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Mở trong tab mới
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageBubble;