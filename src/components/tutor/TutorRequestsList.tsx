import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 opacity-80" />
        <div className="absolute -right-12 top-8 h-32 w-32 rounded-full bg-emerald-100/40 blur-2xl" />
        <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-blue-100/40 blur-2xl" />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500">
                Gia sư
              </p>
              <h2 className="mt-1 text-3xl font-semibold text-gray-900">
                Yêu cầu học tập nhận được
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Theo dõi yêu cầu từ học viên và phản hồi nhanh chóng để giữ kết nối.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm text-gray-600 shadow-inner">
              Tổng {pagination.count} yêu cầu
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedStatus === ''
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white/70 text-gray-700 border border-gray-200 hover:bg-white'
              }`}
            >
              Tất cả
            </button>
            {Object.entries(REQUEST_STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedStatus === status
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white/70 text-gray-700 border border-gray-200 hover:bg-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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
          requests.map((request) => {
            const rawId = request.id || (request as any)._id;
            const normalizedId =
              typeof rawId === 'string' ? rawId : rawId?.toString?.() || '';
            return (
            <TutorRequestCard
              key={normalizedId || request.createdAt}
              request={request}
              onResponse={handleResponse}
              onCreateClass={handleCreateClass}
              getStatusIcon={getStatusIcon}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          );
          })
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
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

const TutorRequestCard: React.FC<TutorRequestCardProps> = ({
  request,
  onResponse,
  onCreateClass,
  getStatusIcon,
  formatCurrency,
  formatDate
}) => {
  // normalize populated tutor post
  const tutorPost = (request as any).tutorPost ?? (request as any).tutorPostId;
  const rawId = request.id || (request as any)._id;
  const requestId =
    typeof rawId === 'string' ? rawId : rawId?.toString?.() || '';
  const statusKey = request.status ?? 'PENDING';
  const statusLabel = (REQUEST_STATUS_LABELS as any)[statusKey] ?? statusKey;
  const hasLearningClass = Boolean(request.learningClass?.id);
  const displayStatusLabel = hasLearningClass ? 'Đã tạo lớp học' : statusLabel;
  const statusStyles: Record<string, { accentBar: string; iconBg: string; iconText: string; chip: string; chipText: string; gradient: string; subtle: string }> = {
    PENDING: {
      accentBar: 'from-blue-400/80 to-blue-500/60',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      chip: 'bg-blue-500/10 border border-blue-200',
      chipText: 'text-blue-700',
      gradient: 'from-blue-50 via-white to-blue-100',
      subtle: 'text-blue-600'
    },
    ACCEPTED: {
      accentBar: 'from-emerald-400/80 to-emerald-500/60',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      chip: 'bg-emerald-500/10 border border-emerald-200',
      chipText: 'text-emerald-700',
      gradient: 'from-emerald-50 via-white to-emerald-100',
      subtle: 'text-emerald-600'
    },
    REJECTED: {
      accentBar: 'from-rose-400/80 to-rose-500/60',
      iconBg: 'bg-rose-100',
      iconText: 'text-rose-600',
      chip: 'bg-rose-500/10 border border-rose-200',
      chipText: 'text-rose-700',
      gradient: 'from-rose-50 via-white to-rose-100',
      subtle: 'text-rose-600'
    },
    EXPIRED: {
      accentBar: 'from-amber-400/80 to-amber-500/60',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      chip: 'bg-amber-500/10 border border-amber-200',
      chipText: 'text-amber-700',
      gradient: 'from-amber-50 via-white to-amber-100',
      subtle: 'text-amber-600'
    }
  };

  const style = statusStyles[statusKey] || statusStyles.PENDING;
  const studentInfo = (request as any).student || (typeof request.studentId === 'object' ? request.studentId : null);
  const studentName = studentInfo?.full_name || 'Học viên';
  const studentEmail = studentInfo?.email || request.studentContact?.email || '—';
  const studentPhone = studentInfo?.phone_number || request.studentContact?.phone;
  const preferredSchedule = request.preferredSchedule;
  const isExpired = request.status === 'PENDING' && request.expiresAt && new Date(request.expiresAt) < new Date();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-60`} />
      <div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${style.accentBar}`} />

      <div className="relative p-6 md:p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${style.iconBg} ring-1 ring-white shadow-inner`}>
              {React.cloneElement(getStatusIcon(statusKey), { className: `w-6 h-6 ${style.iconText}` })}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {request.initiatedBy === 'TUTOR'
                    ? (request.studentPost?.title ?? 'Yêu cầu học tập')
                    : (tutorPost?.title ?? 'Yêu cầu học tập')}
                </h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style.chip} ${style.chipText}`}>
                  {displayStatusLabel}
                </span>
                {hasLearningClass && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/10 text-emerald-700 border border-emerald-200">
                    ✅ Lớp học đã tạo
                  </span>
                )}
                {/* Badge phân biệt loại request */}
                {request.initiatedBy === 'TUTOR' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                    📤 Đề nghị dạy của bạn
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                    📥 Yêu cầu từ học viên
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {request.initiatedBy === 'TUTOR' ? 'Gửi lúc' : 'Nhận lúc'} {formatDate(request.createdAt)}
              </p>
              <p className={`text-xs mt-2 ${style.subtle}`}>
                {request.initiatedBy === 'TUTOR' ? 'Đề nghị gửi đến' : 'Học viên'}: {studentName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 self-start">
            <Link
              to={requestId ? `/tutor/contact-requests/${requestId}` : '#'}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
              aria-disabled={!requestId}
            >
              <EyeIcon className="w-4 h-4" />
              Xem chi tiết
            </Link>
            {statusKey === 'ACCEPTED' && requestId && !hasLearningClass && (
              <button
                onClick={() => onCreateClass(request)}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-transform"
              >
                Tạo lớp học
              </button>
            )}
            {hasLearningClass && request.learningClass?.id && (
              <Link
                to={`/tutor/classes/${request.learningClass.id}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-transform"
              >
                Xem lớp học
              </Link>
            )}
            {/* Chỉ hiển thị button phản hồi khi request được học viên gửi tới, không phải khi gia sư tự gửi */}
            {statusKey === 'PENDING' && requestId && request.initiatedBy !== 'TUTOR' && (
              <button
                onClick={() => onResponse(request)}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-transform"
              >
                Phản hồi ngay
              </button>
            )}
            {/* Hiển thị thông báo khi request do gia sư gửi */}
            {statusKey === 'PENDING' && request.initiatedBy === 'TUTOR' && (
              <span className="inline-flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200">
                Đang chờ học viên phản hồi
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Môn học
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {(request.subjectInfo as any)?.name ?? (request.subject as any)?.name ?? '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Hình thức: {request.learningMode}
            </p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Thông tin lớp
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {request.sessionDuration} phút / buổi
            </p>
            {request.expectedPrice && (
              <p className="text-xs text-gray-500 mt-1">
                Ngân sách: {formatCurrency(request.expectedPrice)}
              </p>
            )}
            {tutorPost?.pricePerSession && (
              <p className="text-xs text-gray-500 mt-1">
                Giá niêm yết: {formatCurrency(tutorPost.pricePerSession)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              {request.initiatedBy === 'TUTOR' ? 'Tin nhắn từ gia sư' : 'Tin nhắn từ học viên'}
            </h4>
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900 leading-6">
              {request.message}
            </div>
          </div>

          {preferredSchedule && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-900 leading-6">
              <span className="font-semibold uppercase tracking-wide text-xs text-indigo-600">
                Lịch mong muốn
              </span>
              <p className="mt-2">
                {preferredSchedule}
              </p>
            </div>
          )}
        </div>

        {isExpired && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
            ⏰ Yêu cầu đã hết hạn vào {formatDate(request.expiresAt)}. Hãy phản hồi để tránh mất cơ hội hoặc chờ yêu cầu mới.
          </div>
        )}

        {hasLearningClass && request.learningClass && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-900 space-y-1">
            <p className="font-semibold">Thông tin lớp học đã tạo</p>
            <p>Tên lớp: {request.learningClass.title || 'Chưa đặt tên'}</p>
            {request.learningClass.startDate && (
              <p>
                Ngày bắt đầu: {formatDate(request.learningClass.startDate)}
              </p>
            )}
            {request.learningClass.schedule && (
              <p>
                Lịch học: {request.learningClass.schedule.dayOfWeek?.length || 0} buổi/tuần ·{' '}
                {request.learningClass.schedule.startTime} - {request.learningClass.schedule.endTime}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorRequestsList;