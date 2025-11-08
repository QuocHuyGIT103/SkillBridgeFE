import React, { useState } from "react";
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

const StudentAssignmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "submitted" | "completed">("pending");

  // Mock data
  const assignments = {
    pending: [
      {
        id: 1,
        title: "Bài tập Đại số - Phương trình bậc hai",
        subject: "Toán học",
        tutor: "Thầy Nguyễn Văn A",
        dueDate: "2024-09-18",
        dueTime: "23:59",
        description: "Giải các phương trình bậc hai và phân tích nghiệm",
        priority: "high",
        estimatedTime: "2 giờ",
        attachments: ["bai-tap-dai-so.pdf"],
        instructions: "Làm tất cả 10 bài tập trong file đính kèm. Ghi rõ cách giải.",
      },
      {
        id: 2,
        title: "Essay - My Future Career",
        subject: "Tiếng Anh",
        tutor: "Cô Sarah Johnson",
        dueDate: "2024-09-20",
        dueTime: "18:00",
        description: "Viết bài luận về nghề nghiệp tương lai",
        priority: "medium",
        estimatedTime: "1.5 giờ",
        attachments: [],
        instructions: "Viết một bài luận 300-400 từ về nghề nghiệp mơ ước của em.",
      },
    ],
    submitted: [
      {
        id: 3,
        title: "Bài tập Cơ học - Định luật Newton",
        subject: "Vật lý",
        tutor: "Cô Trần Thị B",
        submittedDate: "2024-09-14",
        submittedTime: "16:30",
        feedback: null,
        grade: null,
        submittedFiles: ["bai-giai-co-hoc.pdf"],
      },
    ],
    completed: [
      {
        id: 4,
        title: "Bài tập Hóa học - Phản ứng oxi hóa khử",
        subject: "Hóa học",
        tutor: "Thầy Lê Văn C",
        submittedDate: "2024-09-10",
        submittedTime: "14:20",
        grade: 8.5,
        feedback: "Bài làm tốt, em đã hiểu rõ về phản ứng oxi hóa khử. Cần chú ý thêm về cân bằng phương trình.",
        submittedFiles: ["bai-giai-hoa-hoc.pdf"],
      },
    ],
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Ưu tiên cao";
      case "medium":
        return "Ưu tiên trung bình";
      case "low":
        return "Ưu tiên thấp";
      default:
        return "Không xác định";
    }
  };

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
              <p className="text-2xl font-bold text-red-600">{assignments.pending.length}</p>
              <p className="text-sm text-gray-600">Chờ làm</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{assignments.submitted.length}</p>
              <p className="text-sm text-gray-600">Đã nộp</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{assignments.completed.length}</p>
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
            { key: "pending", label: "Chờ làm", count: assignments.pending.length },
            { key: "submitted", label: "Đã nộp", count: assignments.submitted.length },
            { key: "completed", label: "Hoàn thành", count: assignments.completed.length },
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
      <div className="space-y-4">
        {/* Pending Assignments */}
        {activeTab === "pending" && assignments.pending.map((assignment, index) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-gradient-to-r from-white to-blue-50 rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(assignment.priority)}`}>
                    {getPriorityText(assignment.priority)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center">
                    <BookOpenIcon className="w-4 h-4 mr-1" />
                    {assignment.subject}
                  </span>
                  <span className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    {assignment.tutor}
                  </span>
                  <span className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {assignment.estimatedTime}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{assignment.description}</p>
                <p className="text-sm text-gray-600 mb-4">{assignment.instructions}</p>
                
                {assignment.attachments.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">File đính kèm:</p>
                    <div className="space-y-1">
                      {assignment.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm text-blue-600">
                          <PaperClipIcon className="w-4 h-4" />
                          <span className="hover:underline cursor-pointer">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ml-6 text-right">
                <div className={`text-lg font-bold mb-1 ${
                  getDaysUntilDue(assignment.dueDate) <= 1 ? "text-red-600" : "text-gray-900"
                }`}>
                  {getDaysUntilDue(assignment.dueDate) === 0 ? "Hôm nay" : 
                   getDaysUntilDue(assignment.dueDate) === 1 ? "Ngày mai" :
                   `${getDaysUntilDue(assignment.dueDate)} ngày`}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                  {assignment.dueDate} - {assignment.dueTime}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  <span>Nộp bài</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Submitted Assignments */}
        {activeTab === "submitted" && assignments.submitted.map((assignment, index) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-gradient-to-r from-white to-green-50 rounded-xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <BookOpenIcon className="w-4 h-4 mr-1" />
                    {assignment.subject}
                  </span>
                  <span className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    {assignment.tutor}
                  </span>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    Đã nộp vào {assignment.submittedDate} lúc {assignment.submittedTime}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">File đã nộp:</p>
                  {assignment.submittedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm text-blue-600">
                      <PaperClipIcon className="w-4 h-4" />
                      <span className="hover:underline cursor-pointer">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="ml-6">
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full border border-yellow-200 mb-3">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                  Chờ chấm điểm
                </span>
                <div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>Xem chi tiết</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Completed Assignments */}
        {activeTab === "completed" && assignments.completed.map((assignment, index) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-gradient-to-r from-white to-emerald-50 rounded-xl p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <BookOpenIcon className="w-4 h-4 mr-1" />
                    {assignment.subject}
                  </span>
                  <span className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    {assignment.tutor}
                  </span>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800 mb-2">
                    <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                    Hoàn thành vào {assignment.submittedDate} lúc {assignment.submittedTime}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Phản hồi:</strong> {assignment.feedback}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">File đã nộp:</p>
                  {assignment.submittedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm text-blue-600">
                      <PaperClipIcon className="w-4 h-4" />
                      <span className="hover:underline cursor-pointer">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="ml-6 text-right">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {assignment.grade}/10
                </div>
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full border border-green-200 mb-3">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Hoàn thành
                </span>
                <div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>Xem chi tiết</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudentAssignmentsPage;
