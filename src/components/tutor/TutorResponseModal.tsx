import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

import { useContactRequestStore } from '../../store/contactRequest.store';
import type { ContactRequest, TutorResponseInput } from '../../types/contactRequest.types';
import { REJECTION_REASONS, SESSION_DURATIONS } from '../../types/contactRequest.types';
import { parseScheduleFromString } from '../../utils/scheduleParser';
import type { ParsedSchedule } from '../../utils/scheduleParser';

interface TutorResponseModalProps {
  request: ContactRequest;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData extends TutorResponseInput { }

const WEEKDAYS = [
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
  { value: 0, label: 'Chủ nhật' }
];

const TutorResponseModal: React.FC<TutorResponseModalProps> = ({
  request,
  onClose,
  onSuccess
}) => {
  const { respondToRequest, isResponding } = useContactRequestStore();
  const [responseType, setResponseType] = useState<'ACCEPT' | 'REJECT'>('ACCEPT');

  const tutorPost = (request as any).tutorPost ?? (request as any).tutorPostId;
  const isTutorInitiated = request?.initiatedBy === 'TUTOR';
  const isScheduleLocked = request?.initiatedBy === 'STUDENT';
  const DEFAULT_START_TIME = '19:00';
  const DEFAULT_END_TIME = '20:30';

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [scheduleTime, setScheduleTime] = useState<{ startTime: string; endTime: string }>(
    {
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
    }
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
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

  useEffect(() => {
    if (!request) return;

    const preferredParsed = request.preferredSchedule
      ? parseScheduleFromString(request.preferredSchedule)
      : { days: [] };

    const studentPost = (request as any).studentPost;
    const studentParsed = studentPost?.availability
      ? parseScheduleFromString(studentPost.availability)
      : { days: [] };

    const tutorSchedules = Array.isArray(tutorPost?.teachingSchedule)
      ? tutorPost.teachingSchedule
      : [];

    const tutorDays = tutorSchedules
      .map((schedule: any) => schedule?.dayOfWeek)
      .filter((day: any) => typeof day === 'number')
      .sort((a: number, b: number) => a - b);

    const firstTutorSlot =
      tutorSchedules.find((schedule: any) => schedule?.startTime && schedule?.endTime) ||
      tutorSchedules[0] ||
      undefined;

    const tutorFallbackStart = firstTutorSlot?.startTime || DEFAULT_START_TIME;
    const tutorFallbackEnd = firstTutorSlot?.endTime || DEFAULT_END_TIME;

    const studentSchedules = Array.isArray(studentPost?.teachingSchedule)
      ? studentPost.teachingSchedule
      : [];

    const studentDays = studentSchedules
      .map((schedule: any) => schedule?.dayOfWeek)
      .filter((day: any) => typeof day === 'number')
      .sort((a: number, b: number) => a - b);

    const firstStudentSlot =
      studentSchedules.find((schedule: any) => schedule?.startTime && schedule?.endTime) ||
      studentSchedules[0] ||
      undefined;

    const studentFallbackStart = firstStudentSlot?.startTime || DEFAULT_START_TIME;
    const studentFallbackEnd = firstStudentSlot?.endTime || DEFAULT_END_TIME;

    const hasScheduleData = (parsed: ParsedSchedule) =>
      (parsed.days && parsed.days.length > 0) || parsed.startTime || parsed.endTime;

    let initialSchedule: ParsedSchedule | null = null;

    if (isTutorInitiated) {
      if (hasScheduleData(preferredParsed)) {
        initialSchedule = preferredParsed;
      } else if (hasScheduleData(studentParsed)) {
        initialSchedule = studentParsed;
      } else if (studentDays.length > 0) {
        initialSchedule = {
          days: studentDays,
          startTime: firstStudentSlot?.startTime,
          endTime: firstStudentSlot?.endTime
        };
      }
    } else {
      if (tutorDays.length > 0) {
        initialSchedule = {
          days: tutorDays,
          startTime: firstTutorSlot?.startTime,
          endTime: firstTutorSlot?.endTime
        };
      } else if (hasScheduleData(preferredParsed)) {
        initialSchedule = preferredParsed;
      }
    }

    if (!initialSchedule) {
      initialSchedule = hasScheduleData(preferredParsed) ? preferredParsed : { days: [] };
    }

    const fallbackStart = isTutorInitiated ? studentFallbackStart : tutorFallbackStart;
    const fallbackEnd = isTutorInitiated ? studentFallbackEnd : tutorFallbackEnd;

    setSelectedDays(initialSchedule.days);
    const resolvedStart = initialSchedule.startTime || fallbackStart;
    const resolvedEnd = initialSchedule.endTime || fallbackEnd;

    setScheduleTime({
      startTime: resolvedStart,
      endTime: resolvedEnd,
    });

    const formatSchedule = (days: number[], start: string, end: string) => {
      if (days.length === 0) {
        return request.preferredSchedule?.trim() ?? `${start}-${end}`;
      }

      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const formattedDays = days
        .map((day) => dayNames[day] || '')
        .filter(Boolean)
        .join(', ');

      return formattedDays ? `${formattedDays} từ ${start}-${end}` : `${start}-${end}`;
    };

    if (initialSchedule.days.length > 0 || initialSchedule.startTime || initialSchedule.endTime || request.preferredSchedule) {
      setValue('counterOffer.schedule', formatSchedule(initialSchedule.days, resolvedStart, resolvedEnd));
    }
  }, [request, tutorPost, setValue, isScheduleLocked]);

  const schedulePreview = watch('counterOffer.schedule');

  const handleDayToggle = (day: number) => {
    if (isScheduleLocked) {
      return;
    }
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day].sort();
    setSelectedDays(newDays);
  };

  const trimmedPreferredSchedule = request.preferredSchedule?.trim() ?? '';
  const hasPreferredSchedule = Boolean(trimmedPreferredSchedule);

  // Format schedule to text when days or time changes
  useEffect(() => {
    if (responseType !== 'ACCEPT') {
      return;
    }

    if (isScheduleLocked) {
      // đã được thiết lập trong useEffect phía trên, không cho chỉnh sửa lại
      return;
    }

    if (selectedDays.length === 0) {
      if (hasPreferredSchedule) {
        setValue('counterOffer.schedule', trimmedPreferredSchedule);
      }
      return;
    }

    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const formattedDays = selectedDays
      .map((day) => dayNames[day] || '')
      .filter(Boolean)
      .join(', ');

    const start = scheduleTime.startTime || DEFAULT_START_TIME;
    const end = scheduleTime.endTime || DEFAULT_END_TIME;
    const formatted = formattedDays ? `${formattedDays} từ ${start}-${end}` : `${start}-${end}`;

    setValue('counterOffer.schedule', formatted);
  }, [selectedDays, scheduleTime, responseType, hasPreferredSchedule, trimmedPreferredSchedule, setValue, isScheduleLocked]);

  // Build defaults from tutorPost (preferred) or from request
  useEffect(() => {
    if (!request) return;

    const defaults: FormData = {
      action: 'ACCEPT',
      message: '',
      rejectionReason: undefined,
      counterOffer: {
        pricePerSession: tutorPost?.pricePerSession ?? request.expectedPrice ?? undefined,
        sessionDuration: tutorPost?.sessionDuration ?? request.sessionDuration ?? undefined,
        schedule: '', // Will be auto-filled by above useEffect
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
                  className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-colors ${responseType === 'ACCEPT'
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
                  className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-colors ${responseType === 'REJECT'
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
                {(!isScheduleLocked || schedulePreview || trimmedPreferredSchedule) && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                      <CalendarIcon className="w-5 h-5" />
                      <span>Lịch học đề xuất</span>
                    </h4>

                    {/* Days of Week */}
                    {!isScheduleLocked && (
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
                              className={`p-2 text-sm border rounded-lg transition-colors ${selectedDays.includes(day.value)
                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                        {!isScheduleLocked && selectedDays.length === 0 && !hasPreferredSchedule && (
                          <p className="mt-1 text-sm text-red-600">Vui lòng chọn ít nhất 1 ngày</p>
                        )}
                      </div>
                    )}

                    {isScheduleLocked && (
                      <p className="mt-1 text-xs text-gray-500">
                        Lịch học được cố định theo bài đăng bạn đã thiết lập.
                      </p>
                    )}

                    {/* Time */}
                    {!isScheduleLocked && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>Giờ bắt đầu *</span>
                          </label>
                          <input
                            type="time"
                            value={scheduleTime.startTime}
                            onChange={(e) => setScheduleTime({ ...scheduleTime, startTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus-border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>Giờ kết thúc *</span>
                          </label>
                          <input
                            type="time"
                            value={scheduleTime.endTime}
                            onChange={(e) => setScheduleTime({ ...scheduleTime, endTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus-border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    {/* Preview */}
                    {(selectedDays.length > 0 || schedulePreview || trimmedPreferredSchedule) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Lịch học: </span>
                          {schedulePreview || trimmedPreferredSchedule || 'Chưa có lịch học'}
                        </p>
                      </div>
                    )}

                    {/* Hidden input for form submission */}
                    <input
                      type="hidden"
                      {...register('counterOffer.schedule')}
                    />
                  </div>
                )}
                {isScheduleLocked && !(schedulePreview || trimmedPreferredSchedule) && (
                  <input
                    type="hidden"
                    {...register('counterOffer.schedule')}
                  />
                )}

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
                className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${responseType === 'ACCEPT'
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