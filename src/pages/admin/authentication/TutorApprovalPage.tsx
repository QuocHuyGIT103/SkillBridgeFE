import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardDocumentCheckIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  DocumentIcon,
  AcademicCapIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface TutorApplication {
  id: string;
  tutorName: string;
  email: string;
  phone: string;
  specializations: string[];
  experience: string;
  education: string;
  certificates: Certificate[];
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
}

interface Certificate {
  id: string;
  name: string;
  institution: string;
  fileUrl: string;
  issueDate: string;
}

const TutorApprovalPage: React.FC = () => {
  const [selectedApplication, setSelectedApplication] =
    useState<TutorApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [adminNotes, setAdminNotes] = useState("");

  // Mock data
  const applications: TutorApplication[] = [
    {
      id: "1",
      tutorName: "Nguyễn Văn Minh",
      email: "nguyenvanminh@email.com",
      phone: "0912345678",
      specializations: ["Toán học", "Vật lý"],
      experience: "5 năm kinh nghiệm giảng dạy tại trung tâm gia sư",
      education: "Thạc sĩ Toán học - Đại học Bách Khoa",
      certificates: [
        {
          id: "1",
          name: "Bằng Thạc sĩ Toán học",
          institution: "Đại học Bách Khoa Hà Nội",
          fileUrl: "/certificates/cert1.pdf",
          issueDate: "2020-06-15",
        },
        {
          id: "2",
          name: "Chứng chỉ giảng dạy",
          institution: "Bộ Giáo dục và Đào tạo",
          fileUrl: "/certificates/cert2.pdf",
          issueDate: "2021-03-10",
        },
      ],
      submittedAt: "2024-03-08 10:30",
      status: "pending",
    },
    {
      id: "2",
      tutorName: "Trần Thị Lan",
      email: "tranthilan@email.com",
      phone: "0987654321",
      specializations: ["Tiếng Anh", "IELTS"],
      experience: "3 năm giảng dạy tiếng Anh tại trường quốc tế",
      education: "Cử nhân Ngôn ngữ Anh - Đại học Ngoại ngữ",
      certificates: [
        {
          id: "3",
          name: "Bằng Cử nhân Ngôn ngữ Anh",
          institution: "Đại học Ngoại ngữ Hà Nội",
          fileUrl: "/certificates/cert3.pdf",
          issueDate: "2019-07-20",
        },
        {
          id: "4",
          name: "Chứng chỉ IELTS 8.0",
          institution: "British Council",
          fileUrl: "/certificates/cert4.pdf",
          issueDate: "2020-02-15",
        },
      ],
      submittedAt: "2024-03-07 14:45",
      status: "pending",
    },
  ];

  const handleViewDetails = (application: TutorApplication) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleAction = (
    application: TutorApplication,
    action: "approve" | "reject"
  ) => {
    setSelectedApplication(application);
    setActionType(action);
    setAdminNotes("");
    setShowModal(true);
  };

  const handleSubmitAction = () => {
    if (selectedApplication && actionType) {
      console.log(
        `${actionType} application ${selectedApplication.id} with notes: ${adminNotes}`
      );
      // Implement API call here
      setShowModal(false);
      setSelectedApplication(null);
      setActionType(null);
      setAdminNotes("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Đã từ chối";
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
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ClipboardDocumentCheckIcon className="w-8 h-8 mr-3 text-orange-600" />
              Duyệt hồ sơ gia sư
            </h1>
            <p className="text-gray-600 mt-1">
              Xem xét và phê duyệt các hồ sơ đăng ký gia sư
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng hồ sơ chờ duyệt</p>
            <p className="text-2xl font-bold text-orange-600">
              {applications.filter((app) => app.status === "pending").length}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Applications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="divide-y divide-gray-200">
          {applications.map((application) => (
            <div key={application.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.tutorName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        {application.phone}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {getStatusText(application.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Chuyên môn
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {application.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Học vấn
                      </h4>
                      <p className="text-sm text-gray-600">
                        {application.education}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Kinh nghiệm
                    </h4>
                    <p className="text-sm text-gray-600">
                      {application.experience}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Bằng cấp & Chứng chỉ ({application.certificates.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {application.certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg"
                        >
                          <DocumentIcon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            {cert.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>Nộp lúc: {application.submittedAt}</span>
                    </div>
                  </div>
                </div>

                {application.status === "pending" && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(application)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>Chi tiết</span>
                    </button>
                    <button
                      onClick={() => handleAction(application, "approve")}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>Duyệt</span>
                    </button>
                    <button
                      onClick={() => handleAction(application, "reject")}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-1"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Từ chối</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Không có hồ sơ nào cần duyệt</p>
          </div>
        )}
      </motion.div>

      {/* Modal for action confirmation */}
      {showModal && selectedApplication && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">
              {actionType === "approve" ? "Duyệt hồ sơ" : "Từ chối hồ sơ"}
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn có chắc chắn muốn{" "}
              {actionType === "approve" ? "duyệt" : "từ chối"} hồ sơ của{" "}
              <strong>{selectedApplication.tutorName}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú {actionType === "reject" ? "(bắt buộc)" : "(tùy chọn)"}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  actionType === "approve"
                    ? "Ghi chú thêm về việc duyệt..."
                    : "Lý do từ chối (bắt buộc)..."
                }
              />
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitAction}
                disabled={actionType === "reject" && !adminNotes.trim()}
                className={`px-4 py-2 text-sm text-white rounded-lg ${
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionType === "approve" ? "Duyệt" : "Từ chối"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TutorApprovalPage;
