import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface EligibilityRequirement {
  id: string;
  title: string;
  description: string;
  status: "completed" | "pending" | "missing";
  actionText?: string;
  actionPath?: string;
}

interface TutorPostEligibilityCheckProps {
  isEligible: boolean;
  requirements: EligibilityRequirement[];
  onClose: () => void;
  onProceed?: () => void;
  className?: string;
}

const TutorPostEligibilityCheck: React.FC<TutorPostEligibilityCheckProps> = ({
  isEligible,
  requirements,
  onClose,
  onProceed,
  className = "",
}) => {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "pending":
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50";
      case "pending":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-red-200 bg-red-50";
    }
  };

  const handleActionClick = (requirement: EligibilityRequirement) => {
    if (requirement.actionPath) {
      navigate(requirement.actionPath);
    }
  };

  const completedCount = requirements.filter(
    (req) => req.status === "completed"
  ).length;
  const totalCount = requirements.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${className}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {isEligible ? (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEligible
                    ? "Bạn đã đủ điều kiện đăng bài"
                    : "Cần hoàn thành các yêu cầu"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isEligible
                    ? "Tất cả các yêu cầu đã được đáp ứng. Bạn có thể tạo bài đăng mới."
                    : `Đã hoàn thành ${completedCount}/${totalCount} yêu cầu bắt buộc`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Đóng</span>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Tiến độ hoàn thành</span>
            <span>
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Requirements List */}
        <div className="p-6">
          <div className="space-y-4">
            {requirements.map((requirement) => (
              <div
                key={requirement.id}
                className={`rounded-lg border-2 p-4 transition-all duration-200 ${getStatusColor(
                  requirement.status
                )}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(requirement.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {requirement.title}
                      </h4>
                      <span
                        className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${
                          requirement.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : requirement.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      `}
                      >
                        {requirement.status === "completed"
                          ? "Hoàn thành"
                          : requirement.status === "pending"
                          ? "Chờ duyệt"
                          : "Chưa hoàn thành"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 mb-3">
                      {requirement.description}
                    </p>

                    {requirement.status !== "completed" &&
                      requirement.actionText && (
                        <button
                          onClick={() => handleActionClick(requirement)}
                          className={`
                          inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                          ${
                            requirement.status === "pending"
                              ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300"
                              : "text-white bg-blue-600 hover:bg-blue-700 border border-transparent"
                          }
                        `}
                        >
                          {requirement.actionText}
                          <svg
                            className="ml-1 w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="px-6 pb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <DocumentCheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Tại sao cần xác thực?
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Đảm bảo chất lượng giáo dục cho học viên</li>
                  <li>• Xây dựng niềm tin trong cộng đồng</li>
                  <li>• Bảo vệ thông tin cá nhân và an toàn</li>
                  <li>• Tuân thủ quy định pháp luật về giáo dục</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>

          {isEligible && onProceed && (
            <button
              onClick={() => {
                onProceed();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors"
            >
              Tiếp tục tạo bài đăng
            </button>
          )}

          {!isEligible && (
            <button
              onClick={() => navigate("/tutor/profile")}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
            >
              Hoàn thiện hồ sơ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data for testing - Replace with real data from API
export const getMockEligibilityData = () => {
  const requirements: EligibilityRequirement[] = [
    {
      id: "tutor-profile",
      title: "Hồ sơ gia sư đã được xác thực",
      description:
        "Thông tin cá nhân, kinh nghiệm giảng dạy và CCCD đã được xác minh",
      status: "completed", // Change to 'pending' or 'missing' for testing
      actionText: "Hoàn thiện hồ sơ",
      actionPath: "/tutor/profile",
    },
    {
      id: "education",
      title: "Có ít nhất 1 bằng cấp được xác thực",
      description: "Bằng cấp/chứng chỉ học vấn đã được kiểm tra và xác nhận",
      status: "completed", // Change for testing
      actionText: "Thêm bằng cấp",
      actionPath: "/tutor/qualifications?tab=education",
    },
    {
      id: "identity-verification",
      title: "Xác thực danh tính",
      description: "CCCD/CMND đã được xác minh để đảm bảo an toàn",
      status: "pending", // Change for testing
      actionText: "Chờ xác minh",
      actionPath: "/tutor/profile",
    },
  ];

  const completedCount = requirements.filter(
    (req) => req.status === "completed"
  ).length;
  const isEligible = completedCount === requirements.length;

  return { isEligible, requirements };
};

export default TutorPostEligibilityCheck;
