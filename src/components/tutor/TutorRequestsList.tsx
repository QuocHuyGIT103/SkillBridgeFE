import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
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

  const getStatusIcon = (status?: string) => {
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

  const getStatusColor = (status?: string) => {
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
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
  const statusKey = request.status ?? 'PENDING';
  const statusLabel = (REQUEST_STATUS_LABELS as any)[statusKey] ?? statusKey;
  const statusClass = getStatusColor(statusKey);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 hidden md:block">{getStatusIcon(statusKey)}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">{tutorPost?.title ?? '—'}</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
            {tutorPost?.pricePerSession != null && (
              <div className="mt-1 text-sm text-gray-600">{formatCurrency(tutorPost.pricePerSession)}</div>
            )}
            <div className="mt-2 text-sm text-gray-500">
              <span className="font-medium">Học viên:</span> {(request.studentId as any)?.full_name ?? '—'}
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          {request.status === 'ACCEPTED' && (
            <button onClick={() => onCreateClass(request)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Tạo lớp
            </button>
          )}

          {request.status === 'PENDING' && (
            <button onClick={() => onResponse(request)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Phản hồi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorRequestsList;