import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface AISmartSearchButtonProps {
  postId: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

const AISmartSearchButton: React.FC<AISmartSearchButtonProps> = ({
  postId,
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/student/ai-recommendations/${postId}`);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl';
      case 'secondary':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl';
      case 'outline':
        return 'bg-white border-2 border-purple-500 text-purple-600 hover:bg-purple-50';
      default:
        return 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'md':
        return 'px-6 py-3 text-base';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        flex items-center justify-center space-x-2 rounded-lg font-semibold
        transition-all duration-200 transform
        ${className}
      `}
    >
      <SparklesIcon className="w-5 h-5 animate-pulse" />
      <span>Tìm Gia Sư Bằng AI</span>
      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <SparklesIcon className="w-4 h-4" />
      </motion.div>
    </motion.button>
  );
};

export default AISmartSearchButton;
