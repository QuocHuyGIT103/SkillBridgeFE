import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ExclamationTriangleIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  FlagIcon,
  DocumentTextIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface Complaint {
  id: string;
  complainantName: string;
  complainantEmail: string;
  againstName: string;
  againstEmail: string;
  type: "quality" | "behavior" | "payment" | "technical" | "other";
  title: string;
  description: string;
  evidenceFiles: string[];
  status: "pending" | "investigating" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  adminResponse?: string;
}

const ComplaintManagement: React.FC = () => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<
    "resolve" | "dismiss" | "investigate" | null
  >(null);
  const [adminResponse, setAdminResponse] = useState("");

  // Mock data
  const complaints: Complaint[] = [
    {
      id: "CPL-001",
      complainantName: "Nguyễn Văn An",
      complainantEmail: "nguyenvana@email.com",
      againstName: "Trần Thị Bình",
      againstEmail: "tranthib@email.com",
      type: "quality",
      title: "Gia sư không chuẩn bị bài giảng",
      description:
        "Gia sư Trần Thị Bình thường xuyên đến lớp mà không chuẩn bị bài giảng trước. Việc giảng dạy thiếu chuyên nghiệp và không đạt chất lượng mong đợi.",
      evidenceFiles: ["evidence1.pdf", "screenshot1.png"],
      status: "pending",
      priority: "high",
      createdAt: "2024-03-10 14:30:00",
    },
    {
      id: "CPL-002",
      complainantName: "Lê Thị Cúc",
      complainantEmail: "lethicuc@email.com",
      againstName: "Phạm Văn Đức",
      againstEmail: "phamvanduc@email.com",
      type: "behavior",
      title: "Gia sư có thái độ không phù hợp",
      description:
        "Gia sư thường xuyên đến muộn và có thái độ thiếu tôn trọng với học sinh. Đã nhiều lần nhắc nhở nhưng không thay đổi.",
      evidenceFiles: ["chat_log.txt"],
      status: "investigating",
      priority: "medium",
      createdAt: "2024-03-09 16:45:00",
    },
    {
      id: "CPL-003",
      complainantName: "Hoàng Văn Em",
      complainantEmail: "hoangvanem@email.com",
      againstName: "Vũ Thị Phương",
      againstEmail: "vuthiphuong@email.com",
      type: "payment",
      title: "Vấn đề về thanh toán",
      description:
        "Đã thanh toán đủ tiền học phí nhưng gia sư vẫn yêu cầu thanh toán thêm với lý do không rõ ràng.",
      evidenceFiles: ["payment_receipt.pdf", "message_screenshot.png"],
      status: "resolved",
      priority: "urgent",
      createdAt: "2024-03-08 10:20:00",
      adminResponse:
        "Đã xác minh và hoàn tiền cho học sinh. Gia sư đã được cảnh báo.",
    },
  ];

  const getTypeText = (type: string) => {
    switch (type) {
      case "quality":
        return "Chất lượng";
      case "behavior":
        return "Thái độ";
      case "payment":
        return "Thanh toán";
      case "technical":
        return "Kỹ thuật";
      case "other":
        return "Khác";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "quality":
        return "bg-blue-100 text-blue-800";
      case "behavior":
        return "bg-red-100 text-red-800";
      case "payment":
        return "bg-green-100 text-green-800";
      case "technical":
        return "bg-purple-100 text-purple-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "investigating":
        return "Đang điều tra";
      case "resolved":
        return "Đã giải quyết";
      case "dismissed":
        return "Đã bác bỏ";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "investigating":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "dismissed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "low":
        return "Thấp";
      case "medium":
        return "Trung bình";
      case "high":
        return "Cao";
      case "urgent":
        return "Khẩn cấp";
      default:
        return priority;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
    setActionType(null);
    setAdminResponse(complaint.adminResponse || "");
  };

  const handleAction = (
    complaint: Complaint,
    action: "resolve" | "dismiss" | "investigate"
  ) => {
    setSelectedComplaint(complaint);
    setActionType(action);
    setAdminResponse("");
    setShowModal(true);
  };

  const handleSubmitAction = () => {
    if (selectedComplaint && actionType) {
      console.log(
        `${actionType} complaint ${selectedComplaint.id} with response: ${adminResponse}`
      );
      // Implement API call here
      setShowModal(false);
      setSelectedComplaint(null);
      setActionType(null);
      setAdminResponse("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 mr-3 text-red-600" />
              Xử lý khiếu nại
            </h1>
            <p className="text-gray-600 mt-1">
              Xem xét và giải quyết các khiếu nại từ người dùng
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Khiếu nại chờ xử lý</p>
            <p className="text-2xl font-bold text-red-600">
              {complaints.filter((c) => c.status === "pending").length}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          {
            label: "Chờ xử lý",
            value: complaints.filter((c) => c.status === "pending").length,
            color: "yellow",
          },
          {
            label: "Đang điều tra",
            value: complaints.filter((c) => c.status === "investigating")
              .length,
            color: "blue",
          },
          {
            label: "Đã giải quyết",
            value: complaints.filter((c) => c.status === "resolved").length,
            color: "green",
          },
          {
            label: "Đã bác bỏ",
            value: complaints.filter((c) => c.status === "dismissed").length,
            color: "red",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                <ExclamationTriangleIcon
                  className={`w-6 h-6 text-${stat.color}-600`}
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Complaints List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="divide-y divide-gray-200">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {complaint.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {getStatusText(complaint.status)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                            complaint.priority
                          )}`}
                        >
                          {getPriorityText(complaint.priority)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {complaint.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-4 h-4" />
                          <span>
                            Người khiếu nại: {complaint.complainantName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FlagIcon className="w-4 h-4" />
                          <span>Bị khiếu nại: {complaint.againstName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                          complaint.type
                        )}`}
                      >
                        {getTypeText(complaint.type)}
                      </span>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>{complaint.evidenceFiles.length} tài liệu</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <ClockIcon className="w-4 h-4" />
                        <span>
                          {new Date(complaint.createdAt).toLocaleString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(complaint)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>Chi tiết</span>
                  </button>

                  {complaint.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleAction(complaint, "investigate")}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
                      >
                        <ClockIcon className="w-4 h-4" />
                        <span>Điều tra</span>
                      </button>
                      <button
                        onClick={() => handleAction(complaint, "resolve")}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
                      >
                        <CheckIcon className="w-4 h-4" />
                        <span>Giải quyết</span>
                      </button>
                      <button
                        onClick={() => handleAction(complaint, "dismiss")}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Bác bỏ</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {complaints.length === 0 && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Không có khiếu nại nào</p>
          </div>
        )}
      </motion.div>

      {/* Modal for complaint details/actions */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {actionType
                  ? `${
                      actionType === "resolve"
                        ? "Giải quyết"
                        : actionType === "dismiss"
                        ? "Bác bỏ"
                        : "Điều tra"
                    } khiếu nại`
                  : "Chi tiết khiếu nại"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Thông tin khiếu nại
                </h4>
                <p className="text-sm text-gray-600">
                  Mã: {selectedComplaint.id}
                </p>
                <p className="text-sm text-gray-600">
                  Tiêu đề: {selectedComplaint.title}
                </p>
                <p className="text-sm text-gray-600">
                  Loại: {getTypeText(selectedComplaint.type)}
                </p>
                <p className="text-sm text-gray-600">
                  Ưu tiên: {getPriorityText(selectedComplaint.priority)}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Mô tả</h4>
                <p className="text-sm text-gray-600">
                  {selectedComplaint.description}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Tài liệu đính kèm
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedComplaint.evidenceFiles.map((file, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Người khiếu nại
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedComplaint.complainantName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedComplaint.complainantEmail}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Bị khiếu nại
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedComplaint.againstName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedComplaint.againstEmail}
                  </p>
                </div>
              </div>
            </div>

            {actionType && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phản hồi của admin (bắt buộc)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Nhập phản hồi và quyết định xử lý..."
                />
              </div>
            )}

            {selectedComplaint.adminResponse && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">
                  Phản hồi trước đó
                </h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {selectedComplaint.adminResponse}
                </p>
              </div>
            )}

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {actionType ? "Hủy" : "Đóng"}
              </button>
              {actionType && (
                <button
                  onClick={handleSubmitAction}
                  disabled={!adminResponse.trim()}
                  className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionType === "resolve"
                      ? "bg-green-600 hover:bg-green-700"
                      : actionType === "dismiss"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {actionType === "resolve"
                    ? "Giải quyết"
                    : actionType === "dismiss"
                    ? "Bác bỏ"
                    : "Bắt đầu điều tra"}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
