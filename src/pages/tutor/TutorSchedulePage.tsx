import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  MapPinIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useClassStore } from "../../store/class.store";
import ClassScheduleDetailModal from "../../components/class/ClassScheduleDetailModal";

const TutorSchedulePage: React.FC = () => {
  const { tutorClasses, loading, fetchTutorClasses } = useClassStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    fetchTutorClasses();
  }, [fetchTutorClasses]);

  const filteredClasses = tutorClasses.filter((cls) => {
    const matchesSearch =
      cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.studentId.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || cls.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeClasses = tutorClasses.filter(c => c.status === 'ACTIVE');
  const totalStudents = new Set(tutorClasses.map(c => c.studentId.id)).size;
  const totalSessions = tutorClasses.reduce((sum, c) => sum + c.totalSessions, 0);
  const completedSessions = tutorClasses.reduce((sum, c) => sum + c.completedSessions, 0);
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

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
        return "Đang dạy";
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

  const getDayName = (dayOfWeek: number) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[dayOfWeek];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý lịch học
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý và theo dõi các lớp học của bạn ({filteredClasses.length} lớp)
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Lớp đang dạy",
              value: activeClasses.length,
              icon: CalendarIcon,
              color: "blue",
            },
            {
              label: "Tổng học viên",
              value: totalStudents,
              icon: UserGroupIcon,
              color: "green",
            },
            {
              label: "Tổng buổi học",
              value: `${completedSessions}/${totalSessions}`,
              icon: BookOpenIcon,
              color: "indigo",
            },
            {
              label: "Tỷ lệ hoàn thành",
              value: `${completionRate}%`,
              icon: ChartBarIcon,
              color: "purple",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filter & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm lớp học, học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang dạy</option>
            <option value="PAUSED">Tạm dừng</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </motion.div>

      {/* Classes Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CalendarDaysIcon className="w-5 h-5 mr-2" />
          Danh sách lớp học
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "ALL"
                ? "Không tìm thấy lớp học phù hợp"
                : "Bạn chưa có lớp học nào"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((cls) => (
              <motion.div
                key={cls._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-white to-indigo-50 border border-indigo-100 rounded-lg p-5 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedClassId(cls._id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                      {cls.title}
                    </h3>
                    <p className="text-sm text-gray-600">{cls.subject.name}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      cls.status
                    )}`}
                  >
                    {getStatusText(cls.status)}
                  </span>
                </div>

                {/* Student Info */}
                <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-indigo-100">
                  <img
                    src={cls.studentId.avatar_url || "https://via.placeholder.com/40"}
                    alt={cls.studentId.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {cls.studentId.full_name}
                    </p>
                    <p className="text-xs text-gray-500">Học viên</p>
                  </div>
                </div>

                {/* Schedule Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <CalendarDaysIcon className="w-4 h-4 mr-2" />
                    <span>
                      {cls.schedule.dayOfWeek.map(d => getDayName(d)).join(", ")}
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

                {/* Progress */}
                <div className="mt-4 pt-4 border-t border-indigo-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Tiến độ</span>
                    <span className="font-medium text-indigo-600">
                      {cls.completedSessions}/{cls.totalSessions} buổi
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(cls.completedSessions / cls.totalSessions) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClassId(cls._id);
                  }}
                >
                  Xem lịch chi tiết
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Schedule Detail Modal */}
      <AnimatePresence>
        {selectedClassId && (
          <ClassScheduleDetailModal
            classId={selectedClassId}
            onClose={() => setSelectedClassId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TutorSchedulePage;
