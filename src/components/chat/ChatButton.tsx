import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatModal from './ChatModal';

interface ChatButtonProps {
  contactRequestId: string;
  currentUserId: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const ChatButton: React.FC<ChatButtonProps> = ({
  contactRequestId,
  currentUserId,
  className = '',
  variant = 'primary',
  size = 'md',
  children
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
      outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 20;
      default: return 18;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsChatOpen(true)}
        className={getButtonClasses()}
      >
        <MessageCircle size={getIconSize()} className="mr-2" />
        {children}
      </button>

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUserId={currentUserId}
        initialContactRequestId={contactRequestId}
      />
    </>
  );
};

export default ChatButton;