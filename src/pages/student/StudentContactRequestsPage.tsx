import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

import { useContactRequestStore } from '../../store/contactRequest.store';
import { REQUEST_STATUS_LABELS } from '../../types/contactRequest.types';
import type { ContactRequest } from '../../types/contactRequest.types';

const StudentContactRequestsPage: React.FC = () => {
  const {
    requests,
    isLoading,
    pagination,
    filters,
    getStudentRequests,
    setFilters,
    cancelRequest
  } = useContactRequestStore();

  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    getStudentRequests();
  }, [getStudentRequests]);

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setFilters({ ...filters, status: status || undefined, page: 1 });
    getStudentRequests({ ...filters, status: status || undefined, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    getStudentRequests({ ...filters, page });
  };

  const handleCancelRequest = async (requestId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy yêu cầu này?')) {
      try {
        await cancelRequest(requestId);
        getStudentRequests();
      } catch (error) {
        // Error handled in store
      }
    }
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Yêu cầu học tập của tôi
          </h1>
          <Link
            to="/student/smart-search"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Tìm gia sư mới</span>
          </Link>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Tổng: {pagination.count} yêu cầu
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
            <p className="text-gray-600 mb-4">
              Bạn chưa gửi yêu cầu học tập nào đến gia sư.
            </p>
            <Link
              to="/student/smart-search"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Tìm gia sư ngay</span>
            </Link>
          </div>
        ) : (
          requests.map((request) => (
            <StudentRequestCard
              key={request.id}
              request={request}
              onCancel={handleCancelRequest}
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
    </div>
  );
};

// Student Request Card Component
interface StudentRequestCardProps {
  request: ContactRequest;
  onCancel: (requestId: string) => void;
  getStatusIcon: (status: string) => React.ReactElement;
  getStatusColor: (status: string) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

const StudentRequestCard: React.FC<StudentRequestCardProps> = ({
  request,
  onCancel,
  getStatusIcon,
  getStatusColor,
  formatCurrency,
  formatDate
}) => {
  const canCancel = request.status === 'PENDING' || request.status === 'ACCEPTED';

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

          {/* Tutor & Post Info */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              {request.tutorPost?.title}
            </h3>
            <p className="text-gray-600">
              Gia sư: <span className="font-medium">{request.tutor?.full_name}</span>
            </p>
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1 text-sm">
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
              {request.expectedPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá mong muốn:</span>
                  <span className="font-medium">{formatCurrency(request.expectedPrice)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Your Message */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Tin nhắn của bạn:</h4>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                "{request.message}"
              </p>
            </div>
          </div>

          {/* Tutor Response */}
          {request.tutorResponse && (
            <div className={`rounded-lg p-4 mb-4 ${
              request.status === 'ACCEPTED' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h4 className={`font-medium mb-2 ${
                request.status === 'ACCEPTED' ? 'text-green-900' : 'text-red-900'
              }`}>
                Phản hồi từ gia sư:
              </h4>
              <p className={`text-sm mb-2 ${
                request.status === 'ACCEPTED' ? 'text-green-800' : 'text-red-800'
              }`}>
                {request.tutorResponse.message}
              </p>
              
              {request.tutorResponse.counterOffer && request.status === 'ACCEPTED' && (
                <div className="text-xs text-green-700 space-y-1 mt-3 p-3 bg-green-100 rounded">
                  <div className="font-medium">Đề xuất của gia sư:</div>
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

          {/* Status Messages */}
          {request.status === 'ACCEPTED' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                🎉 Gia sư đã chấp nhận yêu cầu của bạn! Gia sư sẽ liên hệ với bạn để trao đổi chi tiết và tạo lớp học.
              </p>
            </div>
          )}

          {request.status === 'PENDING' && request.expiresAt && new Date(request.expiresAt) < new Date() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⏰ Yêu cầu đã hết hạn vào {formatDate(request.expiresAt)}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 ml-4">
          <Link
            to={`/student/contact-requests/${request.id}`}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <EyeIcon className="w-5 h-5" />
          </Link>
          
          {canCancel && (
            <button
              onClick={() => onCancel(request.id)}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Hủy
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentContactRequestsPage;