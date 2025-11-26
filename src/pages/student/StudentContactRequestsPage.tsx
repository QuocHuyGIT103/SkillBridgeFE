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
import toast from 'react-hot-toast';

import { useContactRequestStore } from '../../store/contactRequest.store';
import { REQUEST_STATUS_LABELS } from '../../types/contactRequest.types';
import type { ContactRequest } from '../../types/contactRequest.types';
import DashboardStats from '../../components/dashboard/DashboardStats';

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
  const [initiator, setInitiator] = useState<'STUDENT' | 'TUTOR' | ''>('');

  useEffect(() => {
    getStudentRequests();
  }, [getStudentRequests]);

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setFilters({ ...filters, status: status || undefined, initiatedBy: initiator || undefined, page: 1 });
    getStudentRequests({ ...filters, status: status || undefined, initiatedBy: initiator || undefined, page: 1 });
  };

  const handleInitiatorFilter = (value: '' | 'STUDENT' | 'TUTOR') => {
    setInitiator(value);
    setFilters({ ...filters, initiatedBy: value || undefined, page: 1 });
    getStudentRequests({ ...filters, initiatedBy: value || undefined, page: 1 });
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

  const getStatusIcon = (status: string): React.ReactElement<{ className?: string }> => {
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

  const stats = [
    {
      label: 'Tổng yêu cầu',
      value: requests.length,
      icon: ChatBubbleLeftRightIcon,
      color: 'blue' as const,
      description: 'Tất cả yêu cầu đã gửi',
    },
    {
      label: 'Chờ phản hồi',
      value: requests.filter((r) => r.status === 'PENDING').length,
      icon: ClockIcon,
      color: 'yellow' as const,
      description: 'Đang chờ gia sư',
    },
    {
      label: 'Đã chấp nhận',
      value: requests.filter((r) => r.status === 'ACCEPTED').length,
      icon: CheckCircleIcon,
      color: 'green' as const,
      description: 'Gia sư đã đồng ý',
    },
    {
      label: 'Đã từ chối',
      value: requests.filter((r) => r.status === 'REJECTED').length,
      icon: XCircleIcon,
      color: 'red' as const,
      description: 'Gia sư đã từ chối',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <DashboardStats
        title="Yêu cầu học tập của tôi"
        description="Tổng quan về các yêu cầu học tập bạn đã gửi đến gia sư"
        stats={stats}
      />

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50 opacity-80" />
        <div className="absolute -right-10 top-10 h-32 w-32 rounded-full bg-blue-100/40 blur-2xl" />
        <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-indigo-100/40 blur-2xl" />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500">
                Học viên
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-gray-900">
                Yêu cầu học tập của tôi
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Quản lý các yêu cầu đã gửi và theo dõi phản hồi từ gia sư.
              </p>
            </div>
            <Link
              to="/student/smart-search"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5" />
              Tìm gia sư mới
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm text-gray-600 shadow-inner">
              Tổng {pagination.count} yêu cầu
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${selectedStatus === ''
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/70 text-gray-700 border border-gray-200 hover:bg-white'
                  }`}
              >
                Tất cả
              </button>
              {Object.entries(REQUEST_STATUS_LABELS).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${selectedStatus === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white/70 text-gray-700 border border-gray-200 hover:bg-white'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Initiator Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleInitiatorFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm border ${initiator === '' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => handleInitiatorFilter('STUDENT')}
          className={`px-3 py-1.5 rounded-full text-sm border ${initiator === 'STUDENT' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
        >
          Tôi gửi
        </button>
        <button
          onClick={() => handleInitiatorFilter('TUTOR')}
          className={`px-3 py-1.5 rounded-full text-sm border ${initiator === 'TUTOR' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
        >
          Gia sư gửi
        </button>
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
          requests.map((request) => {
            const rawId = request.id || (request as any)._id;
            const normalizedId =
              typeof rawId === 'string' ? rawId : rawId?.toString?.() || '';
            return (
              <StudentRequestCard
                key={normalizedId || request.createdAt}
                request={request}
                onCancel={handleCancelRequest}
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
              className={`px-4 py-2 text-sm border rounded-lg ${pagination.current === page
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
  getStatusIcon: (status: string) => React.ReactElement<{ className?: string }>;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

const StudentRequestCard: React.FC<StudentRequestCardProps> = ({
  request,
  onCancel,
  getStatusIcon,
  formatCurrency,
  formatDate
}) => {
  const canCancel = request.status === 'PENDING' || request.status === 'ACCEPTED';
  const rawId = request.id || (request as any)._id;
  const requestId =
    typeof rawId === 'string' ? rawId : rawId?.toString?.() || '';
  const statusKey = request.status;
  const statusStyles: Record<string, { accentBar: string; iconBg: string; iconText: string; chip: string; chipText: string; heading: string; subtle: string; gradient: string }> = {
    PENDING: {
      accentBar: 'from-sky-400/80 to-sky-500/60',
      iconBg: 'bg-sky-100',
      iconText: 'text-sky-600',
      chip: 'bg-sky-500/10 border border-sky-200',
      chipText: 'text-sky-700',
      heading: 'text-sky-900',
      subtle: 'text-sky-600',
      gradient: 'from-sky-50 via-white to-sky-100'
    },
    ACCEPTED: {
      accentBar: 'from-emerald-400/80 to-emerald-500/60',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      chip: 'bg-emerald-500/10 border border-emerald-200',
      chipText: 'text-emerald-700',
      heading: 'text-emerald-900',
      subtle: 'text-emerald-600',
      gradient: 'from-emerald-50 via-white to-emerald-100'
    },
    REJECTED: {
      accentBar: 'from-rose-400/80 to-rose-500/60',
      iconBg: 'bg-rose-100',
      iconText: 'text-rose-600',
      chip: 'bg-rose-500/10 border border-rose-200',
      chipText: 'text-rose-700',
      heading: 'text-rose-900',
      subtle: 'text-rose-600',
      gradient: 'from-rose-50 via-white to-rose-100'
    },
    EXPIRED: {
      accentBar: 'from-amber-400/80 to-amber-500/60',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      chip: 'bg-amber-500/10 border border-amber-200',
      chipText: 'text-amber-700',
      heading: 'text-amber-900',
      subtle: 'text-amber-600',
      gradient: 'from-amber-50 via-white to-amber-100'
    }
  };

  let resolvedKey: keyof typeof statusStyles = 'PENDING';
  if (statusKey && statusKey in statusStyles) {
    resolvedKey = statusKey as keyof typeof statusStyles;
  }
  const style = statusStyles[resolvedKey];
  const isExpired = request.status === 'PENDING' && request.expiresAt && new Date(request.expiresAt) < new Date();
  const statusLabel = REQUEST_STATUS_LABELS[request.status as keyof typeof REQUEST_STATUS_LABELS];
  const responseTimestamp = request.tutorResponse
    ? request.tutorResponse.acceptedAt ||
    request.tutorResponse.rejectedAt ||
    (request as any).updatedAt ||
    request.createdAt
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-70`} />
      <div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${style.accentBar}`} />

      <div className="relative p-6 md:p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${style.iconBg} ring-1 ring-white shadow-inner`}>
              {React.cloneElement(getStatusIcon(request.status ?? 'PENDING'), { className: `w-6 h-6 ${style.iconText}` })}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {request.initiatedBy === 'TUTOR'
                    ? (request.studentPost?.title || 'Yêu cầu học tập')
                    : (request.tutorPost?.title || 'Yêu cầu học tập')}
                </h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style.chip} ${style.chipText}`}>
                  {statusLabel}
                </span>
                {/* Badge phân biệt loại request */}
                {request.initiatedBy === 'TUTOR' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                    📥 Đề nghị từ gia sư
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                    📤 Yêu cầu của tôi
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {request.initiatedBy === 'TUTOR' ? 'Nhận lúc' : 'Gửi lúc'} {formatDate(request.createdAt)}
              </p>
              <p className={`text-xs mt-2 ${style.subtle}`}>
                Gia sư: {request.tutor?.full_name || 'Đang cập nhật'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 self-start">
            {/* Khi gia sư gửi đề nghị (initiatedBy === 'TUTOR'), hiển thị button chấp nhận/từ chối trực tiếp */}
            {request.initiatedBy === 'TUTOR' && request.status === 'PENDING' ? (
              <>
                <StudentResponseButtons requestId={requestId} request={request} />
              </>
            ) : (
              <>
                <Link
                  to={requestId ? `/student/contact-requests/${requestId}` : '#'}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
                  aria-disabled={!requestId}
                >
                  <EyeIcon className="w-4 h-4" />
                  Xem chi tiết
                </Link>
                {/* Chỉ hiển thị button hủy khi học viên tự gửi request */}
                {canCancel && request.initiatedBy !== 'TUTOR' && (
                  <button
                    onClick={() => requestId && onCancel(requestId)}
                    disabled={!requestId}
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform duration-200 hover:bg-rose-600"
                  >
                    Hủy yêu cầu
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Môn học
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {request.subjectInfo?.name || '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Hình thức: {request.learningMode}
            </p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Thời lượng
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {request.sessionDuration} phút
            </p>
            {request.expectedPrice && (
              <p className="text-xs text-gray-500 mt-1">
                Ngân sách: {formatCurrency(request.expectedPrice)}
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">
            {request.initiatedBy === 'TUTOR' ? 'Tin nhắn từ gia sư' : 'Tin nhắn của bạn'}
          </h4>
          <div className="relative rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <span className="absolute -top-4 left-4 text-4xl text-blue-200">“</span>
            <p className="text-sm text-blue-900 leading-6 pl-4 pr-2">
              {request.message}
            </p>
            <span className="absolute -bottom-6 right-6 text-4xl text-blue-200">”</span>
          </div>
        </div>

        {request.tutorResponse && (
          <div
            className={`rounded-2xl border-l-4 p-5 ${request.status === 'ACCEPTED'
              ? 'border-emerald-400 bg-emerald-50/80'
              : 'border-rose-400 bg-rose-50/80'
              }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h4
                className={`font-semibold ${request.status === 'ACCEPTED' ? 'text-emerald-900' : 'text-rose-900'
                  }`}
              >
                {/* Nếu initiatedBy === 'TUTOR', thì tutorResponse là phản hồi từ học viên, ngược lại là từ gia sư */}
                {request.initiatedBy === 'TUTOR' ? 'Phản hồi của bạn' : 'Phản hồi từ gia sư'}
              </h4>
              {responseTimestamp && (
                <span className="text-xs text-gray-500">
                  {formatDate(responseTimestamp)}
                </span>
              )}
            </div>
            <p
              className={`mt-2 text-sm leading-6 ${request.status === 'ACCEPTED' ? 'text-emerald-800' : 'text-rose-800'
                }`}
            >
              {request.tutorResponse.message}
            </p>

            {request.status === 'REJECTED' && request.tutorResponse.rejectionReason && (
              <div className="mt-3 rounded-xl bg-white/80 p-3 text-xs text-rose-700">
                <span className="font-semibold uppercase tracking-wide text-rose-500">
                  Lý do:
                </span>{' '}
                {request.tutorResponse.rejectionReason}
              </div>
            )}

            {request.tutorResponse.counterOffer && request.status === 'ACCEPTED' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-emerald-800">
                {request.tutorResponse.counterOffer.pricePerSession && (
                  <div className="rounded-xl bg-white/80 p-3">
                    <span className="font-semibold uppercase tracking-wide text-emerald-500">
                      Giá đề xuất
                    </span>
                    <p className="mt-1">
                      {formatCurrency(request.tutorResponse.counterOffer.pricePerSession)}
                    </p>
                  </div>
                )}
                {request.tutorResponse.counterOffer.sessionDuration && (
                  <div className="rounded-xl bg-white/80 p-3">
                    <span className="font-semibold uppercase tracking-wide text-emerald-500">
                      Thời lượng
                    </span>
                    <p className="mt-1">
                      {request.tutorResponse.counterOffer.sessionDuration} phút
                    </p>
                  </div>
                )}
                {request.tutorResponse.counterOffer.schedule && (
                  <div className="rounded-xl bg-white/80 p-3 md:col-span-2">
                    <span className="font-semibold uppercase tracking-wide text-emerald-500">
                      Lịch học
                    </span>
                    <p className="mt-1 leading-5">
                      {request.tutorResponse.counterOffer.schedule}
                    </p>
                  </div>
                )}
                {request.tutorResponse.counterOffer.conditions && (
                  <div className="rounded-xl bg-white/80 p-3 md:col-span-2">
                    <span className="font-semibold uppercase tracking-wide text-emerald-500">
                      Điều kiện
                    </span>
                    <p className="mt-1 leading-5">
                      {request.tutorResponse.counterOffer.conditions}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {request.status === 'ACCEPTED' && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800">
            🎉 Gia sư đã chấp nhận yêu cầu của bạn! Hãy kiểm tra email hoặc điện thoại để cập nhật lịch học.
          </div>
        )}

        {isExpired && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
            ⏰ Yêu cầu đã hết hạn vào {formatDate(request.expiresAt!)}. Bạn có thể gửi yêu cầu mới để tiếp tục tìm gia sư.
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Component for student response buttons (Accept/Reject)
interface StudentResponseButtonsProps {
  requestId: string;
  request: ContactRequest;
}

const StudentResponseButtons: React.FC<StudentResponseButtonsProps> = ({ requestId, request }) => {
  const { studentRespondToRequest, isResponding, getStudentRequests } = useContactRequestStore();
  const [showConfirmModal, setShowConfirmModal] = useState<'ACCEPT' | 'REJECT' | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  const handleResponse = async (action: 'ACCEPT' | 'REJECT') => {
    if (!requestId) {
      toast.error('Không tìm thấy ID yêu cầu');
      return;
    }

    try {
      await studentRespondToRequest(requestId, {
        action,
        message: responseMessage || undefined
      });
      setShowConfirmModal(null);
      setResponseMessage('');
      await getStudentRequests();
    } catch (error) {
      // Error handled in store
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmModal('ACCEPT')}
        disabled={isResponding || !requestId}
        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform duration-200 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircleIcon className="w-4 h-4" />
        Chấp nhận
      </button>
      <button
        onClick={() => setShowConfirmModal('REJECT')}
        disabled={isResponding || !requestId}
        className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform duration-200 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <XCircleIcon className="w-4 h-4" />
        Từ chối
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {showConfirmModal === 'ACCEPT' ? 'Chấp nhận đề nghị dạy' : 'Từ chối đề nghị dạy'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {showConfirmModal === 'ACCEPT'
                ? 'Bạn có chắc chắn muốn chấp nhận đề nghị dạy này?'
                : 'Bạn có chắc chắn muốn từ chối đề nghị dạy này?'}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tin nhắn phản hồi (tùy chọn)
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder={showConfirmModal === 'ACCEPT' ? 'Cảm ơn gia sư, tôi rất vui được học với bạn...' : 'Xin lỗi, tôi không thể chấp nhận đề nghị này...'}
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(null);
                  setResponseMessage('');
                }}
                disabled={isResponding}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleResponse(showConfirmModal)}
                disabled={isResponding}
                className={`px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 ${
                  showConfirmModal === 'ACCEPT'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isResponding ? 'Đang xử lý...' : showConfirmModal === 'ACCEPT' ? 'Chấp nhận' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentContactRequestsPage;