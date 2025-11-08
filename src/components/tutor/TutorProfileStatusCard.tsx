import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import type { TutorProfileStatusResponse } from "../../services/tutorProfile.service";
import type { TutorProfileVerification } from "../../types/tutor.types";

interface TutorProfileStatusCardProps {
  statusData: TutorProfileStatusResponse;
  profileData?: TutorProfileVerification | null;
  showActions?: boolean; // default true; set false to hide action buttons
}

const TutorProfileStatusCard: React.FC<TutorProfileStatusCardProps> = ({
  statusData,
  profileData,
  showActions = true,
}) => {
  const { canOperate, profileStatus, verifiedAt } = statusData;

  // Determine display based on status
  const getStatusConfig = () => {
    switch (profileStatus) {
      case "VERIFIED":
        return {
          title: "Hồ sơ đã được xác thực",
          message: "Bạn đã đủ điều kiện hành nghề gia sư!",
          icon: ShieldCheckIcon,
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
          borderColor: "border-green-100",
          gradient: "from-green-50 to-emerald-50",
          badge: {
            text: "Đã xác thực",
            bg: "bg-green-100",
            color: "text-green-700",
          },
          showVerifiedDate: true,
          actions: [
            {
              label: "Xem hồ sơ đầy đủ",
              href: "/tutor/profile/personal",
              icon: PencilSquareIcon,
              variant: "primary" as const,
            },
          ],
        };

      case "PENDING":
        return {
          title: "Hồ sơ đang chờ xác thực",
          message:
            "Hồ sơ của bạn đang được admin xem xét. Vui lòng chờ thông báo.",
          icon: ClockIcon,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          borderColor: "border-blue-100",
          gradient: "from-blue-50 to-indigo-50",
          badge: {
            text: "Đang chờ duyệt",
            bg: "bg-blue-100",
            color: "text-blue-700",
          },
          showVerifiedDate: false,
          actions: [],
        };

      case "REJECTED":
        return {
          title: "Hồ sơ bị từ chối",
          message:
            profileData?.rejection_reason || "Vui lòng chỉnh sửa và gửi lại.",
          icon: XCircleIcon,
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          borderColor: "border-red-100",
          gradient: "from-red-50 to-pink-50",
          badge: {
            text: "Bị từ chối",
            bg: "bg-red-100",
            color: "text-red-700",
          },
          showVerifiedDate: false,
          actions: [
            {
              label: "Chỉnh sửa hồ sơ",
              href: "/tutor/profile/personal",
              icon: PencilSquareIcon,
              variant: "danger" as const,
            },
          ],
        };

      case "DRAFT":
      default:
        // Check if profile has required fields
        const hasHeadline = profileData?.headline?.trim();
        const hasIntroduction = profileData?.introduction?.trim();
        const hasExperience = profileData?.teaching_experience?.trim();

        const missingFields: string[] = [];
        if (!hasHeadline) missingFields.push("Tiêu đề giới thiệu");
        if (!hasIntroduction) missingFields.push("Phần giới thiệu");
        if (!hasExperience) missingFields.push("Kinh nghiệm giảng dạy");

        return {
          title: "Hồ sơ chưa hoàn thiện",
          message:
            missingFields.length > 0
              ? `Vui lòng hoàn thiện: ${missingFields.join(", ")},....`
              : "Vui lòng gửi yêu cầu xác thực để hành nghề.",
          icon: ExclamationTriangleIcon,
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          borderColor: "border-amber-100",
          gradient: "from-amber-50 to-yellow-50",
          badge: {
            text: "Chưa hoàn thiện",
            bg: "bg-amber-100",
            color: "text-amber-700",
          },
          showVerifiedDate: false,
          actions: [
            {
              label:
                missingFields.length > 0 ? "Hoàn thiện hồ sơ" : "Gửi xác thực",
              href: "/tutor/profile/personal",
              icon: PencilSquareIcon,
              variant: "warning" as const,
            },
          ],
        };
    }
  };

  const config = getStatusConfig();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getButtonClass = (variant: "primary" | "danger" | "warning") => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 text-white hover:bg-blue-700";
      case "danger":
        return "bg-red-600 text-white hover:bg-red-700";
      case "warning":
        return "bg-amber-600 text-white hover:bg-amber-700";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${config.gradient} rounded-xl p-6 border ${config.borderColor}`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 ${config.iconBg} rounded-lg`}>
          <config.icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {config.title}
            </h3>
            <span
              className={`px-3 py-1 ${config.badge.bg} ${config.badge.color} text-xs font-medium rounded-full`}
            >
              {config.badge.text}
            </span>
          </div>

          <p className="text-gray-700 mb-3">{config.message}</p>

          {/* Verified Date */}
          {config.showVerifiedDate && verifiedAt && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span>Xác thực lúc: {formatDate(verifiedAt)}</span>
            </div>
          )}

          {/* Operation Status Info */}
          <div className="flex flex-wrap gap-4 text-sm mb-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Có thể hành nghề:</span>
              <span
                className={
                  canOperate ? "text-green-600 font-semibold" : "text-red-600"
                }
              >
                {canOperate ? "Có" : "Chưa"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Trạng thái:</span>
              <span className="text-gray-700">{config.badge.text}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && config.actions.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {config.actions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className={`inline-flex items-center space-x-2 ${getButtonClass(
                    action.variant
                  )} px-4 py-2 rounded-lg transition-colors text-sm font-medium`}
                >
                  <action.icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TutorProfileStatusCard;
