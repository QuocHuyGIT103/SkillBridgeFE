import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

import { useContactRequestStore } from '../../store/contactRequest.store';
import type { ContactRequest, TutorResponseInput } from '../../types/contactRequest.types';
import { REJECTION_REASONS, SESSION_DURATIONS } from '../../types/contactRequest.types';

interface TutorResponseModalProps {
  request: ContactRequest;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData extends TutorResponseInput {}

const TutorResponseModal: React.FC<TutorResponseModalProps> = ({
  request,
  onClose,
  onSuccess
}) => {
  const { respondToRequest, isResponding } = useContactRequestStore();
  const [responseType, setResponseType] = useState<'ACCEPT' | 'REJECT'>('ACCEPT');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      action: 'ACCEPT',
      message: '',
      counterOffer: {
        pricePerSession: undefined,
        sessionDuration: undefined,
        schedule: '',
        conditions: ''
      }
    }
  });

  // Build defaults from tutorPost (preferred) or from request
  useEffect(() => {
    if (!request) return;

    // normalize tutorPost (backend trả populate vào tutorPostId)
    const tutorPost = (request as any).tutorPost ?? (request as any).tutorPostId;

    const defaults: FormData = {
      action: 'ACCEPT',
      message: '',
      rejectionReason: undefined,
      counterOffer: {
        pricePerSession: tutorPost?.pricePerSession ?? request.expectedPrice ?? undefined,
        sessionDuration: tutorPost?.sessionDuration ?? request.sessionDuration ?? undefined,
        schedule: tutorPost?.schedule ?? request.preferredSchedule ?? '',
        conditions: tutorPost?.conditions ?? ''
      }
    };

    if (request.tutorResponse) {
      if (('action' in request.tutorResponse && (request.tutorResponse as any).action === 'REJECT') || request.tutorResponse.rejectedAt) {
        setResponseType('REJECT');
        defaults.message = request.tutorResponse.message || '';
        const rr = request.tutorResponse.rejectionReason as string | undefined;
        if (rr && rr in REJECTION_REASONS) {
          defaults.rejectionReason = rr as any;
        } else {
          defaults.rejectionReason = undefined;
        }
        defaults.counterOffer = request.tutorResponse.counterOffer || defaults.counterOffer;
      } else {
        setResponseType('ACCEPT');
        defaults.message = request.tutorResponse.message || '';
        defaults.counterOffer = request.tutorResponse.counterOffer || defaults.counterOffer;
      }
    } else {
      setResponseType('ACCEPT');
    }

    reset(defaults);
  }, [request, reset]);

  const watchAction = watch('action');

  const onSubmit = async (data: FormData) => {
    try {
      // Ensure action reflects UI selection (responseType)
      await respondToRequest(request.id, {
        ...data,
        action: responseType,
        // ensure numeric fields are numbers
        counterOffer: data.counterOffer ? {
          ...data.counterOffer,
          pricePerSession: data.counterOffer.pricePerSession ? Number(data.counterOffer.pricePerSession) : undefined,
          sessionDuration: data.counterOffer.sessionDuration ? Number(data.counterOffer.sessionDuration) : undefined
        } : undefined
      });
      onSuccess();
    } catch (error) {
      // Error handled in store
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Phản hồi yêu cầu học tập
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Student message only (kept per request) */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Tin nhắn từ học viên</h4>
            <div className="text-sm text-gray-800 bg-white rounded p-3 whitespace-pre-wrap">
              {request.message ?? '—'}
            </div>
          </div>
 
          {/* Response Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Response Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quyết định của bạn
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setResponseType('ACCEPT')}
                  className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-colors ${
                    responseType === 'ACCEPT'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="font-medium">Chấp nhận</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setResponseType('REJECT')}
                  className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-colors ${
                    responseType === 'REJECT'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <XCircleIcon className="w-5 h-5" />
                  <span className="font-medium">Từ chối</span>
                </button>
              </div>
            </div>

            {/* Response Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tin nhắn phản hồi
              </label>
              <textarea
                {...register('message', {
                  required: 'Vui lòng nhập tin nhắn phản hồi',
                  maxLength: {
                    value: 1000,
                    message: 'Tin nhắn không được vượt quá 1000 ký tự'
                  }
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={
                  responseType === 'ACCEPT'
                    ? "Chào em! Thầy rất vui khi nhận được yêu cầu học từ em..."
                    : "Chào em! Cảm ơn em đã quan tâm đến bài đăng của thầy..."
                }
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
              )}
            </div>

            {/* Rejection Reason */}
            {responseType === 'REJECT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do từ chối
                </label>
                <select
                  {...register('rejectionReason', {
                    required: responseType === 'REJECT' ? 'Vui lòng chọn lý do từ chối' : false
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn lý do</option>
                  {Object.entries(REJECTION_REASONS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.rejectionReason && (
                  <p className="mt-1 text-sm text-red-600">{errors.rejectionReason.message}</p>
                )}
              </div>
            )}

            {/* Counter Offer */}
            {responseType === 'ACCEPT' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Đề xuất của bạn (mặc định từ bài đăng của bạn, có thể chỉnh sửa)
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  Giá trị mặc định được lấy từ bài đăng của bạn (không thể chọn bài khác). Bạn vẫn có thể chỉnh sửa các trường trước khi gửi phản hồi.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá/buổi (VNĐ)
                    </label>
                    <input
                      {...register('counterOffer.pricePerSession', {
                        min: {
                          value: 50000,
                          message: 'Giá tối thiểu là 50,000 VNĐ'
                        },
                        max: {
                          value: 10000000,
                          message: 'Giá tối đa là 10,000,000 VNĐ'
                        }
                      })}
                      type="number"
                      step="10000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.counterOffer?.pricePerSession && (
                      <p className="mt-1 text-sm text-red-600">{errors.counterOffer.pricePerSession.message}</p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời lượng buổi học
                    </label>
                    <select
                      {...register('counterOffer.sessionDuration')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {SESSION_DURATIONS.map((duration) => (
                        <option key={duration.value} value={duration.value}>
                          {duration.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lịch học đề xuất
                  </label>
                  <textarea
                    {...register('counterOffer.schedule')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Ví dụ: Thứ 2, 4, 6 từ 19:00-20:30"
                  />
                </div>

                {/* Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điều kiện và ghi chú
                  </label>
                  <textarea
                    {...register('counterOffer.conditions')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Các điều kiện, yêu cầu chuẩn bị, ghi chú khác..."
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isResponding}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isResponding}
                className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  responseType === 'ACCEPT'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                } focus:ring-2 focus:ring-offset-2`}
              >
                {isResponding ? 'Đang xử lý...' : (responseType === 'ACCEPT' ? 'Chấp nhận' : 'Từ chối')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TutorResponseModal;