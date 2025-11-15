import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useContractStore } from "../../store/contract.store";
import { ContractSigningView } from "../../components/contract/ContractSigningView";
import { OTPVerificationModal } from "../../components/OTPVerificationModal";

const StudentContractDetailPage: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const {
    currentContract,
    isLoading,
    getContractById,
    respondToContract,
    initiateContractSigning,
    approveAndSignContract,
    isRespondingToContract,
  } = useContractStore();

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showApproveSignModal, setShowApproveSignModal] = useState(false);
  const [action, setAction] = useState<
    "APPROVE" | "REJECT" | "REQUEST_CHANGES"
  >("APPROVE");
  const [message, setMessage] = useState("");
  const [requestedChanges, setRequestedChanges] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for approve & sign
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [approveMessage, setApproveMessage] = useState("");

  useEffect(() => {
    if (contractId) {
      getContractById(contractId);
    }
  }, [contractId, getContractById]);

  // Handle approve & sign process
  const handleInitiateApproveSign = async () => {
    if (!contractId || !hasConsented) return;

    try {
      await initiateContractSigning(contractId, "student");
      setShowApproveSignModal(false);
      setShowOTPModal(true);
    } catch (error) {
      console.error("Failed to initiate approve & sign:", error);
    }
  };

  const handleResendOTP = async () => {
    if (!contractId) return;
    try {
      await initiateContractSigning(contractId, "student");
    } catch (error) {
      console.error("Failed to resend OTP:", error);
    }
  };

  const handleApproveAndSign = async (otpCode: string) => {
    if (!contractId) return;

    const consentText = `Tôi đã đọc, hiểu và đồng ý với tất cả các điều khoản trong hợp đồng này. Tôi xác nhận rằng việc ký kết này được thực hiện một cách tự nguyện và có đầy đủ năng lực hành vi dân sự. Ngày ký: ${new Date().toLocaleDateString(
      "vi-VN"
    )}`;

    try {
      await approveAndSignContract(contractId, {
        otpCode,
        consentText,
        message: approveMessage || undefined,
      });

      setShowOTPModal(false);
      // Navigate to contracts list or success page
      navigate("/student/contracts");
    } catch (error) {
      console.error("Failed to approve and sign contract:", error);
      throw error; // Let OTPModal handle the error display
    }
  };

  const handleSubmitResponse = async () => {
    if (!contractId) return;

    setIsSubmitting(true);
    try {
      await respondToContract(contractId, {
        action,
        message: message || undefined,
        requestedChanges:
          action === "REQUEST_CHANGES" ? requestedChanges : undefined,
      });
      setShowApprovalModal(false);
      setMessage("");
      setRequestedChanges("");
      // Refresh contract data
      getContractById(contractId);
    } catch (error) {
      // Error handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getDayOfWeekName = (day: number): string => {
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return days[day];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentContract) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy hợp đồng
        </h3>
        <Link
          to="/student/contracts"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const contract = currentContract;
  const canRespond = contract.status === "PENDING_STUDENT_APPROVAL";
  const isApproved = contract.status === "APPROVED";
  const isRejected = contract.status === "REJECTED";
  const isFullySigned = contract.isSigned && contract.isLocked;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/student/contracts")}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Quay lại danh sách hợp đồng
      </button>

      {/* Header Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 shadow-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <DocumentTextIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                {contract.title}
              </h1>
            </div>
            <p className="text-gray-600">
              Hợp đồng giảng dạy giữa học viên và gia sư
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end gap-2">
            {contract.status === "PENDING_STUDENT_APPROVAL" && (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                <ClockIcon className="w-4 h-4 mr-2" />
                Chờ phê duyệt
              </span>
            )}
            {isApproved && (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-300">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Đã phê duyệt
              </span>
            )}
            {isRejected && (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-300">
                <XCircleIcon className="w-4 h-4 mr-2" />
                Đã từ chối
              </span>
            )}
            {isFullySigned && (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                Đã ký kết
              </span>
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Gia sư
            </p>
            <p className="text-sm font-bold text-gray-900">
              {(contract.tutorId as any)?.full_name ||
                contract.tutor?.full_name ||
                "N/A"}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Tổng buổi học
            </p>
            <p className="text-sm font-bold text-gray-900">
              {contract.totalSessions} buổi
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Tổng chi phí
            </p>
            <p className="text-sm font-bold text-blue-600">
              {formatCurrency(contract.totalAmount)}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Ngày tạo
            </p>
            <p className="text-sm font-bold text-gray-900">
              {formatDate(contract.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Warning for Pending Approval */}
      {canRespond && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">
                Hợp đồng cần phê duyệt
              </h3>
              <p className="text-sm text-yellow-800 mb-4">
                Vui lòng xem xét kỹ các điều khoản trong hợp đồng trước khi phê
                duyệt. Sau khi phê duyệt, cả hai bên sẽ cần ký kết điện tử để
                hợp đồng có hiệu lực pháp lý.
              </p>
              {contract.expiresAt && (
                <p className="text-xs text-yellow-700">
                  ⏰ Hợp đồng sẽ tự động hết hạn vào:{" "}
                  {formatDate(contract.expiresAt)} lúc{" "}
                  {formatTime(contract.expiresAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contract Details */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Chi tiết hợp đồng</h2>
        </div>

        <div className="p-8 space-y-8">
          {/* Description */}
          {contract.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                Nội dung hợp đồng
              </h3>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                  {contract.description}
                </pre>
              </div>
            </div>
          )}

          {/* Course Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              Thông tin khóa học
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">
                  Tổng số buổi học
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {contract.totalSessions} buổi
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">
                  Thời lượng mỗi buổi
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {contract.sessionDuration} phút
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-2">
                  Học phí mỗi buổi
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(contract.pricePerSession)}
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-2">
                  Tổng chi phí
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(contract.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-blue-600" />
              Lịch học
            </h3>
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-purple-900">
                  Thời gian:
                </span>
                <span className="text-purple-800">
                  {contract.schedule.startTime} - {contract.schedule.endTime}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-purple-900">Các ngày:</span>
                <div className="flex flex-wrap gap-2">
                  {contract.schedule.dayOfWeek.map((day: number) => (
                    <span
                      key={day}
                      className="px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-sm font-medium"
                    >
                      {getDayOfWeekName(day)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-purple-900">Từ:</span>
                <span className="text-purple-800">
                  {formatDate(contract.startDate)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-purple-900">Đến:</span>
                <span className="text-purple-800">
                  {formatDate(contract.expectedEndDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Learning Mode & Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-blue-600" />
              Hình thức học
            </h3>
            {contract.learningMode === "ONLINE" ? (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <p className="font-semibold text-blue-900 mb-3">
                  🌐 Học trực tuyến (Online)
                </p>
                {contract.onlineInfo && (
                  <div className="space-y-2 text-sm">
                    <p className="text-blue-800">
                      <span className="font-medium">Nền tảng:</span>{" "}
                      {contract.onlineInfo.platform}
                    </p>
                    {contract.onlineInfo.meetingLink && (
                      <p className="text-blue-800">
                        <span className="font-medium">Link:</span>{" "}
                        <a
                          href={contract.onlineInfo.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-blue-600"
                        >
                          {contract.onlineInfo.meetingLink}
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <p className="font-semibold text-orange-900 mb-3">
                  🏠 Học tại nhà (Offline)
                </p>
                {contract.location && (
                  <p className="text-orange-800">
                    <span className="font-medium">Địa chỉ:</span>{" "}
                    {contract.location.address}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Parties */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Các bên tham gia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  Học viên (Bên B)
                </p>
                <p className="font-semibold text-gray-900 mb-1">
                  {(contract.studentId as any)?.full_name ||
                    contract.student?.full_name ||
                    "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {(contract.studentId as any)?.email ||
                    contract.student?.email ||
                    "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  Gia sư (Bên A)
                </p>
                <p className="font-semibold text-gray-900 mb-1">
                  {(contract.tutorId as any)?.full_name ||
                    contract.tutor?.full_name ||
                    "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {(contract.tutorId as any)?.email ||
                    contract.tutor?.email ||
                    "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Signing Section */}
      {isApproved && !isFullySigned && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Ký kết hợp đồng điện tử
          </h2>
          <ContractSigningView
            contract={contract}
            onSuccess={() => getContractById(contractId!)}
          />
        </div>
      )}

      {/* Student Response Section */}
      {contract.studentResponse && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Phản hồi của bạn
          </h2>
          <div
            className={`rounded-xl p-6 border-l-4 ${
              contract.studentResponse.action === "APPROVE"
                ? "bg-green-50 border-green-500"
                : contract.studentResponse.action === "REJECT"
                ? "bg-red-50 border-red-500"
                : "bg-yellow-50 border-yellow-500"
            }`}
          >
            <p className="font-semibold text-gray-900 mb-2">
              Hành động:{" "}
              {contract.studentResponse.action === "APPROVE"
                ? "Phê duyệt"
                : contract.studentResponse.action === "REJECT"
                ? "Từ chối"
                : "Yêu cầu thay đổi"}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Thời gian: {formatDate(contract.studentResponse.respondedAt)}
            </p>
            {contract.studentResponse.message && (
              <p className="text-gray-800 mb-2">
                <span className="font-medium">Tin nhắn:</span>{" "}
                {contract.studentResponse.message}
              </p>
            )}
            {contract.studentResponse.requestedChanges && (
              <p className="text-gray-800">
                <span className="font-medium">Yêu cầu thay đổi:</span>{" "}
                {contract.studentResponse.requestedChanges}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {canRespond && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Phê duyệt hợp đồng
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng chọn hành động phù hợp sau khi xem xét kỹ các điều khoản
            trong hợp đồng.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                setShowApproveSignModal(true);
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-xl transform hover:scale-105"
            >
              <CheckCircleIcon className="w-6 h-6" />
              Phê duyệt & Ký hợp đồng
            </button>
            <button
              onClick={() => {
                setAction("REQUEST_CHANGES");
                setShowApprovalModal(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white font-semibold rounded-xl hover:bg-yellow-700 transition-colors shadow-lg"
            >
              <ExclamationTriangleIcon className="w-5 h-5" />
              Yêu cầu chỉnh sửa
            </button>
            <button
              onClick={() => {
                setAction("REJECT");
                setShowApprovalModal(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg"
            >
              <XCircleIcon className="w-5 h-5" />
              Từ chối hợp đồng
            </button>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {action === "APPROVE"
                ? "Phê duyệt hợp đồng"
                : action === "REJECT"
                ? "Từ chối hợp đồng"
                : "Yêu cầu chỉnh sửa"}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tin nhắn (tùy chọn)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tin nhắn của bạn..."
                />
              </div>

              {action === "REQUEST_CHANGES" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yêu cầu thay đổi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={requestedChanges}
                    onChange={(e) => setRequestedChanges(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả chi tiết những thay đổi bạn muốn..."
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setMessage("");
                  setRequestedChanges("");
                }}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitResponse}
                disabled={
                  isSubmitting ||
                  (action === "REQUEST_CHANGES" && !requestedChanges)
                }
                className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                  action === "APPROVE"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : action === "REJECT"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
                }`}
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Approve & Sign Modal */}
      {showApproveSignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Phê duyệt & Ký hợp đồng điện tử
            </h3>

            <div className="space-y-6">
              {/* Consent Section */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-3">
                  📋 Cam kết pháp lý
                </h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Bằng việc thực hiện phê duyệt và ký kết, bạn xác nhận rằng:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Đã đọc, hiểu và đồng ý với tất cả điều khoản trong hợp đồng
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Thực hiện ký kết một cách tự nguyện và có đầy đủ năng lực
                    hành vi dân sự
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Chấp nhận chịu trách nhiệm pháp lý cho các điều khoản đã ký
                    kết
                  </li>
                </ul>

                <label className="flex items-start gap-3 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasConsented}
                    onChange={(e) => setHasConsented(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                  />
                  <span className="text-sm font-medium text-blue-900">
                    Tôi xác nhận đã đọc và đồng ý với các điều khoản trên
                  </span>
                </label>
              </div>

              {/* Optional Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tin nhắn cho gia sư (tùy chọn)
                </label>
                <textarea
                  value={approveMessage}
                  onChange={(e) => setApproveMessage(e.target.value)}
                  placeholder="Chia sẻ suy nghĩ của bạn về hợp đồng này..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Security Note */}
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Bảo mật cao
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      Mã OTP sẽ được gửi qua email để xác thực danh tính và đảm
                      bảo tính toàn vẹn của hợp đồng
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setShowApproveSignModal(false);
                  setHasConsented(false);
                  setApproveMessage("");
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleInitiateApproveSign}
                disabled={!hasConsented || isRespondingToContract}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRespondingToContract ? "Đang xử lý..." : "Tiếp tục ký kết"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && contract && (
        <OTPVerificationModal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          onVerify={handleApproveAndSign}
          onResend={handleResendOTP}
          email="your-email@example.com" // This should be from user context
          contractCode={`HĐ-${contract.id.substring(0, 8).toUpperCase()}`}
          role="student"
          expiresAt={new Date(Date.now() + 5 * 60 * 1000)} // 5 minutes from now
        />
      )}
    </div>
  );
};

export default StudentContractDetailPage;
