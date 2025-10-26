import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

import { useContactRequestStore } from '../../store/contactRequest.store';
import { useAuthStore } from '../../store/auth.store';
import { REQUEST_STATUS_LABELS, REJECTION_REASONS } from '../../types/contactRequest.types';
import { ChatButton } from '../chat';
import CreateClassModal from '../tutor/CreateClassModal';

const ContactRequestDetail: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentRequest, isLoading, getRequestDetail } = useContactRequestStore();

  const [showCreateClassModal, setShowCreateClassModal] = useState(false);

  useEffect(() => {
    if (requestId) {
      getRequestDetail(requestId);
    }
  }, [requestId]);

  const handleCreateClass = () => {
    setShowCreateClassModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-8 h-8 text-yellow-500" />;
      case 'ACCEPTED':
        return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
      case 'REJECTED':
        return <XCircleIcon className="w-8 h-8 text-red-500" />;
      default:
        return <ClockIcon className="w-8 h-8 text-gray-500" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy yêu cầu
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const isStudent = user?.id === currentRequest.studentId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Quay lại
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {getStatusIcon(currentRequest.status || '')}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Chi tiết yêu cầu học tập
                </h1>
                <p className="text-gray-600">
                  Gửi lúc {formatDate(currentRequest.createdAt)}
                </p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(currentRequest.status || '')}`}>
              {REQUEST_STATUS_LABELS[currentRequest.status as keyof typeof REQUEST_STATUS_LABELS]}
            </span>
          </div>

          {/* Expire Warning */}
          {currentRequest.status === 'PENDING' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                Yêu cầu sẽ hết hạn vào {formatDate(currentRequest.expiresAt)}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Participants */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin tham gia
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {currentRequest.student?.avatar_url ? (
                      <img
                        src={currentRequest.student.avatar_url}
                        alt={currentRequest.student.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Học viên</h3>
                    <p className="text-gray-700">{currentRequest.student?.full_name}</p>
                    <div className="mt-2 space-y-1">
                      {currentRequest.studentContact.phone && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4" />
                          <span>{currentRequest.studentContact.phone}</span>
                        </div>
                      )}
                      {currentRequest.studentContact.email && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <EnvelopeIcon className="w-4 h-4" />
                          <span>{currentRequest.studentContact.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tutor */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {currentRequest.tutor?.avatar_url ? (
                      <img
                        src={currentRequest.tutor.avatar_url}
                        alt={currentRequest.tutor.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gia sư</h3>
                    <p className="text-gray-700">{currentRequest.tutor?.full_name}</p>
                    <div className="mt-2 space-y-1">
                      {currentRequest.tutor?.phone_number && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4" />
                          <span>{currentRequest.tutor.phone_number}</span>
                        </div>
                      )}
                      {currentRequest.tutor?.email && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <EnvelopeIcon className="w-4 h-4" />
                          <span>{currentRequest.tutor.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Message */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tin nhắn từ học viên
              </h2>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-900 whitespace-pre-line">
                  "{currentRequest.message}"
                </p>
              </div>
            </div>

            {/* Tutor Response */}
            {currentRequest.tutorResponse && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Phản hồi từ gia sư
                </h2>
                
                <div className={`rounded-lg p-4 ${
                  currentRequest.status === 'ACCEPTED' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <p className={`mb-4 ${
                    currentRequest.status === 'ACCEPTED' ? 'text-green-900' : 'text-red-900'
                  } whitespace-pre-line`}>
                    {currentRequest.tutorResponse.message}
                  </p>

                  {currentRequest.status === 'REJECTED' && currentRequest.tutorResponse.rejectionReason && (
                    <div className="text-sm text-red-800">
                      <strong>Lý do từ chối:</strong> {REJECTION_REASONS[currentRequest.tutorResponse.rejectionReason as keyof typeof REJECTION_REASONS]}
                    </div>
                  )}
                  
                  {currentRequest.tutorResponse.counterOffer && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900 mb-3">Đề xuất của gia sư:</h4>
                      <div className="space-y-2 text-sm text-green-800">
                        {currentRequest.tutorResponse.counterOffer.pricePerSession && (
                          <div className="flex items-center space-x-2">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            <span>Giá: {formatCurrency(currentRequest.tutorResponse.counterOffer.pricePerSession)}</span>
                          </div>
                        )}
                        {currentRequest.tutorResponse.counterOffer.sessionDuration && (
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>Thời lượng: {currentRequest.tutorResponse.counterOffer.sessionDuration} phút</span>
                          </div>
                        )}
                        {currentRequest.tutorResponse.counterOffer.schedule && (
                          <div>
                            <strong>Lịch học:</strong> {currentRequest.tutorResponse.counterOffer.schedule}
                          </div>
                        )}
                        {currentRequest.tutorResponse.counterOffer.conditions && (
                          <div>
                            <strong>Điều kiện:</strong> {currentRequest.tutorResponse.counterOffer.conditions}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Phản hồi lúc {formatDate(currentRequest.tutorResponse.acceptedAt || currentRequest.tutorResponse.rejectedAt || '')}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin yêu cầu
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Bài đăng</label>
                  <p className="text-gray-900 font-medium">{currentRequest.tutorPost?.title}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Môn học</label>
                  <p className="text-gray-900">{currentRequest.subjectInfo?.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Hình thức học</label>
                  <p className="text-gray-900">{currentRequest.learningMode}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Thời lượng buổi học</label>
                  <p className="text-gray-900">{currentRequest.sessionDuration} phút</p>
                </div>
                
                {currentRequest.expectedPrice && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Giá mong muốn</label>
                    <p className="text-gray-900">{formatCurrency(currentRequest.expectedPrice)}</p>
                  </div>
                )}
                
                {currentRequest.preferredSchedule && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Lịch học mong muốn</label>
                    <p className="text-gray-900 text-sm bg-gray-50 rounded p-3">
                      {currentRequest.preferredSchedule}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {currentRequest.status === 'ACCEPTED' && isStudent && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">
                  Yêu cầu đã được chấp nhận!
                </h4>
                <p className="text-sm text-green-800 mb-4">
                  Gia sư sẽ liên hệ với bạn để trao đổi chi tiết và tạo lớp học.
                </p>
                <div className="space-y-2">
                  <ChatButton
                    contactRequestId={currentRequest.id}
                    currentUserId={( user?.id || '')}
                    className="w-full"
                    variant="outline"
                  >
                    Mở hộp chat
                  </ChatButton>
                  
                  <a
                    href={`mailto:${currentRequest.tutor?.email}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    Gửi email cho gia sư
                  </a>
                  {currentRequest.tutor?.phone_number && (
                    <a
                      href={`tel:${currentRequest.tutor.phone_number}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm"
                    >
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      Gọi cho gia sư
                    </a>
                  )}
                </div>
              </div>
            )}
             {currentRequest.status === 'ACCEPTED' && !isStudent && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">
                  Bạn đã chấp nhận yêu cầu!
                </h4>
                <p className="text-sm text-green-800 mb-4">
                  Bạn có thể nhắn tin với học viên hoặc tạo lớp học ngay.
                </p>
                <div className="space-y-2">
                  <ChatButton
                    contactRequestId={currentRequest.id}
                    currentUserId={(user?.id || '')}
                    className="w-full"
                  >
                    Nhắn tin
                  </ChatButton>
                  <button
                    onClick={handleCreateClass}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Tạo lớp học
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {showCreateClassModal && currentRequest && (
          <CreateClassModal
            request={currentRequest}
            onClose={() => setShowCreateClassModal(false)}
            onSuccess={() => {
              setShowCreateClassModal(false);
              if (requestId) {
                getRequestDetail(requestId);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ContactRequestDetail;