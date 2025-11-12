import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { attendanceService } from '../../services/attendance.service';
import type { WeeklySession } from '../../types/attendance';
import { toast } from 'react-hot-toast';
import HomeworkModal from '../modals/HomeworkModal';

interface WeeklyCalendarProps {
  userRole: 'TUTOR' | 'STUDENT';
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<WeeklySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [weekEnd, setWeekEnd] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<WeeklySession | null>(null);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);

  useEffect(() => {
    fetchWeeklySchedule();
  }, [currentDate]);

  const fetchWeeklySchedule = async () => {
    setLoading(true);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const response = await attendanceService.getWeeklySchedule(dateStr);

      setSessions(response.data.sessions);
      setWeekStart(new Date(response.data.weekStart));
      setWeekEnd(new Date(response.data.weekEnd));
    } catch (error: any) {
      console.error('Failed to fetch weekly schedule:', error);
      toast.error('Không thể tải lịch học tuần');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (classId: string, sessionNumber: number) => {
    try {
      const response = await attendanceService.markAttendance(classId, sessionNumber);
      toast.success(response.message || 'Điểm danh thành công');

      // Refresh schedule
      fetchWeeklySchedule();

      if (response.data.bothAttended) {
        toast.success('Cả 2 đã điểm danh! Có thể vào lớp học.', {
          duration: 5000,
          icon: '🎉',
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Điểm danh thất bại');
    }
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentDate(new Date());
  };

  const handleOpenHomework = (session: WeeklySession) => {
    setSelectedSession(session);
    setShowHomeworkModal(true);
  };

  const handleCloseHomework = () => {
    setShowHomeworkModal(false);
    setSelectedSession(null);
  };

  const handleHomeworkSuccess = async () => {
    await fetchWeeklySchedule(); // Refresh to get updated homework status
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayOfWeek];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getSessionsForDay = (dayOfWeek: number) => {
    return sessions.filter(s => s.dayOfWeek === dayOfWeek);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'MISSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Week Navigation */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lịch học theo tuần</h2>
            {weekStart && weekEnd && (
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(weekStart)} - {formatDate(weekEnd)}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousWeek}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Tuần trước"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={goToCurrentWeek}
              className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium transition-colors"
            >
              Hôm nay
            </button>

            <button
              onClick={goToNextWeek}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Tuần sau"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
          const daySessions = getSessionsForDay(dayOfWeek);

          // Calculate the actual date for this day column
          // weekStart is always Monday (dayOfWeek = 1) based on backend logic
          let isToday = false;
          if (weekStart) {
            const today = new Date();
            const dayDate = new Date(weekStart);

            // Calculate days to add from Monday (weekStart) to target dayOfWeek
            // Monday = 1, Tuesday = 2, ..., Sunday = 0
            let dayDiff = 0;
            if (dayOfWeek === 0) {
              // Sunday is 6 days after Monday
              dayDiff = 6;
            } else {
              // Other days: dayOfWeek - 1 (e.g., Tuesday (2) = 1 day after Monday)
              dayDiff = dayOfWeek - 1;
            }

            dayDate.setDate(weekStart.getDate() + dayDiff);

            // Compare only date (year, month, day), not time
            isToday =
              dayDate.getFullYear() === today.getFullYear() &&
              dayDate.getMonth() === today.getMonth() &&
              dayDate.getDate() === today.getDate();
          }

          return (
            <motion.div
              key={dayOfWeek}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayOfWeek * 0.05 }}
              className={`bg-white rounded-xl shadow-sm border ${isToday ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100'
                }`}
            >
              {/* Day Header */}
              <div className={`p-4 border-b ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className="text-center">
                  <div className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                    {getDayName(dayOfWeek)}
                  </div>
                  {isToday && (
                    <div className="text-xs text-blue-500 mt-1">Hôm nay</div>
                  )}
                </div>
              </div>

              {/* Sessions List */}
              <div className="p-3 space-y-3 min-h-[200px]">
                {daySessions.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Không có lịch học</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {daySessions.map((session, idx) => (
                      <motion.div
                        key={`${session.classId}-${session.sessionNumber}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100 hover:shadow-md transition-all"
                      >
                        {/* Session Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4
                              onClick={() => {
                                if (userRole === 'STUDENT') {
                                  navigate(`/student/classes/${session.classId}/schedule`);
                                } else {
                                  navigate(`/tutor/classes/${session.classId}/schedule`);
                                }
                              }}
                              className="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                              title="Click để xem chi tiết lớp học"
                            >
                              {session.className}
                            </h4>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <ClockIcon className="w-3 h-3 mr-1" />
                              {session.timeSlot}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeColor(session.status)
                            }`}>
                            Buổi {session.sessionNumber}
                          </span>
                        </div>

                        {/* Attendance Status */}
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${session.attendance.tutorAttended ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                            <span className="text-xs text-gray-600">Gia sư</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${session.attendance.studentAttended ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                            <span className="text-xs text-gray-600">Học viên</span>
                          </div>
                        </div>

                        {/* Removed homework badges from calendar item as requested */}

                        {/* Action Buttons */}
                        <div className="space-y-1.5">
                          {/* Show Attendance Button if user hasn't attended yet */}
                          {!session.attendance[userRole === 'TUTOR' ? 'tutorAttended' : 'studentAttended'] && (
                            <button
                              onClick={() => handleAttendance(session.classId, session.sessionNumber)}
                              disabled={!session.canAttend}
                              className={`w-full px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center space-x-1 ${session.canAttend
                                ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              {(() => {
                                const now = new Date();
                                const start = new Date(session.scheduledDate);
                                const end = new Date(start.getTime() + (session.duration || 0) * 60000);
                                const isPast = now > end;
                                return <span>{session.canAttend ? 'Điểm danh' : (isPast ? 'Đã quá giờ' : 'Chưa đến giờ')}</span>;
                              })()}
                            </button>
                          )}

                          {/* Show Join Button if both attended */}
                          {session.canJoin && session.meetingLink && (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center space-x-1"
                            >
                              <VideoCameraIcon className="w-4 h-4" />
                              <span>Vào phòng học</span>
                            </a>
                          )}

                          {/* Waiting State - User attended but other hasn't */}
                          {session.attendance[userRole === 'TUTOR' ? 'tutorAttended' : 'studentAttended'] && !session.canJoin && (
                            <div className="w-full px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg flex items-center justify-center space-x-1">
                              <UserGroupIcon className="w-4 h-4" />
                              <span>Chờ {userRole === 'TUTOR' ? 'học viên' : 'gia sư'}</span>
                            </div>
                          )}

                          {/* Homework Button - Show after session is completed or both attended */}
                          {(session.status === 'COMPLETED' || session.canJoin) && (
                            <button
                              onClick={() => handleOpenHomework(session)}
                              className="w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center space-x-1"
                            >
                              <DocumentTextIcon className="w-4 h-4" />
                              <span>
                                {userRole === 'TUTOR'
                                  ? session.homework.hasAssignment
                                    ? 'Quản lý bài tập'
                                    : 'Giao bài tập'
                                  : session.homework.hasAssignment
                                    ? 'Xem bài tập'
                                    : 'Chưa có bài tập'}
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Location/Meeting Info */}
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          {session.learningMode === 'ONLINE' ? (
                            <div className="flex items-center text-xs text-gray-600">
                              <VideoCameraIcon className="w-3 h-3 mr-1" />
                              <span>
                                Trực tuyến{!session.meetingLink ? ' • Chưa có link' : ''}
                              </span>
                            </div>
                          ) : session.location ? (
                            <div className="flex items-center text-xs text-gray-600">
                              <MapPinIcon className="w-3 h-3 mr-1" />
                              <span className="truncate">
                                {session.location.details || (session as any).location?.address || 'Trực tiếp'}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
            <div className="text-sm text-gray-600 mt-1">Tổng buổi học</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter(s => s.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Đã hoàn thành</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {sessions.filter(s => s.status === 'SCHEDULED').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Sắp diễn ra</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {sessions.filter(s => s.homework.assignment && s.homework.assignment.title).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Có bài tập</div>
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
    </div>
  );
};

export default WeeklyCalendar;
