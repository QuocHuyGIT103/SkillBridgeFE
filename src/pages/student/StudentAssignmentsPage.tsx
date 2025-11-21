import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PaperClipIcon,
  CalendarDaysIcon,
  UserIcon,
  BookOpenIcon,
  ArrowUpTrayIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  ExclamationCircleIcon as ExclamationSolidIcon,
  ClockIcon as ClockSolidIcon,
} from "@heroicons/react/24/solid";
import { attendanceService } from "../../services/attendance.service";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface Assignment {
  id: string;
  classId: string;
  className: string;
  sessionNumber: number;
  scheduledDate: string;
  title: string;
  description: string;
  fileUrl?: string;
  deadline: string;
  assignedAt: string;
  tutor: {
    id: string;
    name: string;
    avatar?: string;
  };
  submission: {
    fileUrl: string;
    notes?: string;
    submittedAt: string;
  } | null;
  grade: {
    score: number;
    feedback?: string;
    gradedAt: string;
  } | null;
  status: "pending" | "submitted" | "completed";
  isLate: boolean;
  isOverdue: boolean;
}

const StudentAssignmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "submitted" | "completed">("pending");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    submitted: 0,
    completed: 0,
    total: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getStudentAssignments();
      if (response.data) {
        setAssignments(response.data.assignments || []);
        setStats({
          pending: response.data.pending || 0,
          submitted: response.data.submitted || 0,
          completed: response.data.completed || 0,
          total: response.data.total || 0,
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch assignments:", error);
      toast.error("Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (activeTab === "pending") return assignment.status === "pending";
    if (activeTab === "submitted") return assignment.status === "submitted";
    if (activeTab === "completed") return assignment.status === "completed";
    return false;
  });

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTabIcon = (tab: string, isActive: boolean) => {
    const className = `w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500"}`;
    
    switch (tab) {
      case "pending":
        return isActive ? <ClockSolidIcon className={className} /> : <ClockIcon className={className} />;
      case "submitted":
        return isActive ? <ExclamationSolidIcon className={className} /> : <ExclamationCircleIcon className={className} />;
      case "completed":
        return isActive ? <CheckCircleSolidIcon className={className} /> : <CheckCircleIcon className={className} />;
      default:
        return <DocumentTextIcon className={className} />;
    }
  };

  const handleViewAssignment = (assignment: Assignment) => {
    navigate(`/student/classes/${assignment.classId}/schedule`);
  };

  const handleSubmitAssignment = (assignment: Assignment) => {
    navigate(`/student/classes/${assignment.classId}/schedule`);
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bài tập</h1>
            <p className="text-gray-600">Quản lý và theo dõi bài tập được giao</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Chờ làm</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.submitted}</p>
              <p className="text-sm text-gray-600">Đã nộp</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-gray-600">Hoàn thành</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition-shadow"
      >
        <div className="flex space-x-1 bg-gradient-to-r from-blue-50 to-indigo-50 p-1 rounded-lg">
          {[
            { key: "pending", label: "Chờ làm", count: stats.pending },
            { key: "submitted", label: "Đã nộp", count: stats.submitted },
            { key: "completed", label: "Hoàn thành", count: stats.completed },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-white text-blue-600 shadow-md transform scale-105"
                  : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
              }`}
            >
              {getTabIcon(tab.key, activeTab === tab.key)}
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.key
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-200 text-gray-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Assignment List */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải bài tập...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có bài tập nào trong mục này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment, index) => {
            const daysUntilDue = getDaysUntilDue(assignment.deadline);
            const isUrgent = daysUntilDue <= 1 && assignment.status === "pending";
            
            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-200 ${
                  assignment.status === "pending"
                    ? "bg-gradient-to-r from-white to-blue-50 border-blue-100"
                    : assignment.status === "submitted"
                    ? "bg-gradient-to-r from-white to-green-50 border-green-100"
                    : "bg-gradient-to-r from-white to-emerald-50 border-emerald-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                      {isUrgent && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                          ⚠️ Gấp
                        </span>
                      )}
                      {assignment.isOverdue && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                          ⏰ Quá hạn
                        </span>
                      )}
                      {assignment.isLate && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Nộp trễ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center">
                        <BookOpenIcon className="w-4 h-4 mr-1" />
                        {assignment.className}
                      </span>
                      <span className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        {assignment.tutor.name}
                      </span>
                      <span className="flex items-center">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        Buổi {assignment.sessionNumber}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{assignment.description}</p>
                    
                    {assignment.fileUrl && (
                      <div className="mb-4">
                        <a
                          href={assignment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <PaperClipIcon className="w-4 h-4" />
                          <span className="hover:underline">Tài liệu đính kèm</span>
                        </a>
                      </div>
                    )}

                    {assignment.status === "submitted" && assignment.submission && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          <ClockIcon className="w-4 h-4 inline mr-1" />
                          Đã nộp vào {format(new Date(assignment.submission.submittedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </p>
                        {assignment.submission.fileUrl && (
                          <a
                            href={assignment.submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 mt-2"
                          >
                            <PaperClipIcon className="w-4 h-4" />
                            <span className="hover:underline">Xem bài nộp</span>
                          </a>
                        )}
                      </div>
                    )}

                    {assignment.status === "completed" && assignment.grade && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-green-800 mb-2">
                          <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                          Đã chấm điểm vào {format(new Date(assignment.grade.gradedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </p>
                        {assignment.grade.feedback && (
                          <p className="text-sm text-green-700">
                            <strong>Nhận xét:</strong> {assignment.grade.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 text-right">
                    {assignment.status === "pending" && (
                      <>
                        <div className={`text-lg font-bold mb-1 ${
                          isUrgent ? "text-red-600" : "text-gray-900"
                        }`}>
                          {daysUntilDue === 0 ? "Hôm nay" : 
                           daysUntilDue === 1 ? "Ngày mai" :
                           daysUntilDue < 0 ? "Quá hạn" :
                           `${daysUntilDue} ngày`}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                          {format(new Date(assignment.deadline), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSubmitAssignment(assignment)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg"
                        >
                          <ArrowUpTrayIcon className="w-4 h-4" />
                          <span>Nộp bài</span>
                        </motion.button>
                      </>
                    )}
                    {assignment.status === "submitted" && (
                      <>
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full border border-yellow-200 mb-3">
                          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                          Chờ chấm điểm
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewAssignment(assignment)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>Xem chi tiết</span>
                        </motion.button>
                      </>
                    )}
                    {assignment.status === "completed" && assignment.grade && (
                      <>
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {assignment.grade.score}/10
                        </div>
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full border border-green-200 mb-3">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Hoàn thành
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewAssignment(assignment)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>Xem chi tiết</span>
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentsPage;
