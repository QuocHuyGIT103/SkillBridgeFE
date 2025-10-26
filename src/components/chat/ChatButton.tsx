import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

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
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
      outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
    } as const;

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    } as const;

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 20;
      default: return 18;
    }
  };

  const handleClick = () => {
    const role = user?.role?.toLowerCase() === 'tutor' ? 'tutor' : 'student';
    const basePath = `/${role}/messages`;
    navigate(`${basePath}?contactRequestId=${contactRequestId}`);
  };

  return (
    <button onClick={handleClick} className={getButtonClasses()}>
      <MessageCircle size={getIconSize()} className="mr-2" />
      {children}
    </button>
  );
};

export default ChatButton;