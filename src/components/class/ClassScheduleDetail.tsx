import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  VideoCameraIcon,
  MapPinIcon,
  DocumentTextIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useClassStore } from '../../store/class.store';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import HomeworkModal from '../modals/HomeworkModal';
import CancelSessionModal from '../modals/CancelSessionModal';
import { attendanceService } from '../../services/attendance.service';
import type { WeeklySession } from '../../types/attendance';
import toast from 'react-hot-toast';

interface ClassScheduleDetailProps {
  classId: string;
  userRole: 'TUTOR' | 'STUDENT';
}

const ClassScheduleDetail: React.FC<ClassScheduleDetailProps> = ({
  classId,
  userRole,
}) => {
  const { currentSchedule, loading, fetchClassSchedule, clearCurrentSchedule } = useClassStore();
  const [selectedSession, setSelectedSession] = useState<WeeklySession | null>(null);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [cancellingSession, setCancellingSession] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState<any>(null);

  useEffect(() => {
    fetchClassSchedule(classId);

    return () => {
      clearCurrentSchedule();
    };
  }, [classId, fetchClassSchedule, clearCurrentSchedule]);

  if (loading || !currentSchedule) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="ml-4 text-gray-600">Đang tải lịch học...</p>
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

  const handleOpenHomework = (session: any) => {
    // Convert session from class schedule to WeeklySession format
    const weeklySession: WeeklySession = {
      classId: classData._id,
      className: classData.subject.name,
      sessionNumber: session.sessionNumber,
      scheduledDate: session.scheduledDate,
      dayOfWeek: new Date(session.scheduledDate).getDay(),
      timeSlot: `${classData.schedule.startTime} - ${classData.schedule.endTime}`,
      duration: classData.sessionDuration,
      status: session.status,
      learningMode: classData.learningMode,
      meetingLink: classData.onlineInfo?.meetingLink,
      location: classData.location ? {
        type: 'address',
        details: classData.location.address
      } : undefined,
      attendance: session.attendance || {
        tutorAttended: false,
        studentAttended: false,
      },
      homework: {
        hasAssignment: !!session.homework?.assignment,
        hasSubmission: !!session.homework?.submission,
        hasGrade: !!session.homework?.grade,
        isLate: session.homework?.submission && session.homework?.assignment
          ? new Date(session.homework.submission.submittedAt) > new Date(session.homework.assignment.deadline)
          : false,
        assignment: session.homework?.assignment,
        submission: session.homework?.submission,
        grade: session.homework?.grade,
      },
      canAttend: false,
      canJoin: session.attendance?.tutorAttended && session.attendance?.studentAttended,
      tutor: {
        _id: classData.tutorId.id,
        full_name: classData.tutorId.full_name,
        avatar_url: classData.tutorId.avatar_url,
      },
      student: {
        _id: classData.studentId.id,
        full_name: classData.studentId.full_name,
        avatar_url: classData.studentId.avatar_url,
      },
    };

    setSelectedSession(weeklySession);
    setShowHomeworkModal(true);
  };

  const handleCloseHomework = () => {
    setShowHomeworkModal(false);
    setSelectedSession(null);
  };

  const handleHomeworkSuccess = async () => {
    await fetchClassSchedule(classId); // Refresh schedule
  };

  const handleRequestCancelSession = (session: any) => {
    setSessionToCancel(session);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!sessionToCancel) return;

    setCancellingSession(sessionToCancel.sessionNumber);
    try {
      await attendanceService.requestCancelSession(classId, sessionToCancel.sessionNumber, reason);
      toast.success('Yêu cầu huỷ buổi học đã được gửi. Đang chờ phê duyệt.');
      setShowCancelModal(false);
      setSessionToCancel(null);
      await fetchClassSchedule(classId); // Refresh
    } catch (error: any) {
      console.error('Request cancel session failed:', error);
      toast.error(error.response?.data?.message || 'Gửi yêu cầu huỷ buổi học thất bại');
    } finally {
      setCancellingSession(null);
    }
  };

  const handleRespondToCancellation = async (
    sessionNumber: number,
    action: 'APPROVE' | 'REJECT'
  ) => {
    const message = action === 'APPROVE'
      ? 'Bạn có chắc chắn muốn chấp nhận huỷ buổi học này?'
      : 'Bạn có chắc chắn muốn từ chối yêu cầu huỷ buổi học?';

    if (!window.confirm(message)) {
      return;
    }

    setCancellingSession(sessionNumber);
    try {
      await attendanceService.respondToCancellationRequest(classId, sessionNumber, action);
      toast.success(
        action === 'APPROVE'
          ? 'Đã chấp nhận huỷ buổi học'
          : 'Đã từ chối yêu cầu huỷ buổi học'
      );
      await fetchClassSchedule(classId); // Refresh
    } catch (error: any) {
      console.error('Respond to cancellation failed:', error);
      toast.error(error.response?.data?.message || 'Phản hồi yêu cầu huỷ thất bại');
    } finally {
      setCancellingSession(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{classData.title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {classData.subject.name} • {classData.learningMode === 'ONLINE' ? 'Trực tuyến' : 'Trực tiếp'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
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
                <p className="font-medium text-gray-900 mb-2">Google Meet - Học trực tuyến</p>
                <div className="space-y-2 text-sm">
                  <a
                    href={classData.onlineInfo.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <VideoCameraIcon className="w-4 h-4 mr-2" />
                    Tham gia lớp học
                  </a>
                  <p className="text-gray-600 mt-2">
                    💡 Click để mở Google Meet và tham gia phòng học
                  </p>
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

          <div className="space-y-3">
            {sessions.map((session: any) => (
              <motion.div
                key={session.sessionNumber}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
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

                {/* Homework Badges */}
                {session.homework && (session.homework.assignment || session.homework.submission || session.homework.grade) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {session.homework.assignment && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        📝 Có bài tập
                      </span>
                    )}
                    {session.homework.submission && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        ✅ Đã nộp
                      </span>
                    )}
                    {session.homework.grade && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        ⭐ Điểm: {session.homework.grade.score}/10
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                  {/* Homework Button - Show after both attended or completed */}
                  {(session.status === 'COMPLETED' ||
                    (session.attendance?.tutorAttended && session.attendance?.studentAttended)) && (
                      <button
                        onClick={() => handleOpenHomework(session)}
                        className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>
                          {userRole === 'TUTOR'
                            ? session.homework?.assignment
                              ? 'Quản lý bài tập'
                              : 'Giao bài tập'
                            : session.homework?.assignment
                              ? 'Xem bài tập'
                              : 'Chưa có bài tập'}
                        </span>
                      </button>
                    )}

                  {/* Cancel Request Button - For scheduled sessions */}
                  {session.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleRequestCancelSession(session)}
                      disabled={cancellingSession === session.sessionNumber}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      {cancellingSession === session.sessionNumber ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <>
                          <TrashIcon className="w-4 h-4" />
                          <span>Yêu cầu huỷ</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Pending Cancellation - Show approval/reject buttons */}
                  {session.status === 'PENDING_CANCELLATION' && session.cancellationRequest && (
                    <div className="flex-1">
                      {session.cancellationRequest.requestedBy === userRole ? (
                        // User who requested cancellation
                        <div className="text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg">
                          ⏳ Đang chờ phê duyệt yêu cầu huỷ buổi học
                        </div>
                      ) : (
                        // Other party - show approve/reject buttons
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRespondToCancellation(session.sessionNumber, 'APPROVE')}
                            disabled={cancellingSession === session.sessionNumber}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            ✓ Chấp nhận
                          </button>
                          <button
                            onClick={() => handleRespondToCancellation(session.sessionNumber, 'REJECT')}
                            disabled={cancellingSession === session.sessionNumber}
                            className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            ✗ Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cancellation Request Info */}
                {session.status === 'PENDING_CANCELLATION' && session.cancellationRequest && (
                  <div className="mt-3 pt-3 border-t border-gray-100 bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-orange-900 mb-1">
                      Lý do huỷ buổi học:
                    </p>
                    <p className="text-sm text-orange-800">
                      {session.cancellationRequest.reason}
                    </p>
                    <p className="text-xs text-orange-600 mt-2">
                      Yêu cầu bởi: {session.cancellationRequest.requestedBy === 'TUTOR' ? 'Gia sư' : 'Học viên'}
                      {' • '}
                      {format(new Date(session.cancellationRequest.requestedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </p>
                  </div>
                )}

                {session.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Ghi chú: </span>
                      {session.notes}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Homework Modal */}
      <AnimatePresence>
        {showHomeworkModal && selectedSession && (
          <HomeworkModal
            session={selectedSession}
            userRole={userRole}
            onClose={handleCloseHomework}
            onSuccess={handleHomeworkSuccess}
          />
        )}
      </AnimatePresence>

      {/* Cancel Session Modal */}
      {sessionToCancel && (
        <CancelSessionModal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setSessionToCancel(null);
          }}
          onConfirm={handleConfirmCancel}
          sessionInfo={{
            sessionNumber: sessionToCancel.sessionNumber,
            date: format(new Date(sessionToCancel.scheduledDate), 'EEEE, dd/MM/yyyy', { locale: vi }),
            time: `${format(new Date(sessionToCancel.scheduledDate), 'HH:mm')} - ${format(
              new Date(new Date(sessionToCancel.scheduledDate).getTime() + sessionToCancel.duration * 60000),
              'HH:mm'
            )}`,
          }}
          isLoading={cancellingSession === sessionToCancel.sessionNumber}
        />
      )}
    </div>
  );
};

export default ClassScheduleDetail;

