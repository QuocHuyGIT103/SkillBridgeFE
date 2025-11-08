import React from 'react';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { REQUEST_STATUS_LABELS } from '../../types/contactRequest.types';

interface ContactRequestStatusBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ContactRequestStatusBadge: React.FC<ContactRequestStatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md'
}) => {
  const getStatusIcon = () => {
    const iconClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    
    switch (status) {
      case 'PENDING':
        return <ClockIcon className={`${iconClass} text-yellow-500`} />;
      case 'ACCEPTED':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'REJECTED':
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case 'CANCELLED':
        return <XCircleIcon className={`${iconClass} text-gray-500`} />;
      case 'EXPIRED':
        return <ExclamationTriangleIcon className={`${iconClass} text-orange-500`} />;
      default:
        return <ClockIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'EXPIRED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`
      inline-flex items-center space-x-1 rounded-full font-medium border
      ${getStatusColor()}
      ${sizeClasses[size]}
    `}>
      {showIcon && getStatusIcon()}
      <span>
        {REQUEST_STATUS_LABELS[status as keyof typeof REQUEST_STATUS_LABELS] || status}
      </span>
    </span>
  );
};

export default ContactRequestStatusBadge;