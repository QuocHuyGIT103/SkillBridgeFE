import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDaysIcon,
  ClockIcon,
  VideoCameraIcon,
  MapPinIcon,
  AcademicCapIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useClassStore } from "../../store/class.store";
import WeeklyCalendar from "../../components/schedule/WeeklyCalendar";
import ClassScheduleDetailModal from "../../components/class/ClassScheduleDetailModal";

const StudentSchedulePage: React.FC = () => {
  const { studentClasses, fetchStudentClasses } = useClassStore();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentClasses();
  }, [fetchStudentClasses]);

  const filteredClasses = studentClasses.filter((cls) => {
    if (statusFilter === "ALL") return true;
    return cls.status === statusFilter;
  });

  const getDayName = (dayOfWeek: number) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[dayOfWeek];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Đang học";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "PAUSED":
        return "Tạm dừng";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <CalendarDaysIcon className="w-8 h-8 mr-3 text-blue-600" />
              Lịch học
            </h1>
            <p className="text-gray-600">
              Quản lý và theo dõi lịch học của bạn theo tuần
            </p>
          </div>
        </div>
      </motion.div>

      {/* Class List Section - MOVED TO TOP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
            Danh sách lớp học ({filteredClasses.length})
          </h2>

          <div className="flex items-center space-x-3">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang học</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="PAUSED">Tạm dừng</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls) => (
            <motion.div
              key={cls._id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedClassId(cls._id)}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all"
            >
              {/* Class Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                    {cls.subject.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Buổi {cls.completedSessions}/{cls.totalSessions}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                    cls.status
                  )}`}
                >
                  {getStatusText(cls.status)}
                </span>
              </div>

              {/* Tutor Info */}
              <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-blue-200">
                <img
                  src={
                    cls.tutorId.avatar_url || "https://via.placeholder.com/40"
                  }
                  alt={cls.tutorId.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate flex items-center">
                    <AcademicCapIcon className="w-4 h-4 mr-1" />
                    {cls.tutorId.full_name}
                  </p>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <CalendarDaysIcon className="w-4 h-4 mr-2" />
                  <span>
                    {cls.schedule.dayOfWeek
                      .map((d) => getDayName(d))
                      .join(", ")}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  <span>
                    {cls.schedule.startTime} - {cls.schedule.endTime}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  {cls.learningMode === "ONLINE" ? (
                    <>
                      <VideoCameraIcon className="w-4 h-4 mr-2" />
                      <span>Trực tuyến</span>
                    </>
                  ) : (
                    <>
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      <span>Trực tiếp</span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (cls.completedSessions / cls.totalSessions) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {statusFilter === "ALL"
                ? "Bạn chưa có lớp học nào"
                : "Không tìm thấy lớp học phù hợp"}
            </p>
          </div>
        )}
      </motion.div>

      {/* Weekly Calendar View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <WeeklyCalendar userRole="STUDENT" />
      </motion.div>

      {/* Class Schedule Detail Modal */}
      <AnimatePresence>
        {selectedClassId && (
          <ClassScheduleDetailModal
            classId={selectedClassId}
            userRole="STUDENT"
            onClose={() => setSelectedClassId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentSchedulePage;
