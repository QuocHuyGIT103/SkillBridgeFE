import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

import { useContactRequestStore } from '../../store/contactRequest.store';
import { useAuthStore } from '../../store/auth.store';
import { REQUEST_STATUS_LABELS, REJECTION_REASONS } from '../../types/contactRequest.types';
import CreateClassModal from '../tutor/CreateClassModal';
import ConfirmResponseModal from './ConfirmResponseModal';


const ContactRequestDetail: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentRequest, isLoading, getRequestDetail } = useContactRequestStore();
  const { studentRespondToRequest } = useContactRequestStore();

  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'ACCEPT' | 'REJECT' | null>(null);
  const [isResponding, setIsResponding] = useState(false);

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

  const handleStudentRespondClick = (action: 'ACCEPT' | 'REJECT') => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmResponse = async () => {
    if (!requestId || !pendingAction) return;

    setIsResponding(true);
    try {
      await studentRespondToRequest(requestId, { action: pendingAction });
      await getRequestDetail(requestId);
      setShowConfirmModal(false);
      setPendingAction(null);
    } catch (error) {
      console.error('Error responding to request:', error);
    } finally {
      setIsResponding(false);
    }
  };

  const handleCloseConfirmModal = () => {
    if (!isResponding) {
      setShowConfirmModal(false);
      setPendingAction(null);
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

  // Backend ensures studentId is always a string after transformation
  const isStudent = user?.id === currentRequest.studentId;
  const initiatedBy = (currentRequest as any).initiatedBy as 'STUDENT' | 'TUTOR' | undefined;
  const currentStatus = currentRequest.status || 'PENDING';
  const hasLearningClass = Boolean(currentRequest.learningClass?.id);



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
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 shadow-sm mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50" />
          <div className="absolute -right-10 top-10 h-32 w-32 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-indigo-100/40 blur-2xl" />
          <div className="relative p-6 md:p-8 space-y-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/80 shadow-inner ring-1 ring-white backdrop-blur-sm">
                  {getStatusIcon(currentStatus)}
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-blue-500 uppercase">
                    {initiatedBy === 'TUTOR' ? 'Đề nghị dạy của gia sư' : 'Yêu cầu học tập của học viên'}
                  </p>
                  <h1 className="text-3xl font-semibold text-gray-900 mt-1">
                    {initiatedBy === 'TUTOR' ? 'Chi tiết đề nghị dạy' : 'Chi tiết yêu cầu học tập'}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Gửi lúc {formatDate(currentRequest.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-3">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(currentStatus)}`}>
                  {REQUEST_STATUS_LABELS[currentStatus as keyof typeof REQUEST_STATUS_LABELS]}
                </span>

                {currentRequest.status === 'PENDING' && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 text-sm text-blue-700 border border-blue-100 backdrop-blur-sm">
                    <ClockIcon className="w-4 h-4" />
                    <span>Hết hạn vào {formatDate(currentRequest.expiresAt)}</span>
                  </div>
                )}

                {/* Student actions when pending (for tutor-initiated flow) */}
                {isStudent && currentRequest.status === 'PENDING' && initiatedBy === 'TUTOR' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStudentRespondClick('ACCEPT')}
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleStudentRespondClick('REJECT')}
                      className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors"
                    >
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-sm p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Gia sư</p>
                <p className="text-sm font-semibold text-gray-900">{currentRequest.tutor?.full_name || 'Đang cập nhật'}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {currentRequest.initiatedBy === 'TUTOR'
                    ? (currentRequest.studentPost?.title || '—')
                    : (currentRequest.tutorPost?.title || '—')}
                </p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-sm p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Môn học</p>
                <p className="text-sm font-semibold text-gray-900">{currentRequest.subjectInfo?.name || 'Chưa rõ'}</p>
                <p className="text-xs text-gray-500 mt-0.5">Hình thức: {currentRequest.learningMode}</p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-sm p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Thời lượng buổi học</p>
                <p className="text-sm font-semibold text-gray-900">{currentRequest.sessionDuration} phút</p>
                {currentRequest.expectedPrice && (
                  <p className="text-xs text-gray-500 mt-0.5">Ngân sách: {formatCurrency(currentRequest.expectedPrice)}</p>
                )}
              </div>
            </div>

            {/* Removed status timeline cards per request */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Participants */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 md:p-7">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Thông tin tham gia
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student */}
                <div className="flex items-start gap-4 rounded-2xl border border-blue-100/70 bg-blue-50/50 p-4">
                  <div className="flex-shrink-0">
                    {currentRequest.student?.avatar_url ? (
                      <img
                        src={currentRequest.student.avatar_url}
                        alt={currentRequest.student.full_name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                        <UserIcon className="w-6 h-6 text-blue-600/80" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {currentRequest.student?.full_name || 'Học viên'}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                        Học viên
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Sẵn sàng trao đổi lịch học phù hợp.
                    </p>
                    {/* Intentionally hide direct contact details to prevent external contact */}
                  </div>
                </div>

                {/* Tutor */}
                <div className="flex items-start gap-4 rounded-2xl border border-emerald-100/70 bg-emerald-50/40 p-4">
                  <div className="flex-shrink-0">
                    {currentRequest.tutor?.avatar_url ? (
                      <img
                        src={currentRequest.tutor.avatar_url}
                        alt={currentRequest.tutor.full_name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-green-100/80 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                        <AcademicCapIcon className="w-6 h-6 text-green-600/80" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {currentRequest.tutor?.full_name || 'Gia sư'}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
                        Gia sư
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Đã nhận yêu cầu và sẽ liên hệ để trao đổi chi tiết.
                    </p>
                    {/* Intentionally hide tutor contact details to prevent external contact */}
                  </div>
                </div>
              </div>
            </div>

            {/* Message block: label follows who initiated the request */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 md:p-7">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {initiatedBy === 'TUTOR' ? 'Tin nhắn từ gia sư' : 'Tin nhắn từ học viên'}
              </h2>
              <div className="relative rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <span className="absolute -top-5 left-5 text-5xl text-blue-200 leading-none">“</span>
                <p className="text-blue-900 whitespace-pre-line text-base leading-7 pl-4">
                  {currentRequest.message}
                </p>
                <span className="absolute -bottom-7 right-6 text-5xl text-blue-200 leading-none">”</span>
              </div>
            </div>

            {/* Response - Hiển thị đúng người phản hồi dựa trên initiatedBy */}
            {currentRequest.tutorResponse && (
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 md:p-7">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {/* Nếu initiatedBy === 'TUTOR', thì tutorResponse là phản hồi từ học viên, ngược lại là từ gia sư */}
                  {initiatedBy === 'TUTOR' ? 'Phản hồi từ học viên' : 'Phản hồi từ gia sư'}
                </h2>

                <div
                  className={`rounded-2xl border-l-4 p-5 transition-all ${currentRequest.status === 'ACCEPTED'
                    ? 'bg-emerald-50/70 border-emerald-400'
                    : 'bg-rose-50/70 border-rose-400'
                    }`}
                >
                  <p
                    className={`mb-4 text-base leading-7 whitespace-pre-line ${currentRequest.status === 'ACCEPTED' ? 'text-emerald-900' : 'text-rose-900'
                      }`}
                  >
                    {currentRequest.tutorResponse.message}
                  </p>

                  {currentRequest.status === 'REJECTED' && currentRequest.tutorResponse.rejectionReason && (
                    <div className="text-sm text-rose-800 space-y-1">
                      <p className="font-semibold uppercase tracking-wide text-xs text-rose-500">
                        Lý do từ chối
                      </p>
                      <p>
                        {REJECTION_REASONS[currentRequest.tutorResponse.rejectionReason as keyof typeof REJECTION_REASONS]}
                      </p>
                    </div>
                  )}

                  {currentRequest.tutorResponse.counterOffer && (
                    <div className="mt-5 rounded-2xl border border-emerald-200 bg-white/90 p-5 shadow-sm">
                      <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-emerald-500" />
                        Đề xuất của gia sư
                      </h4>
                      <div className="space-y-3 text-sm text-emerald-800">
                        {currentRequest.tutorResponse.counterOffer.pricePerSession && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50">
                              <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="font-medium">
                              Giá: {formatCurrency(currentRequest.tutorResponse.counterOffer.pricePerSession)}
                            </span>
                          </div>
                        )}
                        {currentRequest.tutorResponse.counterOffer.sessionDuration && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50">
                              <ClockIcon className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span>
                              Thời lượng: {currentRequest.tutorResponse.counterOffer.sessionDuration} phút
                            </span>
                          </div>
                        )}
                        {currentRequest.tutorResponse.counterOffer.schedule && (
                          <div className="rounded-xl bg-emerald-50/80 p-3">
                            <strong className="block text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">
                              Lịch học
                            </strong>
                            <p>{currentRequest.tutorResponse.counterOffer.schedule}</p>
                          </div>
                        )}
                        {currentRequest.tutorResponse.counterOffer.conditions && (
                          <div className="rounded-xl bg-emerald-50/80 p-3">
                            <strong className="block text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">
                              Điều kiện
                            </strong>
                            <p>{currentRequest.tutorResponse.counterOffer.conditions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-3 italic">
                  Phản hồi lúc {formatDate(currentRequest.tutorResponse.acceptedAt || currentRequest.tutorResponse.rejectedAt || '')}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request Info */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">
                Thông tin yêu cầu
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-inner">
                    <AcademicCapIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Bài đăng
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {currentRequest.initiatedBy === 'TUTOR'
                        ? (currentRequest.studentPost?.title || '—')
                        : (currentRequest.tutorPost?.title || '—')}
                    </p>
                    {currentRequest.initiatedBy === 'TUTOR'
                      ? (currentRequest.studentPost?.content && (
                        <p className="text-xs text-gray-500 mt-1 leading-5">
                          {currentRequest.studentPost.content}
                        </p>
                      ))
                      : (currentRequest.tutorPost?.description && (
                        <p className="text-xs text-gray-500 mt-1 leading-5">
                          {currentRequest.tutorPost.description}
                        </p>
                      ))}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-inner">
                    <AcademicCapIcon className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Môn học
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {currentRequest.subjectInfo?.name || '—'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Hình thức: {currentRequest.learningMode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-inner">
                    <ClockIcon className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Thời lượng buổi học
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {currentRequest.sessionDuration} phút
                    </p>
                    {currentRequest.expectedPrice && (
                      <p className="text-xs text-gray-500 mt-1">
                        Ngân sách: {formatCurrency(currentRequest.expectedPrice)}
                      </p>
                    )}
                  </div>
                </div>

                {currentRequest.preferredSchedule && (
                  <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-inner">
                      <CalendarIcon className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Lịch học mong muốn
                      </p>
                      <p className="mt-2 rounded-xl bg-white/80 p-3 text-sm text-gray-700">
                        {currentRequest.preferredSchedule}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {currentRequest.status === 'ACCEPTED' && isStudent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-6 shadow-md"
              >
                <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_50%)]" />
                <div className="relative space-y-6">
                  <h4 className="font-semibold text-blue-900 text-lg mb-3 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Yêu cầu đã được chấp nhận!
                  </h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Yêu cầu của bạn đã được chấp nhận. Thông tin liên hệ được ẩn để đảm bảo an toàn. Hãy chờ lớp học được tạo để bắt đầu học.
                  </p>

                  <div className="mt-6 pt-4 border-t border-blue-100">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {currentRequest.tutor?.avatar_url ? (
                          <img
                            src={currentRequest.tutor.avatar_url}
                            alt={currentRequest.tutor.full_name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center ring-2 ring-white shadow-md">
                            <UserIcon className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {currentRequest.tutor?.full_name}
                        </p>
                        <p className="text-xs text-blue-600 mt-0.5">
                          Gia sư môn {currentRequest.subjectInfo?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {currentRequest.status === 'ACCEPTED' && !isStudent && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm">
                <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  {hasLearningClass ? 'Lớp học đã được tạo' : 'Bạn đã chấp nhận yêu cầu!'}
                </h4>
                <p className="text-sm text-emerald-800 mb-5">
                  {hasLearningClass
                    ? 'Bạn có thể xem và quản lý lớp học ngay bây giờ.'
                    : 'Vui lòng tạo lớp học để bắt đầu; thông tin liên hệ trực tiếp được ẩn để đảm bảo an toàn.'}
                </p>
                {!hasLearningClass ? (
                <div className="space-y-2">
                  <button
                    onClick={handleCreateClass}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-white text-emerald-600 rounded-2xl hover:bg-emerald-50 transition-colors border border-emerald-200 text-sm font-semibold shadow-sm"
                  >
                    Tạo lớp học
                  </button>
                </div>
                ) : (
                  <button
                    onClick={() => currentRequest.learningClass?.id && navigate(`/tutor/classes/${currentRequest.learningClass.id}`)}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors text-sm font-semibold shadow-sm"
                  >
                    Xem lớp học
                  </button>
                )}
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

        {/* Confirm Response Modal */}
        {pendingAction && (
          <ConfirmResponseModal
            isOpen={showConfirmModal}
            onClose={handleCloseConfirmModal}
            onConfirm={handleConfirmResponse}
            action={pendingAction}
            tutorName={currentRequest.tutor?.full_name}
            subjectName={currentRequest.subjectInfo?.name}
            isLoading={isResponding}
          />
        )}
      </div>
    </div>
  );
};

export default ContactRequestDetail;