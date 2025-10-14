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
  const canRespond = request.status === 'PENDING';
  const canCreateClass = request.status === 'ACCEPTED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            {getStatusIcon(request.status)}
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
              {REQUEST_STATUS_LABELS[request.status as keyof typeof REQUEST_STATUS_LABELS]}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(request.createdAt)}
            </span>
          </div>

          {/* Student Info */}
          <div className="flex items-center space-x-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              {request.student?.avatar_url ? (
                <img
                  src={request.student.avatar_url}
                  alt={request.student.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-600" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {request.student?.full_name}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {request.studentContact.phone && (
                  <div className="flex items-center space-x-1">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{request.studentContact.phone}</span>
                  </div>
                )}
                {request.studentContact.email && (
                  <div className="flex items-center space-x-1">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>{request.studentContact.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Thông tin yêu cầu</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bài đăng:</span>
                  <span className="font-medium">{request.tutorPost?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Môn học:</span>
                  <span className="font-medium">{request.subjectInfo?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hình thức:</span>
                  <span className="font-medium">{request.learningMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời lượng:</span>
                  <span className="font-medium">{request.sessionDuration} phút</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Mong muốn của học viên</h4>
              <div className="space-y-1 text-sm">
                {request.expectedPrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá mong muốn:</span>
                    <span className="font-medium">{formatCurrency(request.expectedPrice)}</span>
                  </div>
                )}
                {request.preferredSchedule && (
                  <div>
                    <span className="text-gray-600">Lịch mong muốn:</span>
                    <p className="text-xs text-gray-700 mt-1 bg-gray-100 rounded p-2">
                      {request.preferredSchedule}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Student Message */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Tin nhắn từ học viên:</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                "{request.message}"
              </p>
            </div>
          </div>

          {/* Tutor Response (if any) */}
          {request.tutorResponse && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-green-900 mb-2">Phản hồi của bạn:</h4>
              <p className="text-sm text-green-800 mb-2">
                {request.tutorResponse.message}
              </p>
              
              {request.tutorResponse.counterOffer && (
                <div className="text-xs text-green-700 space-y-1 mt-3 p-3 bg-green-100 rounded">
                  <div className="font-medium">Đề xuất của bạn:</div>
                  {request.tutorResponse.counterOffer.pricePerSession && (
                    <div>• Giá: {formatCurrency(request.tutorResponse.counterOffer.pricePerSession)}</div>
                  )}
                  {request.tutorResponse.counterOffer.sessionDuration && (
                    <div>• Thời lượng: {request.tutorResponse.counterOffer.sessionDuration} phút</div>
                  )}
                  {request.tutorResponse.counterOffer.schedule && (
                    <div>• Lịch học: {request.tutorResponse.counterOffer.schedule}</div>
                  )}
                  {request.tutorResponse.counterOffer.conditions && (
                    <div>• Điều kiện: {request.tutorResponse.counterOffer.conditions}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 ml-4">
          <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
            <EyeIcon className="w-5 h-5" />
          </button>
          
          {canRespond && (
            <button
              onClick={() => onResponse(request)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Phản hồi
            </button>
          )}
          
          {canCreateClass && (
            <button
              onClick={() => onCreateClass(request)}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Tạo lớp</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TutorRequestsList;