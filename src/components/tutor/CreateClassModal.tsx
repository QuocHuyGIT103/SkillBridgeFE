import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

import { useContactRequestStore } from '../../store/contactRequest.store';
import type { ContactRequest, CreateLearningClassInput } from '../../types/contactRequest.types';
import { ONLINE_PLATFORMS } from '../../types/contactRequest.types';

interface CreateClassModalProps {
  request: ContactRequest;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData extends CreateLearningClassInput {}

const WEEKDAYS = [
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
  { value: 0, label: 'Chủ nhật' }
];

const CreateClassModal: React.FC<CreateClassModalProps> = ({
  request,
  onClose,
  onSuccess
}) => {
  const { createLearningClass, isCreatingClass } = useContactRequestStore();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [learningMode, setLearningMode] = useState<'ONLINE' | 'OFFLINE'>(
    request.learningMode === 'FLEXIBLE' ? 'ONLINE' : request.learningMode as 'ONLINE' | 'OFFLINE'
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      contactRequestId: request.id,
      title: `Lớp ${request.subjectInfo?.name} - ${request.student?.full_name}`,
      description: '',
      totalSessions: 10,
      schedule: {
        dayOfWeek: [],
        startTime: '19:00',
        endTime: '20:30'
      },
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
      location: learningMode === 'OFFLINE' ? {
        address: ''
      } : undefined,
      onlineInfo: learningMode === 'ONLINE' ? {
        platform: 'ZOOM',
        meetingLink: '',
        meetingId: '',
        password: ''
      } : undefined
    }
  });

  const watchStartTime = watch('schedule.startTime');
  const watchEndTime = watch('schedule.endTime');

  const handleDayToggle = (day: number) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day].sort();
    
    setSelectedDays(newDays);
    setValue('schedule.dayOfWeek', newDays);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const classData: CreateLearningClassInput = {
        ...data,
        schedule: {
          ...data.schedule,
          dayOfWeek: selectedDays
        }
      };

      if (learningMode === 'OFFLINE') {
        delete classData.onlineInfo;
      } else {
        delete classData.location;
      }

      await createLearningClass(classData);
      onSuccess();
    } catch (error) {
      // Error handled in store
    }
  };

  const calculateEndDate = () => {
    if (selectedDays.length === 0 || !watch('totalSessions') || !watch('startDate')) {
      return null;
    }

    const startDate = new Date(watch('startDate'));
    const totalSessions = watch('totalSessions');
    const sessionsPerWeek = selectedDays.length;
    const totalWeeks = Math.ceil(totalSessions / sessionsPerWeek);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (totalWeeks * 7));
    
    return endDate.toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const totalAmount = (watch('totalSessions') || 0) * (request.tutorPost?.pricePerSession || 0);

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
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Tạo lớp học mới
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Request Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-3">Thông tin yêu cầu</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Học viên:</span>
                <span className="ml-2 font-medium text-blue-900">{request.student?.full_name}</span>
              </div>
              <div>
                <span className="text-blue-700">Môn học:</span>
                <span className="ml-2 font-medium text-blue-900">{request.subjectInfo?.name}</span>
              </div>
              <div>
                <span className="text-blue-700">Giá/buổi:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {formatCurrency(request.tutorPost?.pricePerSession || 0)}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Thời lượng:</span>
                <span className="ml-2 font-medium text-blue-900">{request.sessionDuration} phút</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên lớp học *
                </label>
                <input
                  {...register('title', {
                    required: 'Vui lòng nhập tên lớp học',
                    minLength: {
                      value: 5,
                      message: 'Tên lớp học phải có ít nhất 5 ký tự'
                    },
                    maxLength: {
                      value: 200,
                      message: 'Tên lớp học không được vượt quá 200 ký tự'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng số buổi học *
                </label>
                <input
                  {...register('totalSessions', {
                    required: 'Vui lòng nhập số buổi học',
                    min: {
                      value: 1,
                      message: 'Số buổi học tối thiểu là 1'
                    },
                    max: {
                      value: 100,
                      message: 'Số buổi học tối đa là 100'
                    }
                  })}
                  type="number"
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.totalSessions && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalSessions.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả lớp học
              </label>
              <textarea
                {...register('description', {
                  maxLength: {
                    value: 1000,
                    message: 'Mô tả không được vượt quá 1000 ký tự'
                  }
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Mô tả về nội dung, mục tiêu, phương pháp giảng dạy..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Learning Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Hình thức học *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setLearningMode('ONLINE')}
                  className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-colors ${
                    learningMode === 'ONLINE'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <VideoCameraIcon className="w-5 h-5" />
                  <span className="font-medium">Online</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setLearningMode('OFFLINE')}
                  className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-colors ${
                    learningMode === 'OFFLINE'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <MapPinIcon className="w-5 h-5" />
                  <span className="font-medium">Trực tiếp</span>
                </button>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <span>Lịch học</span>
              </h4>

              {/* Days of Week */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày trong tuần *
                </label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`p-2 text-sm border rounded-lg transition-colors ${
                        selectedDays.includes(day.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {selectedDays.length === 0 && (
                  <p className="mt-1 text-sm text-red-600">Vui lòng chọn ít nhất 1 ngày</p>
                )}
              </div>

              {/* Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ bắt đầu *
                  </label>
                  <input
                    {...register('schedule.startTime', {
                      required: 'Vui lòng chọn giờ bắt đầu'
                    })}
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.schedule?.startTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.schedule.startTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ kết thúc *
                  </label>
                  <input
                    {...register('schedule.endTime', {
                      required: 'Vui lòng chọn giờ kết thúc',
                      validate: (value) => {
                        if (value <= watchStartTime) {
                          return 'Giờ kết thúc phải sau giờ bắt đầu';
                        }
                        return true;
                      }
                    })}
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.schedule?.endTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.schedule.endTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu *
                  </label>
                  <input
                    {...register('startDate', {
                      required: 'Vui lòng chọn ngày bắt đầu',
                      validate: (value) => {
                        const selectedDate = new Date(value);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        if (selectedDate < today) {
                          return 'Ngày bắt đầu không được trong quá khứ';
                        }
                        return true;
                      }
                    })}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>
              </div>

              {/* Estimated End Date */}
              {calculateEndDate() && (
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Dự kiến kết thúc: <span className="font-medium">{calculateEndDate()}</span>
                  {selectedDays.length > 0 && (
                    <span className="ml-2">
                      ({selectedDays.length} buổi/tuần)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Location/Online Info */}
            {learningMode === 'OFFLINE' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ học *
                </label>
                <input
                  {...register('location.address', {
                    required: 'Vui lòng nhập địa chỉ học'
                  })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Nguyễn Văn A, Phường B, Quận C, TP.HCM"
                />
                {errors.location?.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Thông tin học online
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nền tảng
                    </label>
                    <select
                      {...register('onlineInfo.platform')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {ONLINE_PLATFORMS.map((platform) => (
                        <option key={platform.value} value={platform.value}>
                          {platform.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting ID
                    </label>
                    <input
                      {...register('onlineInfo.meetingId')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123-456-7890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link meeting
                  </label>
                  <input
                    {...register('onlineInfo.meetingLink')}
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://zoom.us/j/123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu meeting
                  </label>
                  <input
                    {...register('onlineInfo.password')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="password123"
                  />
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-3">Tóm tắt lớp học</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700">Tổng số buổi:</span>
                  <span className="ml-2 font-medium text-green-900">{watch('totalSessions')} buổi</span>
                </div>
                <div>
                  <span className="text-green-700">Tổng học phí:</span>
                  <span className="ml-2 font-medium text-green-900">{formatCurrency(totalAmount)}</span>
                </div>
                <div>
                  <span className="text-green-700">Ngày trong tuần:</span>
                  <span className="ml-2 font-medium text-green-900">
                    {selectedDays.length} ngày/tuần
                  </span>
                </div>
                <div>
                  <span className="text-green-700">Thời gian:</span>
                  <span className="ml-2 font-medium text-green-900">
                    {watchStartTime} - {watchEndTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isCreatingClass}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isCreatingClass || selectedDays.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreatingClass ? 'Đang tạo...' : 'Tạo lớp học'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateClassModal;