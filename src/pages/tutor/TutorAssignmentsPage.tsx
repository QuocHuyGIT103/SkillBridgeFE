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
  StarIcon,
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
  student: {
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
  status: "pending_submission" | "pending_grade" | "graded";
  isLate: boolean;
  isOverdue: boolean;
}

const TutorAssignmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pending_submission" | "pending_grade" | "graded">("pending_grade");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingSubmission: 0,
    pendingGrade: 0,
    graded: 0,
    total: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getTutorAssignments();

      if (response.data) {
        // Check if response.data has the expected structure
        if (response.data.success && response.data.data) {
          // Backend returns {success: true, data: {...}}
          const data = response.data.data;
          setAssignments(data.assignments || []);
          setStats({
            pendingSubmission: data.pendingSubmission || 0,
            pendingGrade: data.pendingGrade || 0,
            graded: data.graded || 0,
            total: data.total || 0,
          });
        } else if (response.data.assignments) {
          // Direct structure {assignments: [...], ...}
          setAssignments(response.data.assignments || []);
          setStats({
            pendingSubmission: response.data.pendingSubmission || 0,
            pendingGrade: response.data.pendingGrade || 0,
            graded: response.data.graded || 0,
            total: response.data.total || 0,
          });
        } else {
          toast.error("Dữ liệu trả về không đúng định dạng");
        }
      } else {
        toast.error("Không có dữ liệu trả về");
      }
    } catch (error: any) {
      console.error("Failed to fetch assignments:", error.message);
      toast.error("Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (activeTab === "pending_submission") return assignment.status === "pending_submission";
    if (activeTab === "pending_grade") return assignment.status === "pending_grade";
    if (activeTab === "graded") return assignment.status === "graded";
    return false;
  });

  const getTabIcon = (tab: string, isActive: boolean) => {
    const className = `w-5 h-5 ${isActive ? "text-purple-600" : "text-gray-500"}`;
    
    switch (tab) {
      case "pending_submission":
        return isActive ? <ClockSolidIcon className={className} /> : <ClockIcon className={className} />;
      case "pending_grade":
        return isActive ? <ExclamationSolidIcon className={className} /> : <ExclamationCircleIcon className={className} />;
      case "graded":
        return isActive ? <CheckCircleSolidIcon className={className} /> : <CheckCircleIcon className={className} />;
      default:
        return <DocumentTextIcon className={className} />;
    }
  };

  const handleViewAssignment = (assignment: Assignment) => {
    navigate(`/tutor/classes/${assignment.classId}/schedule`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-purple-50 hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý bài tập</h1>
            <p className="text-gray-600">Theo dõi và chấm điểm bài tập của học viên</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.pendingSubmission}</p>
              <p className="text-sm text-gray-600">Chờ nộp</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingGrade}</p>
              <p className="text-sm text-gray-600">Chờ chấm</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.graded}</p>
              <p className="text-sm text-gray-600">Đã chấm</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-purple-50 hover:shadow-md transition-shadow"
      >
        <div className="flex space-x-1 bg-gradient-to-r from-purple-50 to-indigo-50 p-1 rounded-lg">
          {[
            { key: "pending_submission", label: "Chờ nộp", count: stats.pendingSubmission },
            { key: "pending_grade", label: "Chờ chấm", count: stats.pendingGrade },
            { key: "graded", label: "Đã chấm", count: stats.graded },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-white text-purple-600 shadow-md transform scale-105"
                  : "text-gray-600 hover:text-purple-600 hover:bg-white/50"
              }`}
            >
              {getTabIcon(tab.key, activeTab === tab.key)}
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.key
                  ? "bg-purple-100 text-purple-600"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải bài tập...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có bài tập nào trong mục này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-200 ${
                assignment.status === "pending_submission"
                  ? "bg-gradient-to-r from-white to-blue-50 border-blue-100"
                  : assignment.status === "pending_grade"
                  ? "bg-gradient-to-r from-white to-yellow-50 border-yellow-100"
                  : "bg-gradient-to-r from-white to-emerald-50 border-emerald-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
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
                      {assignment.student.name}
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

                  {assignment.status === "pending_grade" && assignment.submission && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800 mb-2">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        Đã nộp vào {format(new Date(assignment.submission.submittedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </p>
                      {assignment.submission.fileUrl && (
                        <a
                          href={assignment.submission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <PaperClipIcon className="w-4 h-4" />
                          <span className="hover:underline">Xem bài nộp</span>
                        </a>
                      )}
                      {assignment.submission.notes && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Ghi chú:</strong> {assignment.submission.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {assignment.status === "graded" && assignment.grade && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-green-800 mb-2">
                        <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                        Đã chấm điểm vào {format(new Date(assignment.grade.gradedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="ml-6 text-right">
                  {assignment.status === "pending_submission" && (
                    <>
                      <div className="text-sm text-gray-600 mb-2">
                        <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                        Hạn: {format(new Date(assignment.deadline), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </div>
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full border border-blue-200">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Chờ học viên nộp
                      </span>
                    </>
                  )}
                  {assignment.status === "pending_grade" && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewAssignment(assignment)}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg mb-2"
                      >
                        <StarIcon className="w-4 h-4" />
                        <span>Chấm điểm</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewAssignment(assignment)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 w-full"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>Xem chi tiết</span>
                      </motion.button>
                    </>
                  )}
                  {assignment.status === "graded" && assignment.grade && (
                    <>
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {assignment.grade.score}/10
                      </div>
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full border border-green-200 mb-3">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Đã chấm
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewAssignment(assignment)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>Xem chi tiết</span>
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorAssignmentsPage;

