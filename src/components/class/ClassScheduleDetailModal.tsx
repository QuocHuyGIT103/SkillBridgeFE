import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  VideoCameraIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useClassStore } from '../../store/class.store';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ClassScheduleDetailModalProps {
  classId: string;
  onClose: () => void;
}

const ClassScheduleDetailModal: React.FC<ClassScheduleDetailModalProps> = ({
  classId,
  onClose,
}) => {
  const { currentSchedule, loading, fetchClassSchedule, clearCurrentSchedule } = useClassStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchClassSchedule(classId);
    
    return () => {
      clearCurrentSchedule();
    };
  }, [classId, fetchClassSchedule, clearCurrentSchedule]);

  if (loading || !currentSchedule) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải lịch học...</p>
        </div>
      </div>
    );
  }

  const { class: classData, sessions, stats } = currentSchedule;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'MISSED':
        return <MinusCircleIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'MISSED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'MISSED':
        return 'Vắng mặt';
      default:
        return 'Đã lên lịch';
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayOfWeek];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{classData.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {classData.subject.name} • {classData.learningMode === 'ONLINE' ? 'Trực tuyến' : 'Trực tiếp'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Tổng buổi', value: stats.total, color: 'blue' },
              { label: 'Đã hoàn thành', value: stats.completed, color: 'green' },
              { label: 'Đã lên lịch', value: stats.scheduled, color: 'blue' },
              { label: 'Đã hủy', value: stats.cancelled, color: 'red' },
              { label: 'Vắng mặt', value: stats.missed, color: 'orange' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`p-4 rounded-lg bg-${stat.color}-50 border border-${stat.color}-200`}
              >
                <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Schedule Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">📅 Ngày học</p>
                <p className="font-medium text-gray-900">
                  {classData.schedule.dayOfWeek.map(d => getDayName(d)).join(', ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">🕐 Giờ học</p>
                <p className="font-medium text-gray-900">
                  {classData.schedule.startTime} - {classData.schedule.endTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">⏱️ Thời lượng</p>
                <p className="font-medium text-gray-900">
                  {classData.sessionDuration} phút/buổi
                </p>
              </div>
            </div>
          </div>

          {/* Location/Meeting Info */}
          {classData.learningMode === 'ONLINE' && classData.onlineInfo && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <VideoCameraIcon className="w-5 h-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-2">Thông tin lớp online</p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-600">Link: </span>
                      <a
                        href={classData.onlineInfo.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {classData.onlineInfo.meetingLink}
                      </a>
                    </p>
                    {classData.onlineInfo.meetingId && (
                      <p>
                        <span className="text-gray-600">Meeting ID: </span>
                        <span className="font-mono">{classData.onlineInfo.meetingId}</span>
                      </p>
                    )}
                    {classData.onlineInfo.password && (
                      <p>
                        <span className="text-gray-600">Password: </span>
                        <span className="font-mono">{classData.onlineInfo.password}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {classData.learningMode === 'OFFLINE' && classData.location && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900 mb-1">Địa điểm học</p>
                  <p className="text-sm text-gray-700">{classData.location.address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sessions List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarDaysIcon className="w-5 h-5 mr-2" />
              Danh sách buổi học ({sessions.length} buổi)
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sessions.map((session: any) => (
                <motion.div
                  key={session.sessionNumber}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(session.status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          Buổi {session.sessionNumber}/{stats.total}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(session.scheduledDate), 'EEEE, dd/MM/yyyy', { locale: vi })}
                          {' • '}
                          {classData.schedule.startTime} - {classData.schedule.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {getStatusText(session.status)}
                      </span>
                      
                      {session.isUpcoming && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Sắp tới
                        </span>
                      )}
                    </div>
                  </div>

                  {session.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Ghi chú: </span>
                        {session.notes}
                      </p>
                    </div>
                  )}

                  {session.homework && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Bài tập: </span>
                        {session.homework}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ClassScheduleDetailModal;
