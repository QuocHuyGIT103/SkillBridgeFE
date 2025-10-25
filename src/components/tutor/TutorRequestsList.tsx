import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

import { useContactRequestStore } from '../../store/contactRequest.store';
import { REQUEST_STATUS_LABELS } from '../../types/contactRequest.types';
import type { ContactRequest } from '../../types/contactRequest.types';
import TutorResponseModal from './TutorResponseModal';
import CreateClassModal from './CreateClassModal';
import { ChatButton } from '../chat';

const TutorRequestsList: React.FC = () => {
  const {
    requests,
    isLoading,
    pagination,
    filters,
    getTutorRequests,
    setFilters
  } = useContactRequestStore();

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);

  useEffect(() => {
    getTutorRequests();
  }, [getTutorRequests]);

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setFilters({ ...filters, status: status || undefined, page: 1 });
    getTutorRequests({ ...filters, status: status || undefined, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    getTutorRequests({ ...filters, page });
  };

  const handleResponse = (request: ContactRequest) => {
    setSelectedRequest(request);
    setShowResponseModal(true);
  };

  const handleCreateClass = (request: ContactRequest) => {
    setSelectedRequest(request);
    setShowCreateClassModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'ACCEPTED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Yêu cầu học tập
          </h2>
          <div className="text-sm text-gray-500">
            Tổng: {pagination.count} yêu cầu
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === '' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          {Object.entries(REQUEST_STATUS_LABELS).map(([status, label]) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có yêu cầu nào
            </h3>
            <p className="text-gray-600">
              Chưa có học viên nào gửi yêu cầu học tập đến bạn.
            </p>
          </div>
        ) : (
          requests.map((request) => (
            <TutorRequestCard
              key={request.id}
              request={request}
              onResponse={handleResponse}
              onCreateClass={handleCreateClass}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.current - 1)}
            disabled={pagination.current === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          
          {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 text-sm border rounded-lg ${
                pagination.current === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(pagination.current + 1)}
            disabled={pagination.current === pagination.total}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Modals */}
      {showResponseModal && selectedRequest && (
        <TutorResponseModal
          request={selectedRequest}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={() => {
            setShowResponseModal(false);
            setSelectedRequest(null);
            getTutorRequests();
          }}
        />
      )}

      {showCreateClassModal && selectedRequest && (
        <CreateClassModal
          request={selectedRequest}
          onClose={() => {
            setShowCreateClassModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={() => {
            setShowCreateClassModal(false);
            setSelectedRequest(null);
            getTutorRequests();
          }}
        />
      )}
    </div>
  );
};

// Tutor Request Card Component
interface TutorRequestCardProps {
  request: ContactRequest;
  onResponse: (request: ContactRequest) => void;
  onCreateClass: (request: ContactRequest) => void;
  getStatusIcon: (status: string) => JSX.Element;
  getStatusColor: (status: string) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

const TutorRequestCard: React.FC<TutorRequestCardProps> = ({
  request,
  onResponse,
  onCreateClass,
  getStatusIcon,
  getStatusColor,
  formatCurrency,
  formatDate
}) => {
  // normalize populated tutor post
  const tutorPost = (request as any).tutorPost ?? (request as any).tutorPostId;
  const canRespond = request.status === 'PENDING';
  const canCreateClass = request.status === 'ACCEPTED';

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-gray-600">Bài đăng</div>
          <div className="font-medium">{tutorPost?.title ?? '—'}</div>
          {tutorPost?.pricePerSession != null && (
            <div className="text-sm text-gray-500">{formatCurrency(tutorPost.pricePerSession)}</div>
          )}
        </div>
        <div>
          <div className="text-sm text-gray-600">Học viên</div>
          <div className="font-medium">{(request.studentId as any)?.full_name ?? '—'}</div>
        </div>
      </div>

      {/* actions */}
      <div className="mt-4 flex gap-2">
        <button disabled={!canRespond} onClick={() => onResponse(request)} className="px-3 py-1 bg-green-500 text-white rounded">Phản hồi</button>
        <button disabled={!canCreateClass} onClick={() => onCreateClass(request)} className="px-3 py-1 bg-blue-500 text-white rounded">Tạo lớp</button>
      </div>
    </div>
  );
};

export default TutorRequestsList;