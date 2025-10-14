import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

import { useContactRequestStore } from '../../store/contactRequest.store';
import { useSubjectStore } from '../../store/subject.store';
import { useAuthStore } from '../../store/auth.store';
import type { CreateContactRequestInput } from '../../types/contactRequest.types';
import { 
  LEARNING_MODES, 
  SESSION_DURATIONS, 
  CONTACT_METHODS 
} from '../../types/contactRequest.types';

import type { TutorPost } from '../../services/tutorPost.service';


interface ContactRequestFormProps {
  tutorPost: TutorPost;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData extends Omit<CreateContactRequestInput, 'tutorPostId'> {}

const ContactRequestForm: React.FC<ContactRequestFormProps> = ({
  tutorPost,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuthStore();
  const { createContactRequest, isCreating } = useContactRequestStore();
  const { activeSubjects, getActiveSubjects } = useSubjectStore();
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      subject: '',
      message: '',
      preferredSchedule: '',
      expectedPrice: tutorPost.pricePerSession,
      sessionDuration: tutorPost.sessionDuration,
      learningMode: 'FLEXIBLE',
      studentContact: {
        phone: user?.phone_number || '',
        email: user?.email || '',
        preferredContactMethod: 'both'
      }
    }
  });

  useEffect(() => {
    // Chỉ gọi API nếu trong store chưa có danh sách môn học
    if (activeSubjects.length === 0) {
      getActiveSubjects(); // Tên action có thể khác, ví dụ: fetchActiveSubjects
    }
  }, [activeSubjects.length, getActiveSubjects]);

  // Filter subjects that tutor teaches
  const availableSubjects = activeSubjects.filter(subject => 
    (Array.isArray(tutorPost.subjects)
      ? tutorPost.subjects.map(s => typeof s === 'string' ? s : s._id).includes(subject._id)
      : false)
  );

  useEffect(() => {
    if (availableSubjects.length === 1) {
      setValue('subject', availableSubjects[0]._id);
      setSelectedSubject(availableSubjects[0]._id);
    }
  }, [availableSubjects, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      await createContactRequest({
        ...data,
        tutorPostId: tutorPost._id ?? ''
      });
      
      onSuccess?.();
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

  // ✅ Fix: Get tutor name properly
  const tutorName = tutorPost.tutorId?.full_name || 'Gia sư';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Gửi yêu cầu học tập
        </h3>
        <p className="text-gray-600">
          Gửi yêu cầu đến <span className="font-medium">{tutorName}</span> cho bài đăng "{tutorPost.title}"
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Môn học muốn học *
          </label>
          <select
            {...register('subject', { required: 'Vui lòng chọn môn học' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Chọn môn học</option>
            {availableSubjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tin nhắn gửi đến gia sư *
          </label>
          <textarea
            {...register('message', {
              required: 'Vui lòng nhập tin nhắn',
              minLength: {
                value: 10,
                message: 'Tin nhắn phải có ít nhất 10 ký tự'
              },
              maxLength: {
                value: 1000,
                message: 'Tin nhắn không được vượt quá 1000 ký tự'
              }
            })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Xin chào thầy/cô! Em là học sinh lớp 12, hiện tại em đang gặp khó khăn với môn Toán..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
          <div className="mt-1 text-xs text-gray-500 text-right">
            {watch('message')?.length || 0}/1000
          </div>
        </div>

        {/* Learning Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình thức học *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {LEARNING_MODES.map((mode) => (
              <label
                key={mode.value}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <input
                  {...register('learningMode', { required: 'Vui lòng chọn hình thức học' })}
                  type="radio"
                  value={mode.value}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">{mode.label}</span>
              </label>
            ))}
          </div>
          {errors.learningMode && (
            <p className="mt-1 text-sm text-red-600">{errors.learningMode.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expected Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
              Giá mong muốn (VNĐ/buổi)
            </label>
            <input
              {...register('expectedPrice', {
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
              min="50000"
              max="10000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="200000"
            />
            {errors.expectedPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.expectedPrice.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Giá đăng: {formatCurrency(tutorPost.pricePerSession)}
            </p>
          </div>

          {/* Session Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              Thời lượng buổi học
            </label>
            <select
              {...register('sessionDuration')}
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

        {/* Preferred Schedule */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lịch học mong muốn
          </label>
          <textarea
            {...register('preferredSchedule', {
              maxLength: {
                value: 500,
                message: 'Lịch học không được vượt quá 500 ký tự'
              }
            })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Ví dụ: Thứ 2, 4, 6 từ 19:00-21:00. Cuối tuần từ 14:00-16:00"
          />
          {errors.preferredSchedule && (
            <p className="mt-1 text-sm text-red-600">{errors.preferredSchedule.message}</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Thông tin liên hệ</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="w-4 h-4 inline mr-1" />
                Số điện thoại
              </label>
              <input
                {...register('studentContact.phone', {
                  pattern: {
                    value: /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
                    message: 'Số điện thoại không hợp lệ'
                  }
                })}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0987654321"
              />
              {errors.studentContact?.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.studentContact.phone.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                {...register('studentContact.email', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email không hợp lệ'
                  }
                })}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="student@example.com"
              />
              {errors.studentContact?.email && (
                <p className="mt-1 text-sm text-red-600">{errors.studentContact.email.message}</p>
              )}
            </div>
          </div>

          {/* Preferred Contact Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phương thức liên hệ ưu tiên
            </label>
            <div className="flex space-x-4">
              {CONTACT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className="flex items-center"
                >
                  <input
                    {...register('studentContact.preferredContactMethod')}
                    type="radio"
                    value={method.value}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{method.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={isCreating}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            <span>{isCreating ? 'Đang gửi...' : 'Gửi yêu cầu'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ContactRequestForm;